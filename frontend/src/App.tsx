import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import DailyPage from './pages/DailyPage'
import WeeklyPage from './pages/WeeklyPage'
import AccountPage from './pages/AccountPage'

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/daily" replace />} />
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/weekly" element={<WeeklyPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </div>
  )
}

export default App
