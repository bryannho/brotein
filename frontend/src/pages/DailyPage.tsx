import { useState, useEffect, useCallback } from 'react'
import type { Meal, Goals, MacroTotals } from '../types'
import { useUser } from '../context/UserContext'
import { fetchDaily, fetchGoals } from '../api'
import DailySummaryCard from '../components/DailySummaryCard'
import MealList from '../components/MealList'
import MealEntryForm from '../components/MealEntryForm'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function displayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DailyPage() {
  const { selectedUser } = useUser()
  const today = formatDate(new Date())
  const [currentDate, setCurrentDate] = useState(today)
  const [meals, setMeals] = useState<Meal[]>([])
  const [totals, setTotals] = useState<MacroTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
  })
  const [goals, setGoals] = useState<Goals | null>(null)

  const loadDaily = useCallback(() => {
    if (!selectedUser) return
    fetchDaily(currentDate, selectedUser.id)
      .then((data) => {
        setMeals(data.meals)
        setTotals(data.totals)
      })
      .catch(() => {
        setMeals([])
        setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 })
      })
  }, [currentDate, selectedUser])

  useEffect(() => {
    if (!selectedUser) return
    fetchDaily(currentDate, selectedUser.id)
      .then((data) => {
        setMeals(data.meals)
        setTotals(data.totals)
      })
      .catch(() => {
        setMeals([])
        setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 })
      })
  }, [currentDate, selectedUser])

  useEffect(() => {
    if (!selectedUser) return
    fetchGoals(selectedUser.id)
      .then(setGoals)
      .catch(() => setGoals(null))
  }, [selectedUser])

  if (!selectedUser) return null

  const goBack = () => {
    const d = new Date(currentDate + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    setCurrentDate(formatDate(d))
  }

  const goForward = () => {
    const d = new Date(currentDate + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    const next = formatDate(d)
    if (next <= today) {
      setCurrentDate(next)
    }
  }

  const isToday = currentDate === today

  return (
    <div>
      <div className="date-nav">
        <button onClick={goBack}>&larr;</button>
        <span>{displayDate(currentDate)}</span>
        <button
          onClick={goForward}
          disabled={isToday}
          style={{ opacity: isToday ? 0.3 : 1, cursor: isToday ? 'default' : 'pointer' }}
        >
          &rarr;
        </button>
      </div>

      <DailySummaryCard totals={totals} goals={goals ?? undefined} />
      <MealEntryForm userId={selectedUser.id} date={currentDate} onMealCreated={loadDaily} />
      <MealList meals={meals} onMutated={loadDaily} />
    </div>
  )
}
