import { useState } from 'react';
import type { Goals } from '../types';
import GoalForm from '../components/GoalForm';

const initialGoals: Goals = {
  user_id: '1',
  calories_goal: 2200,
  protein_goal: 160,
  carbs_goal: 200,
  sugar_goal: 40,
};

export default function AccountPage() {
  const [newUserName, setNewUserName] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    console.log('Create user:', newUserName);
    setNewUserName('');
  };

  const handleSaveGoals = (goals: Goals) => {
    console.log('Save goals:', goals);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Account</h2>

      <section
        style={{
          padding: '1.25rem',
          border: '1px solid #444',
          borderRadius: '10px',
          background: '#1e1e1e',
          marginBottom: '1.5rem',
        }}
      >
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
          <button type="submit">Create</button>
        </form>
      </section>

      <section
        style={{
          padding: '1.25rem',
          border: '1px solid #444',
          borderRadius: '10px',
          background: '#1e1e1e',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Daily Goals</h3>
        <GoalForm goals={initialGoals} onSave={handleSaveGoals} />
      </section>
    </div>
  );
}
