import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import ManagerLayout from './layouts/ManagerLayout.jsx'
import EmployeeLayout from './layouts/EmployeeLayout.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Employees from './pages/Employees.jsx'
import EmployeeDetails from './pages/EmployeeDetails.jsx'
import Performance from './pages/Performance.jsx'
import Analytics from './pages/Analytics.jsx'
import Attendance from './pages/Attendance.jsx'
import Projects from './pages/Projects.jsx'
import Reports from './pages/Reports.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import Notifications from './pages/Notifications.jsx'

const roleRoutes = {
  admin: {
    layout: AdminLayout,
    paths: ['dashboard', 'employees', 'performance', 'analytics', 'attendance', 'projects', 'reports', 'notifications', 'profile', 'settings'],
  },
  manager: {
    layout: ManagerLayout,
    paths: ['dashboard', 'performance', 'analytics', 'attendance', 'projects', 'notifications', 'profile'],
  },
  employee: {
    layout: EmployeeLayout,
    paths: ['dashboard', 'performance', 'attendance', 'projects', 'reports', 'notifications', 'profile'],
  },
}

function RoleLayout() {
  const { user } = useAuth()
  const Layout = roleRoutes[user?.role]?.layout || EmployeeLayout
  return <Layout />
}

function RootRedirect() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">Loading PEAS...</div>
  }

  return <Navigate to={user ? '/dashboard' : '/login'} state={{ from: location }} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeDetails />} />
          </Route>
          <Route path="performance" element={<Performance />} />
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="analytics" element={<Analytics />} />
          </Route>
          <Route path="attendance" element={<Attendance />} />
          <Route path="projects" element={<Projects />} />
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App