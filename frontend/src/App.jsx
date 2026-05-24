import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from './context/AuthContext'
import MainLayout from './components/MainLayout'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const User = lazy(() => import('./pages/system/User'))
const Role = lazy(() => import('./pages/system/Role'))
const BookList = lazy(() => import('./pages/book/BookList'))
const BookBorrow = lazy(() => import('./pages/book/BookBorrow'))
const BookRecord = lazy(() => import('./pages/book/BookRecord'))

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function Loading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: 300,
      background: 'var(--bg-page)',
    }}>
      <Spin size="large" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="system/user" element={<User />} />
          <Route path="system/role" element={<Role />} />
          <Route path="book/list" element={<BookList />} />
          <Route path="book/borrow" element={<BookBorrow />} />
          <Route path="book/record" element={<BookRecord />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
