import logging
from datetime import date, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import Meal
from app.models import MealResponse, MealUpdate
from app.openai_service import extract_macros

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


def _meal_to_response(meal: Meal, error: str = "") -> MealResponse:
    return MealResponse(
        meal_id=meal.id,
        user_id=meal.user_id,
        date=str(meal.meal_date),
        text_input=meal.text_input,
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        sugar=meal.sugar,
        error=error,
        created_at=meal.created_at.isoformat(),
    )


@router.post("/meal", response_model=MealResponse)
async def create_meal(
    user_id: str = Form(),
    text: str | None = Form(None),
    image: UploadFile | None = File(None),
    meal_date: str | None = Form(None),
    db: Session = Depends(get_db),
):
    if not text and not image:
        raise HTTPException(status_code=400, detail="Must provide text or image")

    if meal_date:
        parsed_date = date.fromisoformat(meal_date)
    else:
        parsed_date = date.today()

    image_bytes = await image.read() if image else None
    logger.info("create_meal: user_id=%s text=%s has_image=%s date=%s",
                user_id, repr(text), image_bytes is not None, parsed_date)

    result = await extract_macros(text, image_bytes)
    logger.info("create_meal: extraction result — cal=%d pro=%.1f carbs=%.1f sugar=%.1f error=%r",
                result.calories, result.protein, result.carbs, result.sugar, result.error)

    meal = Meal(
        id=str(uuid4()),
        user_id=user_id,
        meal_date=parsed_date,
        text_input=text,
        calories=result.calories,
        protein=result.protein,
        carbs=result.carbs,
        sugar=result.sugar,
        created_at=datetime.now(),
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    logger.info("create_meal: saved meal %s", meal.id)
    return _meal_to_response(meal, error=result.error)


@router.put("/meal/{meal_id}", response_model=MealResponse)
async def update_meal(
    meal_id: str, body: MealUpdate, db: Session = Depends(get_db)
):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    meal.calories = body.calories
    meal.protein = body.protein
    meal.carbs = body.carbs
    meal.sugar = body.sugar
    db.commit()
    db.refresh(meal)
    return _meal_to_response(meal)


@router.delete("/meal/{meal_id}")
async def delete_meal(meal_id: str, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return {"deleted": True}
