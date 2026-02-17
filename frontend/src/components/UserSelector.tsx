import { useUser } from '../context/UserContext';

export default function UserSelector() {
  const { users, selectedUser, selectUser } = useUser();

  if (users.length === 0) {
    return <span style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)' }}>No users</span>;
  }

  return (
    <select
      value={selectedUser?.id ?? ''}
      onChange={(e) => selectUser(e.target.value)}
      style={{ fontSize: '0.9em', cursor: 'pointer' }}
    >
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </select>
  );
}
