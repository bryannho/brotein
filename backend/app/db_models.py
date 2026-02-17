from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String

from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)


class Meal(Base):
    __tablename__ = "meals"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    meal_date = Column(Date, nullable=False)
    text_input = Column(String, nullable=True)
    calories = Column(Integer, nullable=False, default=0)
    protein = Column(Float, nullable=False, default=0)
    carbs = Column(Float, nullable=False, default=0)
    fat = Column(Float, nullable=False, default=0)
    sugar = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False)


class Goal(Base):
    __tablename__ = "goals"
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    calories_goal = Column(Integer, nullable=False)
    protein_goal = Column(Float, nullable=False)
    carbs_goal = Column(Float, nullable=False)
    fat_goal = Column(Float, nullable=False)
    sugar_goal = Column(Float, nullable=False)
    updated_at = Column(DateTime, nullable=False)
