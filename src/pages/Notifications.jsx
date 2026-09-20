import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Clock3, Inbox } from 'lucide-react'
import { getNotifications, markNotificationRead } from '../services/storageService.js'

function relativeTime(dateValue) {
  const elapsed = Math.max(0, Date.now() - new Date(dateValue).getTime())
  const minutes = Math.floor(elapsed / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(dateValue).toLocaleDateString()
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(null)

  function refresh() {
    setNotifications([...getNotifications()].sort((first, second) => new Date(second.date) - new Date(first.date)))
  }

  useEffect(() => {
    queueMicrotask(refresh)
  }, [])

  function readNotification(notification) {
    if (!notification.read) {
      markNotificationRead(notification.id)
      refresh()
    }
  }

  if (!notifications) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading notifications...</div>

  return <div className="mx-auto max-w-3xl space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Activity center</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Notifications</h2><p className="mt-1 text-sm text-slate-500">Stay up to date with activity across your workspace.</p></div>{notifications.length ? <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700"><Bell size={18} /></span><h3 className="font-bold text-slate-900">Recent notifications</h3></div><span className="text-xs text-slate-400">{notifications.filter((notification) => !notification.read).length} unread</span></div><div className="divide-y divide-slate-100">{notifications.map((notification) => <button className={`flex w-full items-start gap-4 border-l-4 p-5 text-left transition hover:bg-slate-50 sm:px-6 ${notification.read ? 'border-transparent' : 'border-indigo-500 bg-indigo-50/40'}`} key={notification.id} type="button" onClick={() => readNotification(notification)}><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${notification.read ? 'bg-slate-300' : 'bg-indigo-600'}`} /><span className="min-w-0 flex-1"><span className={`block text-sm leading-6 ${notification.read ? 'font-medium text-slate-600' : 'font-bold text-slate-800'}`}>{notification.message}</span><span className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><Clock3 size={13} />{relativeTime(notification.date)}</span></span>{notification.read && <CheckCheck className="mt-1 shrink-0 text-emerald-600" size={17} />}</button>)}</div></section> : <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><Inbox className="mx-auto text-slate-300" size={42} /><h3 className="mt-4 font-bold text-slate-800">You are all caught up</h3><p className="mt-1 text-sm text-slate-500">There are no notifications to review.</p></section>}</div>
}