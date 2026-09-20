import { useEffect, useState } from 'react'
import { Clock3, Search, UserRound, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { getEmployees } from '../services/storageService.js'
import { calculateAverageAttendance } from '../utils/performanceUtils.js'

function attendanceTone(value) {
  if (value > 90) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (value >= 75) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

function attendanceRecord(employee) {
  // Daily attendance is not stored; these counts are transparent, simulated equivalents from the percentage.
  const totalDays = 20
  const present = Math.round((employee.attendance / 100) * totalDays)
  const leave = employee.status === 'On Leave' ? 1 : 0
  const remaining = Math.max(totalDays - present - leave, 0)
  return { employee, present, absent: Math.round(remaining * 0.65), late: remaining - Math.round(remaining * 0.65), leave }
}

function Panel({ children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>
}

function AttendanceValue({ value }) {
  return <div className="min-w-32"><div className="flex items-center justify-between gap-2"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${attendanceTone(value)}`}>{value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${value > 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${value}%` }} /></div></div>
}

export default function Attendance() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    queueMicrotask(() => setEmployees(getEmployees()))
  }, [])

  if (!employees) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500"><Clock3 className="mr-2 animate-pulse" size={18} /> Loading attendance data...</div>

  const ownEmployee = employees.find((employee) => employee.employeeId === user?.employeeId)
  const scopedEmployees = user?.role === 'manager' ? employees.filter((employee) => employee.department === user.managedDepartment) : user?.role === 'employee' ? (ownEmployee ? [ownEmployee] : []) : employees
  const normalizedQuery = query.trim().toLowerCase()
  const visibleEmployees = scopedEmployees.filter((employee) => !normalizedQuery || employee.name.toLowerCase().includes(normalizedQuery))
  const records = visibleEmployees.map(attendanceRecord)
  const average = calculateAverageAttendance(visibleEmployees)
  const totals = records.reduce((result, record) => ({ present: result.present + record.present, absent: result.absent + record.absent, leave: result.leave + record.leave }), { present: 0, absent: 0, leave: 0 })

  if (user?.role === 'employee') return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Attendance overview</p><h2 className="mt-1 text-2xl font-bold text-slate-900">My Attendance</h2></div>{records.length ? <Panel><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><UserRound size={22} /></span><div><h3 className="font-bold text-slate-900">{records[0].employee.name}</h3><p className="text-sm text-slate-500">{records[0].employee.department} · {records[0].employee.employeeId}</p></div></div><div className="mt-7"><AttendanceValue value={records[0].employee.attendance} /></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl bg-emerald-50 p-4 text-center"><p className="text-2xl font-bold text-emerald-700">{records[0].present}</p><p className="text-xs text-slate-500">Present</p></div><div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-2xl font-bold text-slate-700">{records[0].absent}</p><p className="text-xs text-slate-500">Absent</p></div><div className="rounded-xl bg-amber-50 p-4 text-center"><p className="text-2xl font-bold text-amber-700">{records[0].late}</p><p className="text-xs text-slate-500">Late</p></div><div className="rounded-xl bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-700">{records[0].leave}</p><p className="text-xs text-slate-500">Leave</p></div></div></Panel> : <Panel><p className="py-12 text-center text-sm text-slate-500">No data available.</p></Panel>}</div>

  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Workforce attendance</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Attendance</h2><p className="mt-1 text-sm text-slate-500">A clear view of attendance across the visible employee set.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Average attendance</p><p className="mt-3 text-2xl font-bold text-slate-900">{average}%</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Present-equivalent</p><p className="mt-3 text-2xl font-bold text-emerald-700">{totals.present}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Absent-equivalent</p><p className="mt-3 text-2xl font-bold text-slate-700">{totals.absent}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Leave-equivalent</p><p className="mt-3 text-2xl font-bold text-blue-700">{totals.leave}</p></div></div><Panel><label className="relative block max-w-xl"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Search employees by name" value={query} onChange={(event) => setQuery(event.target.value)} /></label></Panel>{visibleEmployees.length ? <Panel><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3 font-semibold">Employee</th><th className="px-4 py-3 font-semibold">Department</th><th className="px-4 py-3 font-semibold">Attendance</th><th className="px-4 py-3 font-semibold">Present</th><th className="px-4 py-3 font-semibold">Absent</th><th className="px-4 py-3 font-semibold">Late</th><th className="px-4 py-3 font-semibold">Leave</th></tr></thead><tbody className="divide-y divide-slate-100">{records.map((record) => <tr key={record.employee.id}><td className="px-4 py-4 font-semibold text-slate-800">{record.employee.name}<span className="ml-2 text-xs font-normal text-slate-400">{record.employee.employeeId}</span></td><td className="px-4 py-4 text-slate-500">{record.employee.department}</td><td className="px-4 py-4"><AttendanceValue value={record.employee.attendance} /></td><td className="px-4 py-4 text-emerald-700">{record.present}</td><td className="px-4 py-4 text-slate-600">{record.absent}</td><td className="px-4 py-4 text-amber-700">{record.late}</td><td className="px-4 py-4 text-blue-700">{record.leave}</td></tr>)}</tbody></table></div><div className="space-y-3 md:hidden">{records.map((record) => <div key={record.employee.id} className="rounded-xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-800">{record.employee.name}</p><p className="text-xs text-slate-500">{record.employee.department}</p></div><AttendanceValue value={record.employee.attendance} /></div><div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs"><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">P {record.present}</span><span className="rounded-lg bg-slate-50 p-2 text-slate-600">A {record.absent}</span><span className="rounded-lg bg-amber-50 p-2 text-amber-700">L {record.late}</span><span className="rounded-lg bg-blue-50 p-2 text-blue-700">Leave {record.leave}</span></div></div>)}</div></Panel> : <Panel><div className="py-12 text-center"><Users className="mx-auto text-slate-300" size={36} /><p className="mt-3 text-sm text-slate-500">No data available.</p></div></Panel>}</div>
}