from datetime import datetime

from fastapi import APIRouter

from app.models import GoalsRequest, GoalsResponse

router = APIRouter(prefix="/api")


@router.get("/goals", response_model=GoalsResponse)
async def get_goals(user_id: str):
    return GoalsResponse(
        user_id=user_id,
        calories_goal=0,
        protein_goal=0.0,
        carbs_goal=0.0,
        sugar_goal=0.0,
        updated_at=datetime.now().isoformat(),
    )


@router.post("/goals", response_model=GoalsResponse)
async def set_goals(body: GoalsRequest):
    return GoalsResponse(
        user_id=body.user_id,
        calories_goal=body.calories_goal,
        protein_goal=body.protein_goal,
        carbs_goal=body.carbs_goal,
        sugar_goal=body.sugar_goal,
        updated_at=datetime.now().isoformat(),
    )
