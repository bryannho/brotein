import logging
from datetime import date, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import Meal, User
from app.models import MealResponse, MealSearchResult, MealUpdate, QuickMealCreate
from app.openai_service import extract_macros

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")
search_router = APIRouter(prefix="/api")


def _meal_to_response(meal: Meal, error: str = "") -> MealResponse:
    return MealResponse(
        meal_id=meal.id,
        user_id=meal.user_id,
        date=str(meal.meal_date),
        text_input=meal.text_input,
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        fat=meal.fat,
        sugar=meal.sugar,
        error=error,
        created_at=meal.created_at.isoformat(),
    )


@search_router.get("/meals/search", response_model=list[MealSearchResult])
async def search_meals(user_id: str, q: str = "", db: Session = Depends(get_db)):
    if len(q) < 2:
        return []

    # Subquery to get the max created_at per unique text_input
    latest = (
        db.query(
            Meal.text_input,
            func.max(Meal.created_at).label("max_created"),
        )
        .filter(
            Meal.user_id == user_id,
            Meal.text_input.isnot(None),
            Meal.text_input != "",
            Meal.text_input.ilike(f"%{q}%"),
        )
        .group_by(Meal.text_input)
        .subquery()
    )

    meals = (
        db.query(Meal)
        .join(
            latest,
            (Meal.text_input == latest.c.text_input) & (Meal.created_at == latest.c.max_created),
        )
        .order_by(Meal.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        MealSearchResult(
            text_input=m.text_input,
            calories=m.calories,
            protein=m.protein,
            carbs=m.carbs,
            fat=m.fat,
            sugar=m.sugar,
        )
        for m in meals
    ]


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

    if not db.query(User).filter(User.id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    if meal_date:
        parsed_date = date.fromisoformat(meal_date)
    else:
        parsed_date = date.today()

    image_bytes = await image.read() if image else None
    logger.info(
        "create_meal: user_id=%s text=%s has_image=%s date=%s",
        user_id,
        repr(text),
        image_bytes is not None,
        parsed_date,
    )

    result = await extract_macros(text, image_bytes)
    logger.info(
        "create_meal: extraction result — cal=%d pro=%.1f carbs=%.1f fat=%.1f sugar=%.1f error=%r",
        result.calories,
        result.protein,
        result.carbs,
        result.fat,
        result.sugar,
        result.error,
    )

    meal_description = result.description if result.description else (text or None)

    meal = Meal(
        id=str(uuid4()),
        user_id=user_id,
        meal_date=parsed_date,
        text_input=meal_description,
        calories=result.calories,
        protein=result.protein,
        carbs=result.carbs,
        fat=result.fat,
        sugar=result.sugar,
        created_at=datetime.now(),
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    logger.info("create_meal: saved meal %s", meal.id)
    return _meal_to_response(meal, error=result.error)


@router.post("/meal/quick", response_model=MealResponse)
async def quick_create_meal(body: QuickMealCreate, db: Session = Depends(get_db)):
    if not db.query(User).filter(User.id == body.user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    meal = Meal(
        id=str(uuid4()),
        user_id=body.user_id,
        meal_date=date.fromisoformat(body.meal_date),
        text_input=body.text_input,
        calories=body.calories,
        protein=body.protein,
        carbs=body.carbs,
        fat=body.fat,
        sugar=body.sugar,
        created_at=datetime.now(),
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return _meal_to_response(meal)


@router.put("/meal/{meal_id}", response_model=MealResponse)
async def update_meal(meal_id: str, body: MealUpdate, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    meal.calories = body.calories
    meal.protein = body.protein
    meal.carbs = body.carbs
    meal.fat = body.fat
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
