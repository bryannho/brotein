from datetime import date, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import Meal
from app.models import MealResponse, MealUpdate

router = APIRouter(prefix="/api")


def _meal_to_response(meal: Meal) -> MealResponse:
    return MealResponse(
        meal_id=meal.id,
        user_id=meal.user_id,
        date=str(meal.meal_date),
        text_input=meal.text_input,
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        sugar=meal.sugar,
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

    meal = Meal(
        id=str(uuid4()),
        user_id=user_id,
        meal_date=parsed_date,
        text_input=text,
        calories=0,
        protein=0.0,
        carbs=0.0,
        sugar=0.0,
        created_at=datetime.now(),
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return _meal_to_response(meal)


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
