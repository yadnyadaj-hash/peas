import { useEffect, useState } from 'react'
import { Activity, BarChart3, Lightbulb, Medal, TrendingDown, TrendingUp, Users } from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import { DEPARTMENTS } from '../data/employees.js'
import { getEmployees } from '../services/storageService.js'
import {
  calculateAverageAttendance, calculateAveragePerformance, getDepartmentPerformanceData,
  getHighestLowestDepartments, getKPIAverages, getPerformanceDistribution, getPerformanceRating,
  getRatingColor, getTopPerformers, generatePerformanceInsights,
} from '../utils/performanceUtils.js'

const ratingColors = { Excellent: '#10b981', 'Very Good': '#3b82f6', Good: '#4f46e5', 'Needs Improvement': '#f59e0b', Poor: '#ef4444' }
const kpiLabels = { productivity: 'Productivity', quality: 'Quality', teamwork: 'Teamwork', communication: 'Communication', attendance: 'Attendance' }

function score(value) { return `${Number(value || 0).toFixed(1)}%` }

function Panel({ title, subtitle, children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}><div className="mb-5"><h2 className="text-base font-bold text-slate-900">{title}</h2>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>{children}</section>
}

function StatCard({ label, value, detail, icon: Icon, color }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 truncate text-xl font-bold text-slate-900">{value}</p>{detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}</div><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon size={20} /></span></div></div>
}

function RatingBadge({ value }) {
  const rating = getPerformanceRating(value)
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRatingColor(rating)}`}>{rating}</span>
}

function ChartEmpty({ message = 'No data available' }) {
  return <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">{message}</div>
}

function AnalyticsCharts({ employees, departments, isManager }) {
  const departmentData = getDepartmentPerformanceData(employees, departments)
  const kpiAverages = getKPIAverages(employees)
  const kpiData = Object.entries(kpiLabels).map(([key, subject]) => ({ subject, score: kpiAverages[key], fullMark: 100 }))
  const distribution = getPerformanceDistribution(employees)
  const distributionData = Object.entries(distribution).map(([name, value]) => ({ name, value }))
  const attendanceData = isManager
    ? employees.map((employee) => ({ name: employee.name.split(' ')[0], attendance: employee.attendance }))
    : departmentData.map((item) => ({ name: item.department, attendance: calculateAverageAttendance(employees.filter((employee) => employee.department === item.department)) }))

  return <div className="grid gap-6 xl:grid-cols-2"><Panel title="Average Performance by Department" subtitle={isManager ? 'Your department performance overview' : 'Average overall score across departments'}>{departmentData.length ? <ResponsiveContainer width="100%" height={300}><BarChart data={departmentData} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="department" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value}%`, 'Average']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} /><Bar dataKey="average" fill="#4f46e5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <ChartEmpty />}</Panel><Panel title="KPI Comparison" subtitle="Average scores across the visible employee set"><ResponsiveContainer width="100%" height={300}><RadarChart data={kpiData} outerRadius="72%"><PolarGrid stroke="#cbd5e1" /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} /><PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} /><Radar name="Average" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} /><Tooltip formatter={(value) => [`${value}%`, 'Average']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} /></RadarChart></ResponsiveContainer></Panel><Panel title="Performance Rating Distribution" subtitle="Employees grouped by performance rating"><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={72} outerRadius={105} paddingAngle={3}>{distributionData.map((entry) => <Cell key={entry.name} fill={ratingColors[entry.name]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></Panel><Panel title="Attendance Overview" subtitle={isManager ? 'Attendance by team member' : 'Average attendance by department'}><ResponsiveContainer width="100%" height={300}><LineChart data={attendanceData} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value}%`, 'Attendance']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} /><Line type="monotone" dataKey="attendance" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} /></LineChart></ResponsiveContainer></Panel></div>
}

export default function Analytics() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState(null)

  useEffect(() => {
    queueMicrotask(() => setEmployees(getEmployees()))
  }, [])

  if (!employees) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500"><Activity className="mr-2 animate-pulse" size={18} /> Loading analytics data...</div>

  const isManager = user?.role === 'manager'
  const visibleEmployees = isManager ? employees.filter((employee) => employee.department === user.managedDepartment) : employees
  const visibleDepartments = isManager ? [user.managedDepartment] : DEPARTMENTS
  const { highest, lowest } = getHighestLowestDepartments(visibleEmployees, visibleDepartments)
  const topPerformer = getTopPerformers(visibleEmployees, 1)[0]
  const insights = generatePerformanceInsights(visibleEmployees, visibleDepartments).slice(0, 5)

  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Data intelligence</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Analytics</h2><p className="mt-1 text-sm text-slate-500">{isManager ? `Insights for the ${user.managedDepartment} department.` : 'Company-wide performance and workforce insights.'}</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Highest department" value={highest?.department || 'N/A'} detail={highest ? score(highest.average) : undefined} icon={TrendingUp} color="bg-emerald-100 text-emerald-700" /><StatCard label="Lowest department" value={lowest?.department || 'N/A'} detail={lowest ? score(lowest.average) : undefined} icon={TrendingDown} color="bg-amber-100 text-amber-700" /><StatCard label={isManager ? 'Team average' : 'Company average'} value={score(calculateAveragePerformance(visibleEmployees))} detail={`${visibleEmployees.length} employees`} icon={BarChart3} color="bg-indigo-100 text-indigo-700" /><StatCard label="Top performer" value={topPerformer?.name || 'N/A'} detail={topPerformer ? score(topPerformer.overallScore) : undefined} icon={Medal} color="bg-blue-100 text-blue-700" /></div><AnalyticsCharts employees={visibleEmployees} departments={visibleDepartments} isManager={isManager} /><div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><Panel title="Top 5 Performers" subtitle="Ranked by overall performance score"><div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><tr><th className="pb-3 font-semibold">Rank</th><th className="pb-3 font-semibold">Employee</th><th className="pb-3 font-semibold">Department</th><th className="pb-3 text-right font-semibold">Score</th></tr></thead><tbody className="divide-y divide-slate-100">{getTopPerformers(visibleEmployees, 5).map((employee, index) => <tr key={employee.employeeId}><td className="py-3 font-bold text-indigo-600">#{index + 1}</td><td className="py-3 font-semibold text-slate-800">{employee.name}</td><td className="py-3 text-slate-500">{employee.department}</td><td className="py-3 text-right"><span className="mr-2 font-bold text-slate-800">{score(employee.overallScore)}</span><RatingBadge value={employee.overallScore} /></td></tr>)}</tbody></table></div></Panel><Panel title="Performance Insights" subtitle="Signals generated from the current data"><ul className="space-y-4">{insights.map((insight) => <li key={insight} className="flex gap-3 text-sm leading-6 text-slate-600"><Lightbulb className="mt-1 shrink-0 text-amber-500" size={18} />{insight}</li>)}</ul></Panel></div><div className="flex items-center gap-2 text-xs text-slate-400"><Users size={15} /> Analytics reflect {visibleEmployees.length} visible employees.</div></div>
}