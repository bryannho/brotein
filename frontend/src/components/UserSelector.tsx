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
      style={{ fontSize: '0.9em', cursor: 'pointer' }}
    >
      {placeholderUsers.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </select>
  );
}
