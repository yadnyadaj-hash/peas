import { useEffect, useMemo, useState } from 'react'
import { Eye, Filter, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DEPARTMENTS } from '../data/employees.js'
import { useAuth } from '../context/AuthContext.jsx'
import { deleteEmployee, getEmployees } from '../services/storageService.js'
import { calculateOverallPerformance, getPerformanceRating, getRatingColor } from '../utils/performanceUtils.js'
import EmployeeFormModal, { ConfirmDeleteDialog } from '../components/EmployeeFormModal.jsx'

const ratings = ['Excellent', 'Very Good', 'Good', 'Needs Improvement', 'Poor']

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function EmployeeIdentity({ employee }) {
  return <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{initials(employee.name)}</span><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{employee.name}</p><p className="text-xs text-slate-500">{employee.employeeId}</p></div></div>
}

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status === 'Active' ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-amber-200 bg-amber-100 text-amber-700'}`}>{status}</span>
}

function FilterSelect({ label, value, onChange, children }) {
  return <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}<select className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={value} onChange={onChange}>{children}</select></label>
}

export default function Employees() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState(null)
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All')
  const [status, setStatus] = useState('All')
  const [rating, setRating] = useState('All')
  const [formEmployee, setFormEmployee] = useState(undefined)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState('')

  function refresh() {
    setEmployees(getEmployees())
  }

  useEffect(() => {
    queueMicrotask(refresh)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(timeout)
  }, [toast])

  const visibleEmployees = useMemo(() => {
    if (!employees) return []
    const scopedEmployees = user?.role === 'manager' ? employees.filter((employee) => employee.department === user.managedDepartment) : employees
    const normalizedQuery = query.toLowerCase().trim()
    return scopedEmployees.filter((employee) => {
      const matchesQuery = !normalizedQuery || employee.name.toLowerCase().includes(normalizedQuery) || employee.employeeId.toLowerCase().includes(normalizedQuery)
      const matchesDepartment = department === 'All' || employee.department === department
      const matchesStatus = status === 'All' || employee.status === status
      const matchesRating = rating === 'All' || getPerformanceRating(calculateOverallPerformance(employee)) === rating
      return matchesQuery && matchesDepartment && matchesStatus && matchesRating
    })
  }, [department, employees, query, rating, status, user])

  function handleSaved(message) {
    setFormEmployee(undefined)
    refresh()
    setToast(message)
  }

  function handleDelete() {
    deleteEmployee(deleteTarget.id)
    setDeleteTarget(null)
    refresh()
    setToast('Employee deleted successfully.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">People directory</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Employees</h2><p className="mt-1 text-sm text-slate-500">Manage employee records and performance information.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700" type="button" onClick={() => setFormEmployee(null)}><Plus size={18} /> Add Employee</button></div>
      {toast && <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">{toast}<button type="button" aria-label="Dismiss message" onClick={() => setToast('')}><X size={17} /></button></div>}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(3,1fr)]"><label className="relative block text-sm font-medium text-slate-700"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Search by name or employee ID" value={query} onChange={(event) => setQuery(event.target.value)} /></label><FilterSelect label="Department" value={department} onChange={(event) => setDepartment(event.target.value)}><option value="All">All departments</option>{DEPARTMENTS.map((item) => <option key={item} value={item}>{item}</option>)}</FilterSelect><FilterSelect label="Status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="All">All statuses</option><option value="Active">Active</option><option value="On Leave">On Leave</option></FilterSelect><FilterSelect label="Rating" value={rating} onChange={(event) => setRating(event.target.value)}><option value="All">All ratings</option>{ratings.map((item) => <option key={item} value={item}>{item}</option>)}</FilterSelect></div></section>
      <div className="flex items-center justify-between text-sm text-slate-500"><span className="inline-flex items-center gap-2"><Users size={17} /> Showing {visibleEmployees.length} of {employees?.length ?? 0} employees</span><span className="hidden items-center gap-1 sm:inline-flex"><Filter size={15} /> Filters update as you type</span></div>
      {!employees ? <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">Loading employees...</div> : visibleEmployees.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Users className="mx-auto text-slate-300" size={40} /><h3 className="mt-4 font-bold text-slate-800">No employees found</h3><p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p></div> : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4 font-semibold">Employee</th><th className="px-5 py-4 font-semibold">Department</th><th className="px-5 py-4 font-semibold">Designation</th><th className="px-5 py-4 font-semibold">Performance</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleEmployees.map((employee) => { const score = calculateOverallPerformance(employee); const employeeRating = getPerformanceRating(score); return <tr key={employee.id} className="hover:bg-slate-50"><td className="px-5 py-4"><EmployeeIdentity employee={employee} /></td><td className="px-5 py-4 text-slate-600">{employee.department}</td><td className="px-5 py-4 text-slate-600">{employee.designation}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><strong className="text-slate-800">{score.toFixed(1)}%</strong><span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${getRatingColor(employeeRating)}`}>{employeeRating}</span></div></td><td className="px-5 py-4"><StatusBadge status={employee.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Link className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title="View employee" aria-label={`View ${employee.name}`} to={`/employees/${employee.id}`}><Eye size={17} /></Link><button className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title="Edit employee" aria-label={`Edit ${employee.name}`} type="button" onClick={() => setFormEmployee(employee)}><Pencil size={17} /></button><button className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Delete employee" aria-label={`Delete ${employee.name}`} type="button" onClick={() => setDeleteTarget(employee)}><Trash2 size={17} /></button></div></td></tr> })}</tbody></table></div><div className="divide-y divide-slate-100 md:hidden">{visibleEmployees.map((employee) => { const score = calculateOverallPerformance(employee); const employeeRating = getPerformanceRating(score); return <div key={employee.id} className="space-y-4 p-4"><div className="flex items-start justify-between gap-3"><EmployeeIdentity employee={employee} /><StatusBadge status={employee.status} /></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-400">Department</p><p className="mt-1 font-medium text-slate-700">{employee.department}</p></div><div><p className="text-xs text-slate-400">Performance</p><p className="mt-1 font-semibold text-slate-800">{score.toFixed(1)}% <span className={`ml-1 rounded-full border px-1.5 py-0.5 text-[10px] ${getRatingColor(employeeRating)}`}>{employeeRating}</span></p></div></div><div className="flex justify-end gap-1 border-t border-slate-100 pt-3"><Link className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" aria-label={`View ${employee.name}`} to={`/employees/${employee.id}`}><Eye size={17} /></Link><button className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" aria-label={`Edit ${employee.name}`} type="button" onClick={() => setFormEmployee(employee)}><Pencil size={17} /></button><button className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${employee.name}`} type="button" onClick={() => setDeleteTarget(employee)}><Trash2 size={17} /></button></div></div>})}</div></section>}
      {formEmployee !== undefined && <EmployeeFormModal employee={formEmployee} onClose={() => setFormEmployee(undefined)} onSaved={handleSaved} />}
      {deleteTarget && <ConfirmDeleteDialog employee={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </div>
  )
}