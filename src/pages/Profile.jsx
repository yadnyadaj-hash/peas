import { Building2, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function roleLabel(role) {
  return role === 'admin' ? 'HR Admin' : role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : 'User'
}

function InfoItem({ icon: Icon, label, value }) {
  return <div className="flex items-start gap-3"><Icon className="mt-0.5 shrink-0 text-indigo-600" size={18} /><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-medium text-slate-700">{value || 'Not provided'}</p></div></div>
}

export default function Profile() {
  const { user } = useAuth()
  const role = roleLabel(user?.role)

  return <div className="mx-auto max-w-4xl space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Your account</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Profile</h2><p className="mt-1 text-sm text-slate-500">View your PEAS account information.</p></div><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col items-center gap-5 border-b border-slate-100 pb-7 sm:flex-row"><span className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-700">{initials(user?.name)}</span><div className="text-center sm:text-left"><h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1><p className="mt-1 text-slate-500">{role}</p><span className="mt-3 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{user?.department || 'No department'}</span></div></div><div className="grid gap-6 pt-7 sm:grid-cols-2"><InfoItem icon={Mail} label="Email" value={user?.email} /><InfoItem icon={Phone} label="Phone" value={user?.phone} /><InfoItem icon={ShieldCheck} label="Role" value={role} /><InfoItem icon={Building2} label="Department" value={user?.department} /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><UserRound size={19} /></span><div><h2 className="font-bold text-slate-900">Account Information</h2><p className="mt-1 text-sm text-slate-500">Your access context in PEAS.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account role</p><p className="mt-1 font-semibold text-slate-800">{role}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Department</p><p className="mt-1 font-semibold text-slate-800">{user?.department || 'Not assigned'}</p></div></div></section></div>
}