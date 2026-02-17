from datetime import date, datetime
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models import MealResponse, MealUpdate

router = APIRouter(prefix="/api")


@router.post("/meal", response_model=MealResponse)
async def create_meal(
    user_id: str = Form(),
    text: str | None = Form(None),
    image: UploadFile | None = File(None),
):
    if not text and not image:
        raise HTTPException(status_code=400, detail="Must provide text or image")

    return MealResponse(
        meal_id=str(uuid4()),
        user_id=user_id,
        date=str(date.today()),
        text_input=text,
        calories=0,
        protein=0.0,
        carbs=0.0,
        sugar=0.0,
        error="",
        created_at=datetime.now().isoformat(),
    )


@router.put("/meal/{meal_id}", response_model=MealResponse)
async def update_meal(meal_id: str, body: MealUpdate):
    return MealResponse(
        meal_id=meal_id,
        user_id="stub",
        date=str(date.today()),
        text_input=None,
        calories=body.calories,
        protein=body.protein,
        carbs=body.carbs,
        sugar=body.sugar,
    )


@router.delete("/meal/{meal_id}")
async def delete_meal(meal_id: str):
    return {"deleted": True}
