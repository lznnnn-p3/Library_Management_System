import { createContext, useContext, useState, useCallback } from 'react'
import { login as loginApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem('menus')
    return saved ? JSON.parse(saved) : []
  })

  const login = useCallback(async (username, password) => {
    const res = await loginApi({ username, password })
    const { token, nickname, roles, menus: menuData } = res.data
    localStorage.setItem('token', token)
    const userData = { username, nickname, roles }
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('menus', JSON.stringify(menuData))
    setUser(userData)
    setMenus(menuData)
    return res
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('menus')
    setUser(null)
    setMenus([])
  }, [])

  return (
    <AuthContext.Provider value={{ user, menus, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
