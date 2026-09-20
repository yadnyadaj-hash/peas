import { useEffect, useState } from 'react'
import { ArrowRight, BarChart3, LockKeyhole, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const quickLogins = [
  { label: 'Login as HR Admin', email: 'admin@peas.com', password: 'admin123' },
  { label: 'Login as Manager', email: 'manager@peas.com', password: 'manager123' },
  { label: 'Login as Employee', email: 'employee@peas.com', password: 'employee123' },
]

export default function Login() {
  const navigate = useNavigate()
  const { user, login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && !loading) navigate('/dashboard', { replace: true })
  }, [loading, navigate, user])

  if (user && !loading) return null

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const result = login(email.trim(), password)
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
  }

  function fillCredentials(credentials) {
    setEmail(credentials.email)
    setPassword(credentials.password)
    setError('')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden flex-col justify-between bg-indigo-700 p-10 text-white lg:flex">
          <div>
            <div className="flex items-center gap-3 text-xl font-bold tracking-tight">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><BarChart3 size={21} /></span>
              PEAS
            </div>
            <div className="mt-24 max-w-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">Performance intelligence</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Make every review more meaningful.</h1>
              <p className="mt-5 leading-7 text-indigo-100">Empowering performance through data-driven insights.</p>
            </div>
          </div>
          <p className="text-sm text-indigo-200">A clearer view of your people and progress.</p>
        </div>

        <div className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 text-xl font-bold tracking-tight text-indigo-700">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100"><BarChart3 size={21} /></span>
              PEAS
            </div>
            <p className="mt-3 text-sm text-slate-500">Empowering performance through data-driven insights.</p>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-500">Sign in to continue to your workspace.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Email address
              <span className="relative mt-2 block">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@company.com" />
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <span className="relative mt-2 block">
                <LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter your password" />
              </span>
            </label>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200" type="submit">
              Login <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick login</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {quickLogins.map((credentials) => (
                <button key={credentials.label} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700" type="button" onClick={() => fillCredentials(credentials)}>
                  {credentials.label.replace('Login as ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}