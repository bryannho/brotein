from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str


class UserResponse(BaseModel):
    id: str
    name: str
    created_at: str


class MealResponse(BaseModel):
    meal_id: str
    user_id: str
    date: str
    text_input: str | None
    calories: int
    protein: float
    carbs: float
    sugar: float
    error: str = ""
    created_at: str = ""


class MealUpdate(BaseModel):
    calories: int
    protein: float
    carbs: float
    sugar: float


class MacroTotals(BaseModel):
    calories: int
    protein: float
    carbs: float
    sugar: float


class DailyResponse(BaseModel):
    date: str
    user_id: str
    totals: MacroTotals
    meals: list[MealResponse]


class DayGoal(BaseModel):
    calories: int
    protein: float
    carbs: float
    sugar: float


class DayEntry(BaseModel):
    date: str
    goal: DayGoal
    actual: MacroTotals


class WeeklyResponse(BaseModel):
    user_id: str
    days: list[DayEntry]


class GoalsRequest(BaseModel):
    user_id: str
    calories_goal: int
    protein_goal: float
    carbs_goal: float
    sugar_goal: float


class GoalsResponse(BaseModel):
    user_id: str
    calories_goal: int
    protein_goal: float
    carbs_goal: float
    sugar_goal: float
    updated_at: str
