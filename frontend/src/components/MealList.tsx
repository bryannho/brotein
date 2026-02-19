import { useState } from 'react'
import type { Meal } from '../types'
import { updateMeal, deleteMeal } from '../api'

const MACRO_FIELDS = [
  {
    key: 'calories' as const,
    label: 'Cal',
    color: 'var(--color-calories)',
    tint: 'rgba(77,107,255,0.2)',
  },
  {
    key: 'protein' as const,
    label: 'Pro',
    color: 'var(--color-protein)',
    tint: 'rgba(78,205,196,0.2)',
  },
  {
    key: 'carbs' as const,
    label: 'Carb',
    color: 'var(--color-carbs)',
    tint: 'rgba(255,212,59,0.2)',
  },
  { key: 'fat' as const, label: 'Fat', color: 'var(--color-fat)', tint: 'rgba(244,162,97,0.2)' },
  {
    key: 'sugar' as const,
    label: 'Sug',
    color: 'var(--color-sugar)',
    tint: 'rgba(255,107,107,0.2)',
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

  const handleBlur = () => {
    const macros: MacroValues = {
      calories: Number(localValues.calories) || 0,
      protein: Number(localValues.protein) || 0,
      carbs: Number(localValues.carbs) || 0,
      fat: Number(localValues.fat) || 0,
      sugar: Number(localValues.sugar) || 0,
    }
    onUpdate(meal.meal_id, macros)
  }

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
            background: 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.25)',
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
      <div style={{ display: 'flex', gap: '0.4rem' }}>
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
                padding: '0.25em 0.2em',
                fontSize: '0.85em',
                textAlign: 'center',
                borderColor: tint,
              }}
              value={localValues[key]}
              onChange={(e) => {
                const v = e.target.value
                if (v === '' || /^\d*\.?\d*$/.test(v)) {
                  setLocalValues((prev) => ({ ...prev, [key]: v }))
                }
              }}
              onBlur={handleBlur}
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
