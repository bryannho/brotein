import { useEffect, useRef, useState } from 'react'
import { createMeal, quickCreateMeal, searchMeals } from '../api'
import type { MealSuggestion } from '../types'
import { useDebounce } from '../hooks/useDebounce'
import MealMemoryModal from './MealMemoryModal'

interface Props {
  userId: string
  date: string
  onMealCreated: () => void
}

export default function MealEntryForm({ userId, date, onMealCreated }: Props) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<MealSuggestion | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)

  const debouncedText = useDebounce(text, 100)

  useEffect(() => {
    if (debouncedText.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    let cancelled = false
    searchMeals(userId, debouncedText.trim())
      .then((results) => {
        if (!cancelled) {
          setSuggestions(results)
          setShowDropdown(results.length > 0)
        }
      })
      .catch(() => {
        // silently ignore search errors
      })
    return () => {
      cancelled = true
    }
  }, [debouncedText, userId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !image) {
      alert('Please provide a meal description or image.')
      return
    }
    setSubmitting(true)
    try {
      await createMeal(userId, date, text.trim() || undefined, image || undefined)
      setText('')
      setImage(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      onMealCreated()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to log meal.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuggestionClick = (suggestion: MealSuggestion) => {
    setShowDropdown(false)
    setSelectedSuggestion(suggestion)
  }

  const handleModalConfirm = async (macros: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }) => {
    if (!selectedSuggestion) return
    try {
      await quickCreateMeal(userId, date, selectedSuggestion.text_input, macros)
      setText('')
      setImage(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSelectedSuggestion(null)
      onMealCreated()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add meal.')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div ref={autocompleteRef} style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Describe your meal..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ width: '100%' }}
              disabled={submitting}
            />
            {showDropdown && suggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="autocomplete-item"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s.text_input}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
            style={{
              background: image ? 'var(--color-calories)' : 'var(--color-surface-alt)',
              borderColor: image ? 'transparent' : 'var(--color-border)',
              color: image ? '#fff' : 'var(--color-text)',
              padding: '0.5em 0.75em',
              fontSize: '1.1em',
              lineHeight: 1,
            }}
            title="Upload image"
          >
            &#128247;
          </button>
        </div>
        {image && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              fontSize: '0.85em',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {image.name}
            </span>
            <button
              type="button"
              onClick={() => {
                setImage(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                padding: '0.1em 0.3em',
                fontSize: '1em',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>
        )}
        {submitting ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 0',
            }}
          >
            <div className="spinner" />
            <span
              className="loading-pulse"
              style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)' }}
            >
              Analyzing meal...
            </span>
          </div>
        ) : (
          <button type="submit" className="primary" style={{ width: '100%' }}>
            Log Meal
          </button>
        )}
      </form>
      {selectedSuggestion && (
        <MealMemoryModal
          suggestion={selectedSuggestion}
          onConfirm={handleModalConfirm}
          onCancel={() => setSelectedSuggestion(null)}
        />
      )}
    </>
  )
}
