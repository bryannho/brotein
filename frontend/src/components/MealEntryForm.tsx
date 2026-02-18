import { useRef, useState } from 'react';
import { createMeal } from '../api';

interface Props {
  userId: string;
  date: string;
  onMealCreated: () => void;
}

export default function MealEntryForm({ userId, date, onMealCreated }: Props) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) {
      alert('Please provide a meal description or image.');
      return;
    }
    setSubmitting(true);
    try {
      await createMeal(userId, date, text.trim() || undefined, image || undefined);
      setText('');
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onMealCreated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to log meal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <input
          type="text"
          placeholder="Describe your meal..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1 }}
          disabled={submitting}
        />
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
              setImage(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
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
          <span className="loading-pulse" style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)' }}>
            Analyzing meal...
          </span>
        </div>
      ) : (
        <button type="submit" className="primary" style={{ width: '100%' }}>
          Log Meal
        </button>
      )}
    </form>
  );
}
