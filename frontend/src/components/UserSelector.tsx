import { useState } from 'react';
import type { User } from '../types';

const placeholderUsers: User[] = [
  { id: '1', name: 'Bryan', created_at: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'Mom', created_at: '2026-01-01T00:00:00Z' },
  { id: '3', name: 'Dad', created_at: '2026-01-01T00:00:00Z' },
];

export default function UserSelector() {
  const [selectedUserId, setSelectedUserId] = useState(placeholderUsers[0].id);

  return (
    <select
      value={selectedUserId}
      onChange={(e) => setSelectedUserId(e.target.value)}
      style={{
        padding: '0.4em 0.8em',
        fontSize: '0.9em',
        borderRadius: '6px',
        border: '1px solid #555',
        background: '#1a1a1a',
        color: 'inherit',
        cursor: 'pointer',
      }}
    >
      {placeholderUsers.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </select>
  );
}
