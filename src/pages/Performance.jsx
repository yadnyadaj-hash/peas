import { useEffect, useState } from 'react'
import { Activity, Award, ClipboardCheck, Gauge, Save, Search, ShieldCheck, SlidersHorizontal, Users, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { DEPARTMENTS } from '../data/employees.js'
import { addNotification, getEmployees, updateEmployee } from '../services/storageService.js'
import { calculateAveragePerformance, calculateOverallPerformance, getPerformanceDistribution, getPerformanceRating, getRatingColor } from '../utils/performanceUtils.js'

const kpis = [
  ['productivity', 'Productivity'],
  ['quality', 'Quality'],
  ['teamwork', 'Teamwork'],
  ['communication', 'Communication'],
  ['attendance', 'Attendance'],
]

function formatScore(score) {
  return `${Number(score || 0).toFixed(1)}%`
}

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function RatingBadge({ score }) {
  const rating = getPerformanceRating(score)
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRatingColor(rating)}`}>{rating}</span>
}

function Panel({ title, subtitle, children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}><div className="mb-5"><h2 className="text-base font-bold text-slate-900">{title}</h2>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>{children}</section>
}

function StatCard({ label, value, icon: Icon, color }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={20} /></span></div></div>
}

function KpiBars({ employee }) {
  return <div className="space-y-4">{kpis.map(([key, label]) => <div key={key}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-600">{label}</span><span className="font-bold text-slate-800">{employee[key]}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${employee[key]}%` }} /></div></div>)}</div>
}

function EvaluationModal({ employee, onClose, onSaved }) {
  const [values, setValues] = useState(() => Object.fromEntries(kpis.map(([key]) => [key, employee[key]])))
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const previewEmployee = { ...employee, ...values }
  const score = calculateOverallPerformance(previewEmployee)

  function updateKpi(key, value) {
    setValues((current) => ({ ...current, [key]: Number(value) }))
  }

  function saveEvaluation(event) {
    event.preventDefault()
    setSaving(true)
    updateEmployee(employee.id, { ...values, performance: score, evaluationNotes: notes })
    addNotification(`Performance evaluation updated for ${employee.name}`)
    onSaved(`Performance evaluation updated for ${employee.name}.`)
  }

  return <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="evaluation-title"><div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Performance review</p><h2 id="evaluation-title" className="mt-1 text-xl font-bold text-slate-900">Evaluate {employee.name}</h2><p className="mt-1 text-sm text-slate-500">{employee.department} · {employee.designation}</p></div><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close evaluation" onClick={onClose}><X size={20} /></button></div><form className="space-y-6 p-5 sm:p-6" onSubmit={saveEvaluation}><div className="flex items-center justify-between rounded-xl bg-indigo-50 p-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Live overall score</p><p className="mt-1 text-3xl font-bold text-indigo-700">{formatScore(score)}</p></div><RatingBadge score={score} /></div><div className="space-y-5">{kpis.map(([key, label]) => <label key={key} className="block"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">{label}</span><output className="font-bold text-indigo-700">{values[key]}%</output></div><input className="h-2 w-full cursor-pointer accent-indigo-600" type="range" min="0" max="100" value={values[key]} onChange={(event) => updateKpi(key, event.target.value)} aria-label={label} /><div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>0</span><span>100</span></div></label>)}</div><label className="block text-sm font-medium text-slate-700">Evaluation notes <textarea className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add optional comments about this evaluation..." /></label><div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onClose}>Cancel</button><button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60" type="submit" disabled={saving}><Save size={17} />{saving ? 'Saving...' : 'Save Evaluation'}</button></div></form></div></div>
}

function EmployeeView({ employee }) {
  const score = calculateOverallPerformance(employee)
  return <div className="space-y-6"><section className="rounded-2xl bg-indigo-700 p-6 text-white shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">My performance</p><h2 className="mt-2 text-2xl font-bold">{employee.name}</h2><p className="mt-2 text-indigo-100">{employee.designation} · {employee.department}</p></div><div className="flex items-center gap-4"><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-8 border-indigo-400/60 bg-indigo-800"><span className="text-2xl font-bold">{formatScore(score)}</span><span className="text-[10px] uppercase text-indigo-200">overall</span></div><RatingBadge score={score} /></div></div></section><div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><Panel title="Current KPI scores" subtitle="Your latest recorded evaluation"><KpiBars employee={employee} /></Panel><Panel title="Evaluation access"><div className="rounded-xl bg-slate-50 p-5"><ShieldCheck className="text-indigo-600" size={24} /><p className="mt-3 text-sm leading-6 text-slate-600">Your performance is evaluated by your manager. Contact them for details.</p></div></Panel></div></div>
}

export default function Performance() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState(null)
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    queueMicrotask(() => setEmployees(getEmployees()))
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(timeout)
  }, [toast])

  if (!employees) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500"><Activity className="mr-2 animate-pulse" size={18} /> Loading performance data...</div>

  const ownEmployee = employees.find((employee) => employee.employeeId === user?.employeeId)
  if (user?.role === 'employee') return ownEmployee ? <EmployeeView employee={ownEmployee} /> : <Panel title="Performance unavailable"><p className="text-sm text-slate-500">Your employee record could not be found.</p></Panel>

  const scopedEmployees = user?.role === 'manager' ? employees.filter((employee) => employee.department === user.managedDepartment) : employees
  const normalizedQuery = query.trim().toLowerCase()
  const visibleEmployees = scopedEmployees.filter((employee) => {
    const matchesQuery = !normalizedQuery || employee.name.toLowerCase().includes(normalizedQuery) || employee.employeeId.toLowerCase().includes(normalizedQuery)
    return matchesQuery && (department === 'All' || employee.department === department)
  })
  const distribution = getPerformanceDistribution(scopedEmployees)

  function handleSaved(message) {
    setSelectedEmployee(null)
    setEmployees(getEmployees())
    setToast(message)
  }

  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Performance reviews</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Performance Evaluation</h2><p className="mt-1 text-sm text-slate-500">Review current KPI scores and record evaluations.</p></div>{toast && <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">{toast}<button type="button" aria-label="Dismiss message" onClick={() => setToast('')}><X size={17} /></button></div>}<div className="grid gap-4 sm:grid-cols-3"><StatCard label={user?.role === 'manager' ? 'Team average score' : 'Company average score'} value={formatScore(calculateAveragePerformance(scopedEmployees))} icon={Gauge} color="bg-indigo-100 text-indigo-700" /><StatCard label="Excellent performers" value={distribution.Excellent} icon={Award} color="bg-emerald-100 text-emerald-700" /><StatCard label="Needs improvement" value={distribution['Needs Improvement'] + distribution.Poor} icon={ClipboardCheck} color="bg-amber-100 text-amber-700" /></div><Panel title={user?.role === 'manager' ? `${user.managedDepartment} team evaluations` : 'Employee evaluations'} subtitle="Select an employee to review or update their five KPI scores"><div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative block"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Search by name or employee ID" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="relative block"><SlidersHorizontal className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} /><select className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={department} onChange={(event) => setDepartment(event.target.value)}><option value="All">All departments</option>{DEPARTMENTS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>{visibleEmployees.length ? <div className="divide-y divide-slate-100">{visibleEmployees.map((employee) => { const score = calculateOverallPerformance(employee); return <button key={employee.id} className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:bg-slate-50 sm:px-3" type="button" onClick={() => setSelectedEmployee(employee)}><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{initials(employee.name)}</span><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{employee.name}</p><p className="text-xs text-slate-500">{employee.department} · {employee.employeeId}</p></div></div><div className="flex shrink-0 items-center gap-3"><div className="hidden text-right sm:block"><p className="font-bold text-slate-800">{formatScore(score)}</p><RatingBadge score={score} /></div><span className="rounded-xl border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700">Evaluate</span></div></button>})}</div> : <div className="rounded-xl bg-slate-50 px-4 py-12 text-center text-sm text-slate-500"><Users className="mx-auto mb-3 text-slate-300" size={32} />No employees match your search or department filter.</div>}</Panel>{selectedEmployee && <EvaluationModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} onSaved={handleSaved} />}</div>
}