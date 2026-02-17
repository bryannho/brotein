from fastapi import APIRouter

from app.models import DailyResponse, MacroTotals

router = APIRouter(prefix="/api")


@router.get("/daily/{date}", response_model=DailyResponse)
async def get_daily(date: str, user_id: str):
    return DailyResponse(
        date=date,
        user_id=user_id,
        totals=MacroTotals(calories=0, protein=0.0, carbs=0.0, sugar=0.0),
        meals=[],
    )
