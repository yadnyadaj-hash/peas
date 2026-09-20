import { useEffect, useState } from 'react'
import { Bell, Check, LayoutPanelLeft, Moon } from 'lucide-react'
import { getSettings, saveSettings } from '../services/storageService.js'

const settingItems = [
  { key: 'darkMode', label: 'Dark Mode', description: 'Save your preference for a future app-wide theme.', icon: Moon },
  { key: 'notifications', label: 'Notifications', description: 'Receive updates about performance and project activity.', icon: Bell },
  { key: 'compactSidebar', label: 'Compact Sidebar', description: 'Save a preference for a condensed navigation view.', icon: LayoutPanelLeft },
]

function Toggle({ checked, onChange, label }) {
  return <button className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} /></button>
}

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setSettings(getSettings()))
  }, [])

  useEffect(() => {
    if (!saved) return undefined
    const timeout = setTimeout(() => setSaved(false), 2500)
    return () => clearTimeout(timeout)
  }, [saved])

  if (!settings) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading settings...</div>

  function toggle(key) {
    const updated = { ...settings, [key]: !settings[key] }
    setSettings(updated)
    saveSettings(updated)
    setSaved(true)
  }

  return <div className="mx-auto max-w-3xl space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Workspace preferences</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Settings</h2><p className="mt-1 text-sm text-slate-500">Manage your PEAS preferences.</p></div>{saved && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status"><Check size={17} /> Settings saved</div>}<section className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">{settingItems.map(({ key, label, description, icon: Icon }) => <div className="flex items-center justify-between gap-5 p-5 sm:p-6" key={key}><div className="flex min-w-0 items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><Icon size={19} /></span><div><h3 className="font-semibold text-slate-800">{label}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p></div></div><Toggle checked={Boolean(settings[key])} onChange={() => toggle(key)} label={label} /></div>)}</section><p className="text-xs leading-5 text-slate-400">Preferences are saved immediately. Full dark theme and compact navigation application can be added in a future enhancement.</p></div>
}