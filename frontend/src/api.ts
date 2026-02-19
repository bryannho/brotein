import type { User, DailyData, WeeklyData, Goals, Meal, MealSuggestion } from './types'

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}

export function fetchUsers(): Promise<User[]> {
  return fetchJSON('/api/users')
}

export function createUser(name: string): Promise<User> {
  return fetchJSON('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export function fetchDaily(date: string, userId: string): Promise<DailyData> {
  return fetchJSON(`/api/daily/${date}?user_id=${userId}`)
}

export function createMeal(
  userId: string,
  date: string,
  text?: string,
  image?: File,
): Promise<Meal> {
  const form = new FormData()
  form.append('user_id', userId)
  form.append('meal_date', date)
  if (text) form.append('text', text)
  if (image) form.append('image', image)
  return fetchJSON('/api/meal', { method: 'POST', body: form })
}

export function updateMeal(
  mealId: string,
  macros: { calories: number; protein: number; carbs: number; fat: number; sugar: number },
): Promise<Meal> {
  return fetchJSON(`/api/meal/${mealId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(macros),
  })
}

export function deleteMeal(mealId: string): Promise<void> {
  return fetch(`/api/meal/${mealId}`, { method: 'DELETE' }).then((r) => {
    if (!r.ok) throw new Error(r.statusText)
  })
}

export function fetchGoals(userId: string): Promise<Goals> {
  return fetchJSON(`/api/goals?user_id=${userId}`)
}

export function saveGoals(goals: Goals): Promise<Goals> {
  return fetchJSON('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goals),
  })
}

export function fetchWeekly(userId: string): Promise<WeeklyData> {
  return fetchJSON(`/api/weekly?user_id=${userId}`)
}

export function searchMeals(userId: string, query: string): Promise<MealSuggestion[]> {
  return fetchJSON(
    `/api/meals/search?user_id=${encodeURIComponent(userId)}&q=${encodeURIComponent(query)}`,
  )
}

export function quickCreateMeal(
  userId: string,
  date: string,
  textInput: string,
  macros: { calories: number; protein: number; carbs: number; fat: number; sugar: number },
): Promise<Meal> {
  return fetchJSON('/api/meal/quick', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, meal_date: date, text_input: textInput, ...macros }),
  })
}
