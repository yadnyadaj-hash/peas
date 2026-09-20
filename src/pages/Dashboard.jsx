import { useEffect, useState } from 'react'
import {
  Activity, Award, BriefcaseBusiness, CheckCircle2,
  Clock3, Gauge, Users, UserRound,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, PolarAngleAxis,
  PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import { DEPARTMENTS, employees as demoEmployees } from '../data/employees.js'
import { projects as demoProjects } from '../data/projects.js'
import { getEmployees, getProjects } from '../services/storageService.js'
import {
  calculateAverageAttendance, calculateAveragePerformance, calculateOverallPerformance,
  generatePerformanceInsights, getDepartmentPerformanceData, getPerformanceDistribution,
  getPerformanceRating, getRatingColor, getTopPerformers,
} from '../utils/performanceUtils.js'

const distributionColors = {
  Excellent: '#10b981',
  'Very Good': '#3b82f6',
  Good: '#4f46e5',
  'Needs Improvement': '#f59e0b',
  Poor: '#ef4444',
}

const kpiLabels = {
  productivity: 'Productivity',
  quality: 'Quality',
  teamwork: 'Teamwork',
  communication: 'Communication',
  attendance: 'Attendance',
}

function formatScore(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}><Icon size={21} /></span>
      </div>
    </div>
  )
}

function RatingBadge({ score }) {
  const rating = getPerformanceRating(score)
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRatingColor(rating)}`}>{rating}</span>
}

function ChartEmpty({ message = 'No data available' }) {
  return <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">{message}</div>
}

function AdminDashboard({ employees, projects }) {
  const departmentData = getDepartmentPerformanceData(employees, DEPARTMENTS)
  const distribution = getPerformanceDistribution(employees)
  const distributionData = Object.entries(distribution).map(([name, value]) => ({ name, value }))
  const topPerformers = getTopPerformers(employees, 5)
  const insights = generatePerformanceInsights(employees, DEPARTMENTS).slice(0, 4)
  const activeProjects = projects.filter((project) => project.status === 'Active').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={employees.length} icon={Users} accent="bg-indigo-100 text-indigo-700" />
        <StatCard label="Average Performance" value={formatScore(calculateAveragePerformance(employees))} icon={Gauge} accent="bg-blue-100 text-blue-700" />
        <StatCard label="Average Attendance" value={formatScore(calculateAverageAttendance(employees))} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-700" />
        <StatCard label="Active Projects" value={activeProjects} icon={BriefcaseBusiness} accent="bg-amber-100 text-amber-700" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Panel title="Department performance" subtitle="Average overall score by department">
          {departmentData.length ? <ResponsiveContainer width="100%" height={290}>
            <BarChart data={departmentData} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value}%`, 'Average']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="average" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> : <ChartEmpty />}
        </Panel>

        <Panel title="Performance distribution" subtitle="Employees grouped by rating">
          {distributionData.some((item) => item.value > 0) ? <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={72} outerRadius={105} paddingAngle={3}>
                {distributionData.map((entry) => <Cell key={entry.name} fill={distributionColors[entry.name]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer> : <ChartEmpty />}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Panel title="Top 5 performers" subtitle="Highest overall performance scores">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><tr><th className="pb-3 font-semibold">Employee</th><th className="pb-3 font-semibold">Department</th><th className="pb-3 text-right font-semibold">Score</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {topPerformers.map((employee) => <tr key={employee.employeeId}><td className="py-3 font-semibold text-slate-800">{employee.name}</td><td className="py-3 text-slate-500">{employee.department}</td><td className="py-3 text-right font-bold text-indigo-700">{formatScore(employee.overallScore)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Insights" subtitle="Signals from the current workforce data">
          <ul className="space-y-4">
            {insights.map((insight) => <li key={insight} className="flex gap-3 text-sm leading-6 text-slate-600"><Activity className="mt-1 shrink-0 text-indigo-600" size={17} />{insight}</li>)}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

function ManagerDashboard({ employees, projects, user }) {
  const department = user.managedDepartment || user.department
  const team = employees.filter((employee) => employee.department === department)
  const teamData = team.map((employee) => ({ name: employee.name.split(' ')[0], score: calculateOverallPerformance(employee) }))
  const needsAttention = team.filter((employee) => ['Needs Improvement', 'Poor'].includes(getPerformanceRating(calculateOverallPerformance(employee))))
  const activeProjects = projects.filter((project) => project.department === department && project.status === 'Active')

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Team Size" value={team.length} icon={Users} accent="bg-indigo-100 text-indigo-700" />
        <StatCard label="Team Average Performance" value={formatScore(calculateAveragePerformance(team))} icon={Gauge} accent="bg-blue-100 text-blue-700" />
        <StatCard label="Team Average Attendance" value={formatScore(calculateAverageAttendance(team))} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-700" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Panel title={`${department} team performance`} subtitle="Overall score by team member">
          {teamData.length ? <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamData} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value}%`, 'Score']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> : <ChartEmpty message="No team members found" />}
        </Panel>
        <Panel title="Needs attention" subtitle="Team members below the expected range">
          {needsAttention.length ? <div className="space-y-3">{needsAttention.map((employee) => <div key={employee.employeeId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"><UserRound size={17} /></span><p className="truncate text-sm font-semibold text-slate-800">{employee.name}</p></div><div className="text-right"><p className="text-sm font-bold text-slate-700">{formatScore(calculateOverallPerformance(employee))}</p><RatingBadge score={calculateOverallPerformance(employee)} /></div></div>)}</div> : <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">All team members are currently meeting expectations.</div>}
        </Panel>
      </div>
      <Panel title="Active projects" subtitle={`Projects currently assigned to ${department}`}>
          {activeProjects.length ? <div className="grid gap-3 md:grid-cols-2">{activeProjects.map((project) => <div key={project.projectId || project.id} className="rounded-xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-800">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.teamMembers.length} team members</p></div><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{project.progress}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${project.progress}%` }} /></div></div>)}</div> : <ChartEmpty message="No active projects for this department" />}
      </Panel>
    </div>
  )
}

function EmployeeDashboard({ employees, projects, user }) {
  const employee = employees.find((item) => item.employeeId === user.employeeId)
  const companyAverage = calculateAveragePerformance(employees)

  if (!employee) {
    return <Panel title="Performance unavailable"><p className="text-sm text-slate-500">We could not find your employee record.</p></Panel>
  }

  const score = calculateOverallPerformance(employee)
  const kpiData = Object.keys(kpiLabels).map((key) => ({ subject: kpiLabels[key], score: employee[key], fullMark: 100 }))
  const currentProjects = projects.filter((project) => project.status === 'Active' && project.teamMembers.includes(employee.name))

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-indigo-700 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">Your performance overview</p><h2 className="mt-2 text-2xl font-bold">Welcome, {employee.name}</h2><p className="mt-2 text-indigo-100">{employee.designation} · {employee.department}</p></div><div className="flex items-center gap-5"><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-8 border-indigo-400/60 bg-indigo-800"><span className="text-2xl font-bold">{formatScore(score)}</span><span className="text-[10px] uppercase text-indigo-200">overall</span></div><div><RatingBadge score={score} /><p className="mt-2 text-sm text-indigo-100">Company average: {formatScore(companyAverage)}</p></div></div></div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="KPI breakdown" subtitle="Your latest scores across five measures">
          <div className="space-y-4">{Object.keys(kpiLabels).map((key) => <div key={key}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-600">{kpiLabels[key]}</span><span className="font-semibold text-slate-800">{employee[key]}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${employee[key]}%` }} /></div></div>)}</div>
        </Panel>
        <Panel title="KPI comparison" subtitle="A balanced view of your performance profile">
          <ResponsiveContainer width="100%" height={280}><RadarChart data={kpiData} outerRadius="72%"><PolarGrid stroke="#cbd5e1" /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} /><Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} /><Tooltip formatter={(value) => [`${value}%`, 'Score']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} /></RadarChart></ResponsiveContainer>
        </Panel>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Current projects" subtitle="Active projects that include you">
          {currentProjects.length ? <div className="space-y-3">{currentProjects.map((project) => <div key={project.projectId || project.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700"><BriefcaseBusiness size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.progress}% complete</p></div><div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${project.progress}%` }} /></div></div>)}</div> : <ChartEmpty message="No active projects assigned" />}
        </Panel>
        <Panel title="How you compare" subtitle="Your score in the context of the company">
          <div className="flex h-full min-h-40 flex-col justify-center rounded-xl bg-slate-50 p-5"><div className="flex items-center gap-3"><Award className="text-indigo-600" size={24} /><p className="text-lg font-bold text-slate-900">{score >= companyAverage ? 'You are above' : 'You are below'} the company average</p></div><p className="mt-3 text-sm leading-6 text-slate-600">Your overall score is <strong className="text-slate-900">{formatScore(score)}</strong>, compared with the company average of <strong className="text-slate-900">{formatScore(companyAverage)}</strong>.</p></div>
        </Panel>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    const storedEmployees = getEmployees()
    const storedProjects = getProjects()
    queueMicrotask(() => setData({ employees: storedEmployees.length ? storedEmployees : demoEmployees, projects: storedProjects.length ? storedProjects : demoProjects }))
  }, [])

  if (!data) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500"><Clock3 className="mr-2 animate-pulse" size={18} /> Loading dashboard data...</div>

  if (user?.role === 'admin') return <AdminDashboard {...data} />
  if (user?.role === 'manager') return <ManagerDashboard {...data} user={user} />
  return <EmployeeDashboard {...data} user={user} />
}