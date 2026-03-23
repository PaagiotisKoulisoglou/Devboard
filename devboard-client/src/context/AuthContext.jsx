import { createContext, useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../api/axios'
import {
  setCredentials,
  clearCredentials,
  setLoading,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
} from '../store/slices/authSlice'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const dispatch         = useDispatch()
  const user             = useSelector(selectUser)
  const isAuthenticated  = useSelector(selectIsAuthenticated)
  const loading          = useSelector(selectAuthLoading)

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }))
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }))
    return data
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch { /* ignore */ }
    dispatch(clearCredentials())
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await api.post('/auth/refresh')
        dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }))
      } catch {
        dispatch(clearCredentials())
      }
    }
    bootstrap()
  }, [dispatch])

  useEffect(() => {
    const handle = () => dispatch(clearCredentials())
    window.addEventListener('auth:logout', handle)
    return () => window.removeEventListener('auth:logout', handle)
  }, [dispatch])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
