import { useState } from 'react'
import type { MealSuggestion } from '../types'

interface Props {
  suggestion: MealSuggestion
  onConfirm: (macros: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }) => void
  onCancel: () => void
}

const fields = [
  { key: 'calories' as const, label: 'Calories' },
  { key: 'protein' as const, label: 'Protein (g)' },
  { key: 'carbs' as const, label: 'Carbs (g)' },
  { key: 'fat' as const, label: 'Fat (g)' },
  { key: 'sugar' as const, label: 'Sugar (g)' },
]

export default function MealMemoryModal({ suggestion, onConfirm, onCancel }: Props) {
  const [values, setValues] = useState({
    calories: String(suggestion.calories),
    protein: String(suggestion.protein),
    carbs: String(suggestion.carbs),
    fat: String(suggestion.fat),
    sugar: String(suggestion.sugar),
  })

  const handleChange = (key: keyof typeof values, raw: string) => {
    if (/^\d*\.?\d*$/.test(raw)) {
      setValues({ ...values, [key]: raw })
    }
  }

  const handleConfirm = () => {
    onConfirm({
      calories: Number(values.calories) || 0,
      protein: Number(values.protein) || 0,
      carbs: Number(values.carbs) || 0,
      fat: Number(values.fat) || 0,
      sugar: Number(values.sugar) || 0,
    })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="card"
        style={{ width: '100%', maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.05em' }}>{suggestion.text_input}</h3>
        {fields.map(({ key, label }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <label>{label}</label>
            <input
              type="text"
              inputMode="decimal"
              className="goal-input"
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button onClick={onCancel} style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="primary" style={{ flex: 1 }}>
            Add Meal
          </button>
        </div>
      </div>
    </div>
  )
}
