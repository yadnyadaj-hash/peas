import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Mail, Pencil, Phone, Trash2, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { KPI_CRITERIA, KPI_RATING_LABELS } from '../data/kpiCriteria.js'
import { deleteEmployee, getEmployeeById } from '../services/storageService.js'
import { calculateKpiFromRatings, calculateOverallPerformance, getPerformanceRating, getRatingColor } from '../utils/performanceUtils.js'
import EmployeeFormModal, { ConfirmDeleteDialog } from '../components/EmployeeFormModal.jsx'

const kpis = [
  ['productivity', 'Productivity'],
  ['quality', 'Quality'],
  ['teamwork', 'Teamwork'],
  ['communication', 'Communication'],
  ['attendance', 'Attendance'],
]

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status === 'Active' ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-amber-200 bg-amber-100 text-amber-700'}`}>{status}</span>
}

function InfoItem({ icon: Icon, label, value }) {
  return <div className="flex items-start gap-3"><Icon className="mt-0.5 shrink-0 text-indigo-600" size={18} /><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-700">{value || 'Not provided'}</p></div></div>
}

export default function EmployeeDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toast, setToast] = useState('')

  const refresh = useCallback(() => {
    const found = getEmployeeById(id)
    const allowed = user?.role === 'admin' || (user?.role === 'manager' && found?.department === user.managedDepartment)
    setEmployee(allowed ? found : null)
  }, [id, user])

  useEffect(() => {
    queueMicrotask(refresh)
  }, [refresh])

  function handleSaved(message) {
    setFormOpen(false)
    refresh()
    setToast(message)
  }

  function handleDelete() {
    deleteEmployee(employee.id)
    navigate('/employees', { replace: true, state: { message: 'Employee deleted successfully.' } })
  }

  if (employee === undefined) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading employee...</div>

  if (!employee) {
    return <div className="flex min-h-[55vh] items-center justify-center"><div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><UserRound className="mx-auto text-indigo-600" size={42} /><h2 className="mt-4 text-2xl font-bold text-slate-900">Employee not found</h2><p className="mt-2 text-sm leading-6 text-slate-500">This employee may have been removed or is outside your department.</p><Link className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700" to="/employees"><ArrowLeft size={17} /> Back to Employees</Link></div></div>
  }

  const score = calculateOverallPerformance(employee)
  const rating = getPerformanceRating(score)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3"><Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600" to="/employees"><ArrowLeft size={17} /> Back to Employees</Link>{toast && <p className="text-sm font-medium text-emerald-700" role="status">{toast}</p>}</div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-700">{initials(employee.name)}</span><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1><StatusBadge status={employee.status} /></div><p className="mt-1 text-slate-500">{employee.designation} · {employee.department}</p><p className="mt-2 text-sm font-medium text-slate-400">{employee.employeeId}</p></div></div><div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={() => setFormOpen(true)}><Pencil size={16} /> Edit</button><button className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50" type="button" onClick={() => setDeleteOpen(true)}><Trash2 size={16} /> Delete</button></div></div></section>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Overall performance</p><div className="mt-6 flex items-center gap-6"><div className={`flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[12px] text-3xl font-bold ${getRatingColor(rating)}`}>{score.toFixed(1)}%</div><div><span className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${getRatingColor(rating)}`}>{rating}</span><p className="mt-3 text-sm leading-6 text-slate-500">Calculated from five current performance KPIs.</p></div></div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-base font-bold text-slate-900">KPI breakdown</h2><div className="mt-5 space-y-4">{kpis.map(([key, label]) => <div key={key}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-600">{label}</span><span className="font-bold text-slate-800">{employee[key]}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${employee[key]}%` }} /></div></div>)}</div></section>
      </div>
      {employee.evaluation?.ratings && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="text-base font-bold text-slate-900">Evaluation breakdown</h2><p className="mt-1 text-sm text-slate-500">Evaluated by {employee.evaluation.evaluatedBy || 'manager'}{employee.evaluation.evaluatedAt ? ` · ${new Date(employee.evaluation.evaluatedAt).toLocaleDateString()}` : ''}</p></div><div className="grid gap-4 lg:grid-cols-2">{Object.entries(KPI_CRITERIA).map(([key, group]) => <div key={key} className="rounded-xl bg-slate-50 p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-slate-800">{group.label}</h3><span className="text-sm font-bold text-indigo-700">{calculateKpiFromRatings(employee.evaluation.ratings[key] || [])}%</span></div><ul className="mt-3 space-y-2">{group.criteria.map((criterion, index) => { const value = employee.evaluation.ratings[key]?.[index]; return <li key={criterion} className="flex flex-col justify-between gap-1 text-sm sm:flex-row sm:items-center"><span className="text-slate-600">{criterion}</span><span className="shrink-0 font-medium text-slate-700">{value ?? '–'}{value ? ` · ${KPI_RATING_LABELS[value]}` : ''}</span></li>})}</ul></div>)}</div>{employee.evaluation.comments && <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Manager comments</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{employee.evaluation.comments}</p></div>}</section>}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-base font-bold text-slate-900">Employee information</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><InfoItem icon={Mail} label="Email" value={employee.email} /><InfoItem icon={Phone} label="Phone" value={employee.phone} /><InfoItem icon={UserRound} label="Manager" value={employee.manager} /><InfoItem icon={CalendarDays} label="Joining date" value={employee.joiningDate} /><InfoItem icon={BriefcaseBusiness} label="Experience" value={`${employee.experience} years`} /><InfoItem icon={CalendarDays} label="Last review" value={employee.lastReviewDate} /></div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-base font-bold text-slate-900">Work stats</h2><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-2xl font-bold text-indigo-700">{employee.projectsCompleted}</p><p className="mt-1 text-xs text-slate-500">Projects completed</p></div><div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-2xl font-bold text-indigo-700">{employee.currentProjects}</p><p className="mt-1 text-xs text-slate-500">Current projects</p></div><div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-2xl font-bold text-indigo-700">{employee.jobSatisfaction}%</p><p className="mt-1 text-xs text-slate-500">Job satisfaction</p></div></div></section>
      </div>
      {formOpen && <EmployeeFormModal employee={employee} onClose={() => setFormOpen(false)} onSaved={handleSaved} />}
      {deleteOpen && <ConfirmDeleteDialog employee={employee} onCancel={() => setDeleteOpen(false)} onConfirm={handleDelete} />}
    </div>
  )
}