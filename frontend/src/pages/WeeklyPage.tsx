import { useState, useEffect } from 'react'
import type { DayEntry } from '../types'
import { useUser } from '../context/UserContext'
import { fetchWeekly } from '../api'
import WeeklyCharts from '../components/WeeklyCharts'

export default function WeeklyPage() {
  const { selectedUser } = useUser()
  const [days, setDays] = useState<DayEntry[]>([])

  useEffect(() => {
    if (!selectedUser) return
    fetchWeekly(selectedUser.id)
      .then((data) => setDays(data.days))
      .catch(() => setDays([]))
  }, [selectedUser])

  if (!selectedUser) return null

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontWeight: 700 }}>Weekly Overview</h2>
      <WeeklyCharts days={days} />
    </div>
  )
}
