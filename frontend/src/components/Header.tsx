import { NavLink } from 'react-router-dom';
import UserSelector from './UserSelector';

export default function Header() {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4em', margin: 0 }}>brotein</h1>
        <nav>
          <NavLink to="/daily" className={({ isActive }) => isActive ? 'active' : ''}>
            Daily
          </NavLink>
          <NavLink to="/weekly" className={({ isActive }) => isActive ? 'active' : ''}>
            Weekly
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => isActive ? 'active' : ''}>
            Account
          </NavLink>
        </nav>
      </div>
      <UserSelector />
    </header>
  );
}
