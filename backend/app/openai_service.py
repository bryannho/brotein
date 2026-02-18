import base64
import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

# Load .env from project root (two levels up from this file)
_project_root = Path(__file__).resolve().parent.parent.parent
load_dotenv(_project_root / ".env")

_SYSTEM_PROMPT = """\
You are a nutrition extraction engine. Your job is to extract calories \
and macro nutrients from meal descriptions and nutrition label images.

Here are reference examples showing how to break down meals and estimate macros:

Example 1 — Single whole food:
Input: "1 large egg, scrambled"
Reasoning: 1 large scrambled egg (~50g): 91 cal, 6.3g protein, 0.6g carbs, 6.7g fat, 0.6g sugar.
Output: {"calories": 91, "protein": 6.3, "carbs": 0.6, "fat": 6.7, "sugar": 0.6}

Example 2 — Restaurant meal:
Input: "Chipotle chicken burrito bowl with white rice, black beans, fajita veggies, tomato salsa, cheese, sour cream"
Reasoning: White rice (4oz): 170 cal, 3g P, 37g C, 0.5g F, 0g S. Black beans (4oz): 120 cal, 7g P, 22g C, 0.5g F, 0g S. Chicken (4oz): 180 cal, 32g P, 0g C, 4g F, 0g S. Fajita veggies (2.5oz): 20 cal, 1g P, 4g C, 0g F, 2g S. Tomato salsa (4oz): 25 cal, 1g P, 4g C, 0g F, 3g S. Cheese (1oz): 110 cal, 7g P, 1g C, 9g F, 0g S. Sour cream (2oz): 60 cal, 1g P, 1g C, 5g F, 1g S. Total: 685 cal, 52g P, 69g C, 19g F, 6g S.
Output: {"calories": 685, "protein": 52.0, "carbs": 69.0, "fat": 19.0, "sugar": 6.0}

Example 3 — Common food:
Input: "2 slices pepperoni pizza"
Reasoning: 1 slice pepperoni pizza (~107g, 14" regular crust): 298 cal, 13g P, 34g C, 12g F, 4g S. 2 slices: 596 cal, 26g P, 68g C, 24g F, 8g S.
Output: {"calories": 596, "protein": 26.0, "carbs": 68.0, "fat": 24.0, "sugar": 8.0}

Example 4 — Packaged supplement:
Input: "1 scoop whey protein powder mixed with water"
Reasoning: 1 scoop whey protein (~31g serving): 120 cal, 24g P, 3g C, 1.5g F, 1g S. Water adds nothing.
Output: {"calories": 120, "protein": 24.0, "carbs": 3.0, "fat": 1.5, "sugar": 1.0}

Example 5 — Home-cooked with measured portions:
Input: "6oz grilled salmon with 1 cup steamed broccoli"
Reasoning: 6oz grilled Atlantic salmon: 311 cal, 34g P, 0g C, 18.5g F, 0g S. 1 cup steamed broccoli (~156g): 55 cal, 3.7g P, 11g C, 0.6g F, 2.2g S. Total: 366 cal, 37.7g P, 11g C, 19.1g F, 2.2g S.
Output: {"calories": 366, "protein": 37.7, "carbs": 11.0, "fat": 19.1, "sugar": 2.2}"""

_USER_PROMPT = """\
Extract nutritional information from the provided input.

You may receive:
- a meal description (text),
- an image (nutrition label, meal photo, screenshot),
- or both.

Before calculating final values, think step by step:
1. Break the meal into individual ingredients with estimated portions
2. Estimate macros for each ingredient separately
3. Sum all ingredients for final totals

Put your step-by-step breakdown in the "reasoning" field.

Rules:
- If all values are confidently determined, set error to "".
- For meal descriptions (e.g. "chipotle chicken bowl"), estimate the macros \
based on typical nutritional data for that food. This is expected and not guessing.
- If a meal text description was provided by the user, set description to that exact text.
- If only an image was provided with no text description, generate a brief, \
natural meal description (e.g. "Grilled chicken breast with steamed broccoli and brown rice").
- If the input is truly ambiguous or unrelated to food, set error to a descriptive message."""

_RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "nutrition_extraction",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "calories": {"type": "integer"},
                "protein": {"type": "number"},
                "carbs": {"type": "number"},
                "fat": {"type": "number"},
                "sugar": {"type": "number"},
                "description": {"type": "string"},
                "reasoning": {"type": "string"},
                "error": {"type": "string"},
            },
            "required": [
                "calories",
                "protein",
                "carbs",
                "fat",
                "sugar",
                "description",
                "reasoning",
                "error",
            ],
            "additionalProperties": False,
        },
    },
}

_MAX_RETRIES = 2


@dataclass
class ExtractionResult:
    calories: int
    protein: float
    carbs: float
    fat: float
    sugar: float
    error: str
    description: str = ""


def _build_messages(
    text: str | None, image_bytes: bytes | None
) -> list[dict]:
    """Build the messages array for the OpenAI chat completion request."""
    messages: list[dict] = [
        {"role": "system", "content": _SYSTEM_PROMPT},
    ]

    user_content: list[dict] = [{"type": "text", "text": _USER_PROMPT}]

    if text:
        user_content.append({"type": "text", "text": f"\nMeal description: {text}"})

    if image_bytes:
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        user_content.append(
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{b64}",
                },
            }
        )

    messages.append({"role": "user", "content": user_content})
    return messages


async def _call_openai(
    text: str | None, image_bytes: bytes | None
) -> ExtractionResult:
    """Call the OpenAI API and parse the structured JSON response."""
    client = AsyncOpenAI()
    messages = _build_messages(text, image_bytes)

    logger.info("Calling OpenAI gpt-4o (text=%s, has_image=%s)", repr(text), image_bytes is not None)

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0,
        response_format=_RESPONSE_FORMAT,
    )

    raw = response.choices[0].message.content or ""
    logger.info("OpenAI raw response: %s", raw)

    data = json.loads(raw)

    # Log the reasoning for debugging but don't store it
    reasoning = data.get("reasoning", "")
    if reasoning:
        logger.info("Model reasoning: %s", reasoning)

    result = ExtractionResult(
        calories=int(data.get("calories", 0)),
        protein=float(data.get("protein", 0.0)),
        carbs=float(data.get("carbs", 0.0)),
        fat=float(data.get("fat", 0.0)),
        sugar=float(data.get("sugar", 0.0)),
        error=str(data.get("error", "")),
        description=str(data.get("description", "")),
    )
    logger.info("Parsed result: calories=%d protein=%.1f carbs=%.1f fat=%.1f sugar=%.1f error=%r",
                result.calories, result.protein, result.carbs, result.fat, result.sugar, result.error)
    return result


async def extract_macros(
    text: str | None, image_bytes: bytes | None
) -> ExtractionResult:
    """Extract macro nutrients from meal text and/or image.

    Calls the OpenAI API with up to 2 retries when the model returns
    a non-empty error field. On total failure returns zeros with an
    error message.
    """
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        logger.error("OPENAI_API_KEY is not set — returning zeros")
        return ExtractionResult(
            calories=0,
            protein=0.0,
            carbs=0.0,
            fat=0.0,
            sugar=0.0,
            error="OPENAI_API_KEY is not set",
            description=text or "",
        )

    logger.info("extract_macros called: text=%s, has_image=%s", repr(text), image_bytes is not None)

    last_error = ""
    for attempt in range(_MAX_RETRIES + 1):
        try:
            logger.info("Attempt %d/%d", attempt + 1, _MAX_RETRIES + 1)
            result = await _call_openai(text, image_bytes)
            if result.error == "":
                logger.info("Extraction succeeded on attempt %d", attempt + 1)
                return result
            # Non-empty error from model; retry
            last_error = result.error
            logger.warning("Model returned error on attempt %d: %s", attempt + 1, result.error)
        except Exception as exc:
            last_error = str(exc)
            logger.exception("Exception on attempt %d: %s", attempt + 1, exc)

    # All attempts exhausted
    logger.error("All %d attempts exhausted, returning zeros. Last error: %s", _MAX_RETRIES + 1, last_error)
    return ExtractionResult(
        calories=0,
        protein=0.0,
        carbs=0.0,
        fat=0.0,
        sugar=0.0,
        error=last_error or "Failed to extract macros after retries",
        description=text or "",
    )
