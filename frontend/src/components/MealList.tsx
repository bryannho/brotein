import { useState, useEffect, useRef } from 'react'
import type { Meal } from '../types'
import { updateMeal, deleteMeal } from '../api'
import { useDebounce } from '../hooks/useDebounce'

const MACRO_FIELDS = [
  {
    key: 'calories' as const,
    label: 'Cal',
    color: 'var(--color-calories)',
    tint: 'rgba(196,136,90,0.2)',
  },
  {
    key: 'protein' as const,
    label: 'Pro',
    color: 'var(--color-protein)',
    tint: 'rgba(125,170,146,0.2)',
  },
  {
    key: 'carbs' as const,
    label: 'Carb',
    color: 'var(--color-carbs)',
    tint: 'rgba(232,196,104,0.2)',
  },
  {
    key: 'fat' as const,
    label: 'Fat',
    color: 'var(--color-fat)',
    tint: 'rgba(212,137,106,0.2)',
  },
  {
    key: 'sugar' as const,
    label: 'Sug',
    color: 'var(--color-sugar)',
    tint: 'rgba(207,102,121,0.2)',
  },
]

interface Props {
  meals: Meal[]
  onMutated: () => void
}

type MacroValues = { calories: number; protein: number; carbs: number; fat: number; sugar: number }

function MealCard({
  meal,
  onUpdate,
  onDelete,
}: {
  meal: Meal
  onUpdate: (mealId: string, macros: MacroValues) => void
  onDelete: (mealId: string) => void
}) {
  const [localValues, setLocalValues] = useState<Record<string, string>>({
    calories: String(meal.calories),
    protein: String(meal.protein),
    carbs: String(meal.carbs),
    fat: String(meal.fat),
    sugar: String(meal.sugar),
  })

  const debouncedValues = useDebounce(localValues, 800)
  const hasMounted = useRef(false)
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    const macros: MacroValues = {
      calories: Number(debouncedValues.calories) || 0,
      protein: Number(debouncedValues.protein) || 0,
      carbs: Number(debouncedValues.carbs) || 0,
      fat: Number(debouncedValues.fat) || 0,
      sugar: Number(debouncedValues.sugar) || 0,
    }
    onUpdateRef.current(meal.meal_id, macros)
  }, [debouncedValues, meal.meal_id])

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <span style={{ fontWeight: 600 }}>{meal.text_input || '(no description)'}</span>
        <button
          onClick={() => onDelete(meal.meal_id)}
          style={{
            background: 'rgba(207,102,121,0.1)',
            border: '1px solid rgba(207,102,121,0.25)',
            color: 'var(--color-danger)',
            cursor: 'pointer',
            fontSize: '1em',
            lineHeight: 1,
            padding: '0.15em 0.4em',
            borderRadius: '6px',
          }}
          title="Delete meal"
        >
          &times;
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end' }}>
        {MACRO_FIELDS.map(({ key, label, color, tint }) => (
          <div
            key={key}
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: '0.65em', fontWeight: 600, color, marginBottom: '0.15rem' }}>
              {label}
            </div>
            <input
              type="text"
              inputMode="decimal"
              style={{
                width: '100%',
                padding: '0.2em',
                fontSize: '16px',
                textAlign: 'center',
                borderColor: tint,
                fontFamily: 'var(--font-mono)',
              }}
              value={localValues[key]}
              onChange={(e) => {
                const v = e.target.value
                if (v === '' || /^\d*\.?\d*$/.test(v)) {
                  setLocalValues((prev) => ({ ...prev, [key]: v }))
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MealList({ meals, onMutated }: Props) {
  const handleUpdate = async (mealId: string, macros: MacroValues) => {
    try {
      await updateMeal(mealId, macros)
      onMutated()
    } catch {
      // silently ignore — field keeps its value
    }
  }

  const handleDelete = async (mealId: string) => {
    try {
      await deleteMeal(mealId)
      onMutated()
    } catch {
      // silently ignore
    }
  }

  if (meals.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        No meals logged yet.
      </p>
    )
  }

  return (
    <div className="meal-cards">
      {meals.map((meal) => (
        <MealCard key={meal.meal_id} meal={meal} onUpdate={handleUpdate} onDelete={handleDelete} />
      ))}
    </div>
  )
}
