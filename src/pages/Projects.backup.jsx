import { useEffect, useState } from 'react'
import { BriefcaseBusiness, CalendarDays, Check, CheckCircle2, Clock3, Pencil, Plus, Trash2, Users, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { DEPARTMENTS } from '../data/employees.js'
import { addNotification, addProject, deleteProject, getEmployees, getProjects, updateProject } from '../services/storageService.js'

const statuses = ['Active', 'Completed', 'Delayed', 'On Hold']
const statusClasses = { Active: 'border-blue-200 bg-blue-100 text-blue-700', Completed: 'border-emerald-200 bg-emerald-100 text-emerald-700', Delayed: 'border-red-200 bg-red-100 text-red-700', 'On Hold': 'border-amber-200 bg-amber-100 text-amber-700' }
const inputClasses = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'

function ProjectFormModal({ employees, existingProjects, project, user, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    name: project?.name || '',
    department: project?.department || (user?.role === 'manager' ? user.managedDepartment : ''),
    manager: project?.manager || '',
    teamMembers: project?.teamMembers || [],
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    progress: project?.progress ?? 0,
    status: project?.status || 'Active',
  }))
  const [error, setError] = useState('')
  const scopedEmployees = user?.role === 'manager' ? employees.filter((employee) => employee.department === user.managedDepartment) : employees

  function change(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function toggleMember(name) {
    setForm((current) => ({ ...current, teamMembers: current.teamMembers.includes(name) ? current.teamMembers.filter((member) => member !== name) : [...current.teamMembers, name] }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.department || !form.manager.trim() || !form.startDate || !form.endDate) {
      setError('Complete all required fields.')
      return
    }
    if (form.endDate < form.startDate) {
      setError('End date cannot be before the start date.')
      return
    }
    const progress = Number(form.progress)
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      setError('Progress must be between 0 and 100.')
      return
    }

    const fields = { ...form, name: form.name.trim(), manager: form.manager.trim(), progress }
    if (project) {
      updateProject(project.id, fields)
      addNotification(`Project ${fields.name} updated`)
      onSaved(`Project ${fields.name} updated.`)
      return
    }

    const nextProjectNumber = Math.max(0, ...existingProjects.map((item) => Number(String(item.projectId || '').replace(/^PRJ/i, '')) || 0)) + 1
    const created = addProject({ ...fields, projectId: `PRJ${String(nextProjectNumber).padStart(3, '0')}` })
    addNotification(`Project ${created.name} added`)
    onSaved(`Project ${created.name} added.`)
  }

  return <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-3 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="project-form-title"><div className="my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 id="project-form-title" className="text-lg font-bold text-slate-900">{project ? 'Edit project' : 'Add project'}</h2><p className="mt-1 text-sm text-slate-500">{project ? 'Update project details and team.' : 'Create a project and select its team members.'}</p></div><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close project form" onClick={onClose}><X size={20} /></button></div><form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={submit}><label className="text-sm font-medium text-slate-700 sm:col-span-2">Project name<input className={inputClasses} name="name" value={form.name} onChange={change} required /></label><label className="text-sm font-medium text-slate-700">Department<select className={inputClasses} name="department" value={form.department} onChange={change} disabled={user?.role === 'manager'} required><option value="">Select department</option>{DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Manager<input className={inputClasses} name="manager" value={form.manager} onChange={change} required /></label><label className="text-sm font-medium text-slate-700">Start date<input className={inputClasses} name="startDate" type="date" value={form.startDate} onChange={change} required /></label><label className="text-sm font-medium text-slate-700">End date<input className={inputClasses} name="endDate" type="date" value={form.endDate} onChange={change} required /></label><label className="text-sm font-medium text-slate-700">Progress (%)<input className={inputClasses} name="progress" type="number" min="0" max="100" value={form.progress} onChange={change} required /></label><label className="text-sm font-medium text-slate-700">Status<select className={inputClasses} name="status" value={form.status} onChange={change}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><fieldset className="sm:col-span-2"><legend className="text-sm font-semibold text-slate-700">Team members</legend><p className="mb-2 mt-1 text-xs text-slate-500">Select employees to add to this project.</p><div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">{scopedEmployees.map((employee) => { const checked = form.teamMembers.includes(employee.name); return <label key={employee.employeeId} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"><input className="h-4 w-4 accent-indigo-600" type="checkbox" checked={checked} onChange={() => toggleMember(employee.name)} /><span className="min-w-0 flex-1 truncate font-medium text-slate-700">{employee.name}</span><span className="text-xs text-slate-400">{employee.department}</span></label> })}</div><p className="mt-2 text-xs text-slate-500">{form.teamMembers.length} selected</p></fieldset>{error && <p className="text-sm font-medium text-red-600 sm:col-span-2" role="alert">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-4 sm:col-span-2"><button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onClose}>Cancel</button><button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700" type="submit"><Check size={17} />{project ? 'Save changes' : 'Add project'}</button></div></form></div></div>
}

function ProjectDetailsModal({ project, employees, user, onClose, onChanged, onEdit, onDelete }) {
  const [newMember, setNewMember] = useState('')
  const [removeMember, setRemoveMember] = useState('')
  const canManage = user?.role === 'admin' || user?.role === 'manager'
  const availableEmployees = employees.filter((employee) => !project.teamMembers.includes(employee.name) && (user?.role !== 'manager' || employee.department === user.managedDepartment))

  function addMember() {
    const employee = availableEmployees.find((item) => item.employeeId === newMember)
    if (!employee) return
    const updated = updateProject(project.id, { teamMembers: [...project.teamMembers, employee.name] })
    addNotification(`Project ${project.name} updated`)
    setNewMember('')
    onChanged(updated, `Added ${employee.name} to ${project.name}.`)
  }

  function confirmRemoveMember() {
    const updated = updateProject(project.id, { teamMembers: project.teamMembers.filter((name) => name !== removeMember) })
    addNotification(`Project ${project.name} updated`)
    onChanged(updated, `Removed ${removeMember} from ${project.name}.`)
    setRemoveMember('')
  }

  return <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-3 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="project-details-title"><div className="my-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{project.projectId || 'Project details'}</p><h2 id="project-details-title" className="mt-1 text-xl font-bold text-slate-900">{project.name}</h2><p className="mt-1 text-sm text-slate-500">{project.department} · Managed by {project.manager}</p></div><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close project details" onClick={onClose}><X size={20} /></button></div><div className="space-y-6 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><span className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${statusClasses[project.status] || 'border-slate-200 bg-slate-100 text-slate-600'}`}>{project.status}</span>{canManage && <div className="flex gap-2"><button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onEdit}><Pencil size={16} /> Edit Project</button><button className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50" type="button" onClick={onDelete}><Trash2 size={16} /> Delete</button></div>}</div><div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project ID</p><p className="mt-1 font-semibold text-slate-800">{project.projectId || `#${project.id}`}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start date</p><p className="mt-1 text-sm font-medium text-slate-700">{project.startDate}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">End date</p><p className="mt-1 text-sm font-medium text-slate-700">{project.endDate}</p></div></div><section><div className="mb-2 flex justify-between text-sm font-semibold text-slate-600"><h3>Progress</h3><span>{project.progress}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${project.progress}%` }} /></div></section><section><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold text-slate-900">Team members</h3><p className="mt-1 text-sm text-slate-500">{project.teamMembers.length} assigned</p></div></div><div className="space-y-2">{project.teamMembers.length ? project.teamMembers.map((name) => { const employee = employees.find((item) => item.name === name); return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3" key={name}><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{name}</p><p className="text-xs text-slate-500">{employee ? `${employee.department} · ${employee.designation}` : 'Employee record unavailable'}</p></div></div>{canManage && <div className="flex items-center gap-2">{removeMember === name ? <><span className="text-xs text-slate-500">Remove?</span><button className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white" type="button" onClick={confirmRemoveMember}>Confirm</button><button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600" type="button" onClick={() => setRemoveMember('')}>Cancel</button></> : <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" type="button" aria-label={`Remove ${name}`} onClick={() => setRemoveMember(name)}><X size={17} /></button>}</div>}</div> }) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No team members assigned.</p>}</div>{canManage && availableEmployees.length > 0 && <div className="mt-4 flex flex-col gap-2 sm:flex-row"><select className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700" aria-label="Add team member" value={newMember} onChange={(event) => setNewMember(event.target.value)}><option value="">Select employee to add</option>{availableEmployees.map((employee) => <option key={employee.employeeId} value={employee.employeeId}>{employee.name} · {employee.department}</option>)}</select><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={!newMember} onClick={addMember}><Plus size={17} /> Add Member</button></div>}</section></div></div></div>
}

function DeleteProjectDialog({ project, onCancel, onConfirm }) {
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-project-title"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="delete-project-title" className="text-lg font-bold text-slate-900">Delete project?</h2><p className="mt-2 text-sm leading-6 text-slate-500">This will permanently remove <strong className="text-slate-800">{project.name}</strong>.</p><div className="mt-6 flex justify-end gap-3"><button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onCancel}>Cancel</button><button className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700" type="button" onClick={onConfirm}>Delete project</button></div></div></div>
}

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState(null)
  const [employees, setEmployees] = useState([])
  const [status, setStatus] = useState('All')
  const [department, setDepartment] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { queueMicrotask(() => { setProjects(getProjects()); setEmployees(getEmployees()) }) }, [])
  useEffect(() => { if (!toast) return undefined; const timeout = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timeout) }, [toast])

  if (!projects) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500"><Clock3 className="mr-2 animate-pulse" size={18} /> Loading projects...</div>

  const visibleProjects = projects.filter((project) => (user?.role === 'manager' ? project.department === user.managedDepartment : user?.role === 'employee' ? project.teamMembers.includes(user.name) : true)).filter((project) => status === 'All' || project.status === status).filter((project) => user?.role !== 'admin' || department === 'All' || project.department === department)

  function refresh(message) {
    const latest = getProjects()
    setProjects(latest)
    if (selectedProject) setSelectedProject(latest.find((project) => project.id === selectedProject.id) || null)
    if (message) setToast(message)
  }

  function handleFormSaved(message) {
    setModalOpen(false)
    setEditingProject(null)
    refresh(message)
  }

  function confirmDelete() {
    const projectName = selectedProject.name
    deleteProject(selectedProject.id)
    addNotification(`Project ${projectName} deleted`)
    setDeleteOpen(false)
    setSelectedProject(null)
    setProjects(getProjects())
    setToast(`Project ${projectName} deleted.`)
  }

  function updateSelectedProject(updated, message) {
    setProjects(getProjects())
    setSelectedProject(updated)
    setToast(message)
  }

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Delivery portfolio</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Projects</h2><p className="mt-1 text-sm text-slate-500">Track project ownership, progress, and status.</p></div>{user?.role === 'admin' && <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700" type="button" onClick={() => setModalOpen(true)}><Plus size={18} /> Add Project</button>}</div>{toast && <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">{toast}<button type="button" aria-label="Dismiss message" onClick={() => setToast('')}><X size={17} /></button></div>}<div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status<select className="mt-1.5 block rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-700" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>{user?.role === 'admin' && <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Department<select className="mt-1.5 block rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-700" value={department} onChange={(event) => setDepartment(event.target.value)}><option>All</option>{DEPARTMENTS.map((item) => <option key={item}>{item}</option>)}</select></label>}</div>{visibleProjects.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleProjects.map((project) => <button key={project.projectId || project.id} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-100" type="button" aria-label={`Open project ${project.name}`} onClick={() => setSelectedProject(project)}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-bold text-slate-900">{project.name}</h3><span className="mt-2 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{project.department}</span></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[project.status] || 'border-slate-200 bg-slate-100 text-slate-600'}`}>{project.status}</span></div><div className="mt-5 space-y-3 text-sm text-slate-600"><p className="flex items-center gap-2"><Users className="shrink-0 text-slate-400" size={16} /><span className="truncate">{project.teamMembers.join(', ') || 'No team members'}</span></p><p className="flex items-center gap-2"><BriefcaseBusiness className="shrink-0 text-slate-400" size={16} />{project.manager}</p><div className="grid grid-cols-2 gap-2 text-xs"><p className="flex items-center gap-1.5"><CalendarDays size={14} />{project.startDate}</p><p className="flex items-center gap-1.5"><CalendarDays size={14} />{project.endDate}</p></div></div><div className="mt-5"><div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-500"><span>Progress</span><span>{project.progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${project.progress}%` }} /></div></div></button>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><CheckCircle2 className="mx-auto text-slate-300" size={38} /><p className="mt-3 text-sm text-slate-500">No data available.</p></div>}{modalOpen && <ProjectFormModal employees={employees} existingProjects={projects} user={user} onClose={() => setModalOpen(false)} onSaved={handleFormSaved} />}{editingProject && <ProjectFormModal employees={employees} existingProjects={projects} project={editingProject} user={user} onClose={() => setEditingProject(null)} onSaved={handleFormSaved} />}{selectedProject && <ProjectDetailsModal project={selectedProject} employees={employees} user={user} onClose={() => { setSelectedProject(null); setDeleteOpen(false) }} onChanged={updateSelectedProject} onEdit={() => setEditingProject(selectedProject)} onDelete={() => setDeleteOpen(true)} />}{deleteOpen && selectedProject && <DeleteProjectDialog project={selectedProject} onCancel={() => setDeleteOpen(false)} onConfirm={confirmDelete} />}</div>
}