export interface User {
  id: string
  name: string
  created_at: string
}

export interface Meal {
  meal_id: string
  user_id: string
  date: string
  text_input: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  created_at: string
}

export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}

export interface DailyData {
  date: string
  user_id: string
  totals: MacroTotals
  meals: Meal[]
}

export interface DayEntry {
  date: string
  goal: MacroTotals
  actual: MacroTotals
}

export interface WeeklyData {
  user_id: string
  days: DayEntry[]
}

export interface Goals {
  user_id: string
  calories_goal: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
  sugar_goal: number
}

export interface MealSuggestion {
  text_input: string
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}
