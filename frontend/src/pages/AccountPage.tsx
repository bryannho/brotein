import { useState, useEffect } from 'react';
import type { Goals } from '../types';
import { useUser } from '../context/UserContext';
import { createUser, fetchGoals, saveGoals } from '../api';
import GoalForm from '../components/GoalForm';

export default function AccountPage() {
  const { selectedUser, refreshUsers } = useUser();
  const [newUserName, setNewUserName] = useState('');
  const [goals, setGoals] = useState<Goals | null>(null);

  useEffect(() => {
    if (!selectedUser) {
      setGoals(null);
      return;
    }
    fetchGoals(selectedUser.id)
      .then(setGoals)
      .catch(() => setGoals(null));
  }, [selectedUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    try {
      await createUser(newUserName.trim());
      setNewUserName('');
      await refreshUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create user.');
    }
  };

  const handleSaveGoals = async (updated: Goals) => {
    try {
      const saved = await saveGoals(updated);
      setGoals(saved);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save goals.');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Account</h2>

      <section className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ marginTop: 0 }}>Create New User</h3>
        <form
          onSubmit={handleCreateUser}
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
        >
          <input
            type="text"
            placeholder="Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="primary">Create</button>
        </form>
      </section>

      {selectedUser && goals && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Daily Goals</h3>
          <GoalForm key={selectedUser.id} goals={goals} onSave={handleSaveGoals} />
        </section>
      )}
    </div>
  );
}
