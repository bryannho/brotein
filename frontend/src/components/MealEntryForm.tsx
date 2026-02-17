import { useState } from 'react';

export default function MealEntryForm() {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) {
      alert('Please provide a meal description or image.');
      return;
    }
    console.log('Submit meal:', { text, image });
    setText('');
    setImage(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        padding: '1rem',
        border: '1px solid #444',
        borderRadius: '10px',
        background: '#1e1e1e',
      }}
    >
      <input
        type="text"
        placeholder="Describe your meal..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          flex: 1,
          padding: '0.5em 0.75em',
          fontSize: '1em',
          borderRadius: '6px',
          border: '1px solid #555',
          background: '#2a2a2a',
          color: 'inherit',
        }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        style={{ fontSize: '0.85em' }}
      />
      <button type="submit" style={{ whiteSpace: 'nowrap' }}>
        Log Meal
      </button>
    </form>
  );
}
