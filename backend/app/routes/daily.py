from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import Meal
from app.models import DailyResponse, MacroTotals, MealResponse

router = APIRouter(prefix="/api")


@router.get("/daily/{date}", response_model=DailyResponse)
async def get_daily(date: str, user_id: str, db: Session = Depends(get_db)):
    meals = (
        db.query(Meal)
        .filter(Meal.user_id == user_id, Meal.meal_date == date)
        .order_by(Meal.created_at.desc())
        .all()
    )

    totals = MacroTotals(
        calories=sum(m.calories for m in meals),
        protein=sum(m.protein for m in meals),
        carbs=sum(m.carbs for m in meals),
        fat=sum(m.fat for m in meals),
        sugar=sum(m.sugar for m in meals),
    )

    meal_responses = [
        MealResponse(
            meal_id=m.id,
            user_id=m.user_id,
            date=str(m.meal_date),
            text_input=m.text_input,
            calories=m.calories,
            protein=m.protein,
            carbs=m.carbs,
            fat=m.fat,
            sugar=m.sugar,
            created_at=m.created_at.isoformat(),
        )
        for m in meals
    ]

    return DailyResponse(date=date, user_id=user_id, totals=totals, meals=meal_responses)
