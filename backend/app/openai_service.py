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

_SYSTEM_PROMPT = (
    "You are a nutrition extraction engine. Your job is to extract calories "
    "and macro nutrients from meal descriptions and nutrition label images."
)

_USER_PROMPT = """\
Extract nutritional information from the provided input.

You may receive:
- a meal description (text),
- an image (nutrition label, meal photo, screenshot),
- or both.

Return ONLY valid JSON with the following keys:
- calories (int)
- protein (float, grams)
- carbs (float, grams)
- sugar (float, grams)
- error (string)

Rules:
- If all values are confidently determined, set error to "".
- For meal descriptions (e.g. "chipotle chicken bowl"), estimate the macros based on typical nutritional data for that food. This is expected and not guessing.
- If the input is truly ambiguous or unrelated to food, set error to a descriptive message.
- JSON only. No extra text."""

_MAX_RETRIES = 2


@dataclass
class ExtractionResult:
    calories: int
    protein: float
    carbs: float
    sugar: float
    error: str


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
    )

    raw = response.choices[0].message.content or ""
    logger.info("OpenAI raw response: %s", raw)

    # Strip markdown code fences if present
    stripped = raw.strip()
    if stripped.startswith("```"):
        # Remove opening fence (possibly ```json)
        first_newline = stripped.index("\n")
        stripped = stripped[first_newline + 1 :]
        # Remove closing fence
        if stripped.endswith("```"):
            stripped = stripped[: -3].strip()

    data = json.loads(stripped)

    result = ExtractionResult(
        calories=int(data.get("calories", 0)),
        protein=float(data.get("protein", 0.0)),
        carbs=float(data.get("carbs", 0.0)),
        sugar=float(data.get("sugar", 0.0)),
        error=str(data.get("error", "")),
    )
    logger.info("Parsed result: calories=%d protein=%.1f carbs=%.1f sugar=%.1f error=%r",
                result.calories, result.protein, result.carbs, result.sugar, result.error)
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
            sugar=0.0,
            error="OPENAI_API_KEY is not set",
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
        sugar=0.0,
        error=last_error or "Failed to extract macros after retries",
    )
