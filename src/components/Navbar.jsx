import { Bell, LogOut } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getNotifications } from '../services/storageService.js'

const titles = {
  dashboard: 'Dashboard', employees: 'Employees', performance: 'Performance', analytics: 'Analytics', attendance: 'Attendance',
  projects: 'Projects', reports: 'Reports', notifications: 'Notifications', profile: 'Profile', settings: 'Settings',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const unreadCount = getNotifications().filter((notification) => !notification.read).length
  const currentSegment = location.pathname.split('/')[1]
  const title = location.pathname.includes('/employees/') ? 'Employee Details' : titles[currentSegment] || 'Workspace'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 pl-20 sm:px-8 sm:pl-20 lg:pl-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">PEAS workspace</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600" type="button" aria-label="View notifications" onClick={() => navigate('/notifications')}>
          <Bell size={20} />
          {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">{unreadCount}</span>}
        </button>
        <div className="hidden items-center gap-3 border-l border-slate-200 pl-5 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{user?.name?.charAt(0)}</span>
          <div><p className="text-sm font-semibold text-slate-800">{user?.name}</p><p className="text-xs capitalize text-slate-500">{user?.role}</p></div>
        </div>
        <button className="rounded-xl p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600" type="button" aria-label="Logout" title="Logout" onClick={handleLogout}><LogOut size={19} /></button>
      </div>
    </header>
  )
}