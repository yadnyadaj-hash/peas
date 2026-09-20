import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <div>
        <FileQuestion className="mx-auto text-indigo-600" size={48} />
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-indigo-600">404 error</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-500">The page you are looking for does not exist.</p>
        <Link className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700" to="/dashboard"><ArrowLeft size={18} /> Back to dashboard</Link>
      </div>
    </main>
  )
}