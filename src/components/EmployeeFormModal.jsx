import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { DEPARTMENTS } from '../data/employees.js'
import { addEmployee, getEmployees, updateEmployee } from '../services/storageService.js'
import { calculateOverallPerformance } from '../utils/performanceUtils.js'

const emptyForm = {
  name: '', email: '', phone: '', department: '', designation: '', manager: '', joiningDate: '', status: 'Active',
  productivity: '', quality: '', teamwork: '', communication: '', attendance: '',
}

const kpis = ['productivity', 'quality', 'teamwork', 'communication', 'attendance']

function getInitialValues(employee) {
  if (!employee) return emptyForm
  return Object.fromEntries(Object.keys(emptyForm).map((key) => [key, employee[key] ?? emptyForm[key]]))
}

function fieldClasses(hasError) {
  return `mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${hasError ? 'border-red-400' : 'border-slate-300'}`
}

export default function EmployeeFormModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState(() => getInitialValues(employee))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validate() {
    const nextErrors = {}
    const requiredFields = ['name', 'email', 'phone', 'department', 'designation', 'manager', 'joiningDate']
    requiredFields.forEach((field) => {
      if (!String(form[field]).trim()) nextErrors[field] = 'Required'
    })
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email'
    kpis.forEach((field) => {
      const value = Number(form[field])
      if (form[field] === '' || !Number.isFinite(value) || value < 0 || value > 100) nextErrors[field] = 'Use a value from 0 to 100'
    })
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setSaving(true)
    const fields = {
      ...form,
      ...Object.fromEntries(kpis.map((field) => [field, Number(form[field])])),
    }
    fields.performance = calculateOverallPerformance(fields)

    if (employee) {
      updateEmployee(employee.id, fields)
    } else {
      const existingEmployees = getEmployees()
      const nextId = existingEmployees.length ? Math.max(...existingEmployees.map((item) => item.id)) + 1 : 1
      addEmployee({ ...fields, employeeId: `EMP${String(nextId).padStart(3, '0')}`, projectsCompleted: 0, currentProjects: 0, jobSatisfaction: 0, experience: 0, lastReviewDate: '' })
    }
    onSaved(employee ? 'Employee updated successfully.' : 'Employee added successfully.')
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div><h2 id="employee-form-title" className="text-lg font-bold text-slate-900">{employee ? 'Edit employee' : 'Add employee'}</h2><p className="mt-1 text-sm text-slate-500">Keep employee information and performance data up to date.</p></div>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close employee form" onClick={onClose}><X size={20} /></button>
        </div>
        <form className="space-y-6 p-5 sm:p-6" onSubmit={handleSubmit}>
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Employee information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['phone', 'Phone number', 'tel'],
                ['designation', 'Designation', 'text'], ['manager', 'Manager', 'text'], ['joiningDate', 'Joining date', 'date'],
              ].map(([name, label, type]) => <label key={name} className="block text-sm font-medium text-slate-700">{label}<input className={fieldClasses(errors[name])} name={name} type={type} value={form[name]} onChange={handleChange} />{errors[name] && <span className="mt-1 block text-xs text-red-600">{errors[name]}</span>}</label>)}
              <label className="block text-sm font-medium text-slate-700">Department<select className={fieldClasses(errors.department)} name="department" value={form.department} onChange={handleChange}><option value="">Select department</option>{DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}</select>{errors.department && <span className="mt-1 block text-xs text-red-600">{errors.department}</span>}</label>
              <label className="block text-sm font-medium text-slate-700">Status<select className={fieldClasses()} name="status" value={form.status} onChange={handleChange}><option value="Active">Active</option><option value="On Leave">On Leave</option></select></label>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Performance KPIs</h3>
            <div className="grid gap-4 sm:grid-cols-5">{kpis.map((field) => <label key={field} className="block text-sm font-medium capitalize text-slate-700">{field}<input className={fieldClasses(errors[field])} name={field} type="number" min="0" max="100" value={form[field]} onChange={handleChange} />{errors[field] && <span className="mt-1 block text-xs text-red-600">{errors[field]}</span>}</label>)}</div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onClose}>Cancel</button><button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}><Save size={17} />{saving ? 'Saving...' : employee ? 'Save changes' : 'Add employee'}</button></div>
        </form>
      </div>
    </div>
  )
}

export function ConfirmDeleteDialog({ employee, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="delete-title" className="text-lg font-bold text-slate-900">Delete employee?</h2><p className="mt-2 text-sm leading-6 text-slate-500">This will permanently remove <strong className="text-slate-800">{employee.name}</strong> from the employee records.</p><div className="mt-6 flex justify-end gap-3"><button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onCancel}>Cancel</button><button className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700" type="button" onClick={onConfirm}>Delete employee</button></div></div>
    </div>
  )
}