import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3, BriefcaseBusiness, CalendarCheck, ChevronLeft, ChevronRight,
  ClipboardCheck, FileBarChart, Gauge, LayoutDashboard, Menu, Settings,
  UserRound, Users, X,
} from 'lucide-react'

const navigation = {
  admin: [
    ['Dashboard', '/dashboard', LayoutDashboard], ['Employees', '/employees', Users], ['Performance', '/performance', Gauge],
    ['Analytics', '/analytics', BarChart3], ['Attendance', '/attendance', CalendarCheck], ['Projects', '/projects', BriefcaseBusiness],
    ['Reports', '/reports', FileBarChart], ['Profile', '/profile', UserRound], ['Settings', '/settings', Settings],
  ],
  manager: [
    ['Dashboard', '/dashboard', LayoutDashboard], ['My Team', '/employees', Users], ['Performance', '/performance', Gauge],
    ['Analytics', '/analytics', BarChart3], ['Attendance', '/attendance', CalendarCheck], ['Projects', '/projects', BriefcaseBusiness],
    ['Profile', '/profile', UserRound],
  ],
  employee: [
    ['Dashboard', '/dashboard', LayoutDashboard], ['My Performance', '/performance', Gauge], ['My Attendance', '/attendance', CalendarCheck],
    ['My Projects', '/projects', BriefcaseBusiness], ['My Report', '/reports', FileBarChart], ['Profile', '/profile', UserRound],
  ],
}

export default function Sidebar({ role }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const links = navigation[role] || navigation.employee

  return (
    <>
      <button className="fixed left-4 top-4 z-40 rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden" type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
        <Menu size={20} />
      </button>
      {mobileOpen && <button className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:static lg:z-auto ${collapsed ? 'lg:w-20' : 'lg:w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-64`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <div className={`flex items-center gap-3 text-xl font-bold text-indigo-700 ${collapsed ? 'lg:mx-auto' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100"><BarChart3 size={20} /></span>
            <span className={collapsed ? 'lg:hidden' : ''}>PEAS</span>
          </div>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={19} /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map(([label, path, Icon]) => (
            <NavLink key={path} to={path} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${collapsed ? 'lg:justify-center' : ''}`} title={collapsed ? label : undefined}>
              <Icon className="shrink-0" size={19} />
              <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/notifications" onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${collapsed ? 'lg:justify-center' : ''}`} title={collapsed ? 'Notifications' : undefined}>
            <ClipboardCheck className="shrink-0" size={19} /><span className={collapsed ? 'lg:hidden' : ''}>Notifications</span>
          </NavLink>
        </nav>
        <button className="m-3 hidden items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 lg:flex" type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>
    </>
  )
}