from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import Goal
from app.models import GoalsRequest, GoalsResponse

router = APIRouter(prefix="/api")


@router.get("/goals", response_model=GoalsResponse)
async def get_goals(user_id: str, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.user_id == user_id).first()
    if not goal:
        return GoalsResponse(
            user_id=user_id,
            calories_goal=0,
            protein_goal=0.0,
            carbs_goal=0.0,
            sugar_goal=0.0,
            updated_at=datetime.now().isoformat(),
        )
    return GoalsResponse(
        user_id=goal.user_id,
        calories_goal=goal.calories_goal,
        protein_goal=goal.protein_goal,
        carbs_goal=goal.carbs_goal,
        sugar_goal=goal.sugar_goal,
        updated_at=goal.updated_at.isoformat(),
    )


@router.post("/goals", response_model=GoalsResponse)
async def set_goals(body: GoalsRequest, db: Session = Depends(get_db)):
    goal = Goal(
        user_id=body.user_id,
        calories_goal=body.calories_goal,
        protein_goal=body.protein_goal,
        carbs_goal=body.carbs_goal,
        sugar_goal=body.sugar_goal,
        updated_at=datetime.now(),
    )
    goal = db.merge(goal)
    db.commit()
    db.refresh(goal)
    return GoalsResponse(
        user_id=goal.user_id,
        calories_goal=goal.calories_goal,
        protein_goal=goal.protein_goal,
        carbs_goal=goal.carbs_goal,
        sugar_goal=goal.sugar_goal,
        updated_at=goal.updated_at.isoformat(),
    )
