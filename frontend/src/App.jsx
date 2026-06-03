import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
const AnnouncementList = lazy(() => import('./pages/announcement/AnnouncementList'))
const NotFound = lazy(() => import('./pages/NotFound'))

function hasPermission(menus, pathname) {
  for (const menu of menus) {
    if (menu.path && pathname.startsWith(menu.path)) return true
    if (menu.children && hasPermission(menu.children, pathname)) return true
  }
  return false
}

const PUBLIC_ROUTES = ['/dashboard', '/profile']

function PrivateRoute({ children }) {
  const { user, menus } = useAuth()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/login" replace />
  if (menus.length === 0) return <Loading />
  const isPublic = pathname === '/' || PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  if (!isPublic && !hasPermission(menus, pathname)) {
    return <Navigate to="/404" replace />
  }
  return children
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
          <Route path="announcement/list" element={<AnnouncementList />} />
        </Route>
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}
