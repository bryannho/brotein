import { NavLink } from 'react-router-dom';
import UserSelector from './UserSelector';

const linkStyle: React.CSSProperties = {
  padding: '0.4em 0.8em',
  textDecoration: 'none',
  color: 'inherit',
  borderRadius: '6px',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  fontWeight: 700,
  textDecoration: 'underline',
};

export default function Header() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        borderBottom: '1px solid #444',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4em', margin: 0 }}>Bigger</h1>
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          <NavLink
            to="/daily"
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
          >
            Daily
          </NavLink>
          <NavLink
            to="/weekly"
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
          >
            Weekly
          </NavLink>
          <NavLink
            to="/account"
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
          >
            Account
          </NavLink>
        </nav>
      </div>
      <UserSelector />
    </header>
  );
}
