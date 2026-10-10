import { useEffect, useState } from 'react'
import { Activity, Award, ClipboardCheck, Gauge, Save, Search, ShieldCheck, SlidersHorizontal, Users, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { KPI_CRITERIA, KPI_RATING_LABELS } from '../data/kpiCriteria.js'
import { DEPARTMENTS } from '../data/employees.js'
import { addNotification, getEmployees, updateEmployee } from '../services/storageService.js'
import { calculateAveragePerformance, calculateKpiFromRatings, calculateOverallPerformance, getPerformanceDistribution, getPerformanceRating, getRatingColor } from '../utils/performanceUtils.js'

const manualKpis = Object.keys(KPI_CRITERIA)
const allKpis = [...manualKpis, 'attendance']

function formatScore(value) {
  return `${Number(value || 0).toFixed(1)}%`
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

function seedRatings(employee) {
  return Object.fromEntries(manualKpis.map((key) => {
    const existing = employee.evaluation?.ratings?.[key]
    const initialRating = Math.min(5, Math.max(1, Math.round(Number(employee[key] || 0) / 20)))
    return [key, Array.from({ length: KPI_CRITERIA[key].criteria.length }, (_, index) => Number(existing?.[index] ?? initialRating))]
  }))
}

function CriteriaBreakdown({ evaluation }) {
  if (!evaluation?.ratings) return null
  return <div className="space-y-5">{manualKpis.map((key) => <div key={key} className="rounded-xl bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-slate-800">{KPI_CRITERIA[key].label}</h3><span className="text-sm font-bold text-indigo-700">{calculateKpiFromRatings(evaluation.ratings[key] || [])}%</span></div><ul className="mt-3 space-y-2">{KPI_CRITERIA[key].criteria.map((criterion, index) => { const rating = evaluation.ratings[key]?.[index]; return <li key={criterion} className="flex flex-col justify-between gap-1 text-sm sm:flex-row sm:items-center"><span className="text-slate-600">{criterion}</span><span className="shrink-0 font-medium text-slate-700">{rating ?? '–'}{rating ? ` · ${KPI_RATING_LABELS[rating]}` : ''}</span></li> })}</ul></div>)}{evaluation.comments && <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Manager comments</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{evaluation.comments}</p></div>}</div>
}

function EvaluationModal({ employee, user, onClose, onSaved }) {
  const [ratings, setRatings] = useState(() => seedRatings(employee))
  const [comments, setComments] = useState(employee.evaluation?.comments || '')
  const [saving, setSaving] = useState(false)
  const previewValues = Object.fromEntries(manualKpis.map((key) => [key, calculateKpiFromRatings(ratings[key])]))
  const previewEmployee = { ...employee, ...previewValues, attendance: employee.attendance }
  const overallScore = calculateOverallPerformance(previewEmployee)

  function updateRating(kpi, index, value) {
    setRatings((current) => ({
      ...current,
      [kpi]: current[kpi].map((rating, ratingIndex) => ratingIndex === index ? value : rating),
    }))
  }

  function saveEvaluation(event) {
    event.preventDefault()
    setSaving(true)
    const evaluatedAt = new Date()
    const lastReviewDate = [evaluatedAt.getFullYear(), String(evaluatedAt.getMonth() + 1).padStart(2, '0'), String(evaluatedAt.getDate()).padStart(2, '0')].join('-')
    const updatedFields = {
      ...previewValues,
      performance: overallScore,
      lastReviewDate,
      evaluation: {
        ratings,
        comments: comments.trim(),
        evaluatedBy: user?.name || 'PEAS evaluator',
        evaluatedAt: evaluatedAt.toISOString(),
      },
    }
    updateEmployee(employee.id, updatedFields)
    addNotification(`Performance evaluation updated for ${employee.name}`)
    onSaved(`Performance evaluation updated for ${employee.name}.`)
  }

  return <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-3 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="evaluation-title"><div className="my-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Performance review</p><h2 id="evaluation-title" className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">Evaluate {employee.name}</h2><p className="mt-1 text-sm text-slate-500">{employee.department} · {employee.designation}</p></div><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close evaluation" onClick={onClose}><X size={20} /></button></div><form className="space-y-5 p-4 sm:p-6" onSubmit={saveEvaluation}><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 p-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Live overall score</p><p className="mt-1 text-3xl font-bold text-indigo-700">{formatScore(overallScore)}</p></div><RatingBadge score={overallScore} /></div><div className="grid gap-4 lg:grid-cols-2">{manualKpis.map((key) => <section key={key} className="rounded-xl border border-slate-200 p-4"><div className="mb-4 flex items-center justify-between gap-2"><h3 className="font-bold text-slate-800">{KPI_CRITERIA[key].label}</h3><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-700">{previewValues[key]}%</span></div><div className="space-y-4">{KPI_CRITERIA[key].criteria.map((criterion, index) => <div key={criterion}><p className="mb-2 text-sm leading-5 text-slate-600">{criterion}</p><div className="grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((value) => { const selected = ratings[key][index] === value; return <button key={value} className={`min-h-11 rounded-lg border text-sm font-bold transition ${selected ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`} type="button" aria-label={`${criterion}: ${value} ${KPI_RATING_LABELS[value]}`} aria-pressed={selected} onClick={() => updateRating(key, index, value)}>{value}</button> })}</div><p className="mt-1 min-h-4 text-xs font-medium text-indigo-700">{KPI_RATING_LABELS[ratings[key][index]]}</p></div>)}</div></section>)}</div><div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800">Attendance</p><p className="text-sm text-slate-500">Auto-calculated from attendance records</p></div><span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1.5 text-sm font-bold text-blue-700">{formatScore(employee.attendance)}</span></div><label className="block text-sm font-medium text-slate-700">Manager comments <textarea className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Optional evaluation comments..." /></label><div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onClose}>Cancel</button><button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60" type="submit" disabled={saving}><Save size={17} />{saving ? 'Saving...' : 'Save Evaluation'}</button></div></form></div></div>
}

function KpiBars({ employee }) {
  return <div className="space-y-4">{allKpis.map((key) => <div key={key}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium capitalize text-slate-600">{key}</span><span className="font-bold text-slate-800">{employee[key]}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${employee[key]}%` }} /></div></div>)}</div>
}

function EmployeeView({ employee }) {
  const score = calculateOverallPerformance(employee)
  return <div className="space-y-6"><section className="rounded-2xl bg-indigo-700 p-6 text-white shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">My performance</p><h2 className="mt-2 text-2xl font-bold">{employee.name}</h2><p className="mt-2 text-indigo-100">{employee.designation} · {employee.department}</p></div><div className="flex items-center gap-4"><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-8 border-indigo-400/60 bg-indigo-800"><span className="text-2xl font-bold">{formatScore(score)}</span><span className="text-[10px] uppercase text-indigo-200">overall</span></div><RatingBadge score={score} /></div></div></section><div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><Panel title="Current KPI scores" subtitle="Your latest recorded evaluation"><KpiBars employee={employee} /></Panel><Panel title="Evaluation access"><div className="rounded-xl bg-slate-50 p-5"><ShieldCheck className="text-indigo-600" size={24} /><p className="mt-3 text-sm leading-6 text-slate-600">Your performance is evaluated by your manager. Contact them for details.</p></div></Panel></div>{employee.evaluation && <Panel title="Evaluation breakdown" subtitle={`Evaluated by ${employee.evaluation.evaluatedBy || 'your manager'}${employee.evaluation.evaluatedAt ? ` · ${new Date(employee.evaluation.evaluatedAt).toLocaleDateString()}` : ''}`}><CriteriaBreakdown evaluation={employee.evaluation} /></Panel>}</div>
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

  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Performance reviews</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Performance Evaluation</h2><p className="mt-1 text-sm text-slate-500">Review current KPI scores and record evaluations.</p></div>{toast && <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">{toast}<button type="button" aria-label="Dismiss message" onClick={() => setToast('')}><X size={17} /></button></div>}<div className="grid gap-4 sm:grid-cols-3"><StatCard label={user?.role === 'manager' ? 'Team average score' : 'Company average score'} value={formatScore(calculateAveragePerformance(scopedEmployees))} icon={Gauge} color="bg-indigo-100 text-indigo-700" /><StatCard label="Excellent performers" value={distribution.Excellent} icon={Award} color="bg-emerald-100 text-emerald-700" /><StatCard label="Needs improvement" value={distribution['Needs Improvement'] + distribution.Poor} icon={ClipboardCheck} color="bg-amber-100 text-amber-700" /></div><Panel title={user?.role === 'manager' ? `${user.managedDepartment} team evaluations` : 'Employee evaluations'} subtitle="Select an employee to review or update their four scored KPIs"><div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative block"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Search by name or employee ID" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="relative block"><SlidersHorizontal className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} /><select className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={department} onChange={(event) => setDepartment(event.target.value)}><option value="All">All departments</option>{DEPARTMENTS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>{visibleEmployees.length ? <div className="divide-y divide-slate-100">{visibleEmployees.map((employee) => { const score = calculateOverallPerformance(employee); return <button key={employee.id} className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:bg-slate-50 sm:px-3" type="button" onClick={() => setSelectedEmployee(employee)}><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{initials(employee.name)}</span><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{employee.name}</p><p className="text-xs text-slate-500">{employee.department} · {employee.employeeId}</p></div></div><div className="flex shrink-0 items-center gap-3"><div className="hidden text-right sm:block"><p className="font-bold text-slate-800">{formatScore(score)}</p><RatingBadge score={score} /></div><span className="rounded-xl border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700">Evaluate</span></div></button>})}</div> : <div className="rounded-xl bg-slate-50 px-4 py-12 text-center text-sm text-slate-500"><Users className="mx-auto mb-3 text-slate-300" size={32} />No employees match your search or department filter.</div>}</Panel>{selectedEmployee && <EvaluationModal employee={selectedEmployee} user={user} onClose={() => setSelectedEmployee(null)} onSaved={handleSaved} />}</div>
}