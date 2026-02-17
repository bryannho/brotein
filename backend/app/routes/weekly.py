from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import Goal, Meal
from app.models import DayEntry, DayGoal, MacroTotals, WeeklyResponse

router = APIRouter(prefix="/api")


@router.get("/weekly", response_model=WeeklyResponse)
async def get_weekly(user_id: str, db: Session = Depends(get_db)):
    today = date.today()

    goal = db.query(Goal).filter(Goal.user_id == user_id).first()
    goal_data = DayGoal(
        calories=goal.calories_goal if goal else 0,
        protein=goal.protein_goal if goal else 0.0,
        carbs=goal.carbs_goal if goal else 0.0,
        sugar=goal.sugar_goal if goal else 0.0,
    )

    days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        meals = (
            db.query(Meal)
            .filter(Meal.user_id == user_id, Meal.meal_date == d)
            .all()
        )
        actual = MacroTotals(
            calories=sum(m.calories for m in meals),
            protein=sum(m.protein for m in meals),
            carbs=sum(m.carbs for m in meals),
            sugar=sum(m.sugar for m in meals),
        )
        days.append(DayEntry(date=str(d), goal=goal_data, actual=actual))

    return WeeklyResponse(user_id=user_id, days=days)
