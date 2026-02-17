from datetime import date, timedelta

from fastapi import APIRouter

from app.models import DayEntry, DayGoal, MacroTotals, WeeklyResponse

router = APIRouter(prefix="/api")


@router.get("/weekly", response_model=WeeklyResponse)
async def get_weekly(user_id: str):
    today = date.today()
    days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        days.append(
            DayEntry(
                date=str(d),
                goal=DayGoal(calories=0, protein=0.0, carbs=0.0, sugar=0.0),
                actual=MacroTotals(calories=0, protein=0.0, carbs=0.0, sugar=0.0),
            )
        )
    return WeeklyResponse(user_id=user_id, days=days)
