import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { fetchUsers } from '../api'

const STORAGE_KEY = 'brotein_user_id'

interface UserContextValue {
  users: User[]
  selectedUser: User | null
  selectUser: (id: string) => void
  refreshUsers: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  )

  const applyUsers = (list: User[]) => {
    setUsers(list)
    // If stored selection is invalid or empty, pick first user
    setSelectedId((prev) => {
      const valid = list.find((u) => u.id === prev)
      if (valid) return prev
      const first = list[0]?.id ?? null
      if (first) localStorage.setItem(STORAGE_KEY, first)
      else localStorage.removeItem(STORAGE_KEY)
      return first
    })
  }

  useEffect(() => {
    fetchUsers().then(applyUsers)
  }, [])

  const selectUser = (id: string) => {
    setSelectedId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  const selectedUser = users.find((u) => u.id === selectedId) ?? null

  return (
    <UserContext.Provider
      value={{ users, selectedUser, selectUser, refreshUsers: () => fetchUsers().then(applyUsers) }}
    >
      {children}
    </UserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
