from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import User
from app.models import UserCreate, UserResponse

router = APIRouter(prefix="/api")


@router.get("/users", response_model=list[UserResponse])
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at).all()
    return [UserResponse(id=u.id, name=u.name, created_at=u.created_at.isoformat()) for u in users]


@router.post("/users", response_model=UserResponse)
async def create_user(body: UserCreate, db: Session = Depends(get_db)):
    user = User(id=str(uuid4()), name=body.name, created_at=datetime.now())
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(id=user.id, name=user.name, created_at=user.created_at.isoformat())
