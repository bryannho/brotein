from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter

from app.models import UserCreate, UserResponse

router = APIRouter(prefix="/api")


@router.get("/users", response_model=list[UserResponse])
async def list_users():
    return []


@router.post("/users", response_model=UserResponse)
async def create_user(body: UserCreate):
    return UserResponse(
        id=str(uuid4()),
        name=body.name,
        created_at=datetime.now().isoformat(),
    )
