import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, FileBarChart, FileSpreadsheet, Table2 } from 'lucide-react'
import { DEPARTMENTS } from '../data/employees.js'
import { getEmployees, getProjects } from '../services/storageService.js'
import { exportToCSV } from '../utils/csvExport.js'
import { calculateAverageAttendance, calculateDepartmentAverage, calculateOverallPerformance, getPerformanceRating, getRatingColor } from '../utils/performanceUtils.js'

const reportTypes = [
  { value: 'employee-performance', label: 'Employee Performance Report', filename: 'employee_performance_report.csv' },
  { value: 'department-performance', label: 'Department Performance Report', filename: 'department_performance_report.csv' },
  { value: 'attendance', label: 'Attendance Report', filename: 'attendance_report.csv' },
  { value: 'projects', label: 'Project Report', filename: 'project_report.csv' },
]

const columns = {
  'employee-performance': [
    ['Name', 'name'], ['Department', 'department'], ['Designation', 'designation'], ['Overall Score', 'overallScore'], ['Rating', 'rating'],
  ],
  'department-performance': [
    ['Department', 'department'], ['Employee Count', 'employeeCount'], ['Average Performance', 'averagePerformance'], ['Average Attendance', 'averageAttendance'],
  ],
  attendance: [['Name', 'name'], ['Department', 'department'], ['Attendance %', 'attendance']],
  projects: [['Project Name', 'projectName'], ['Department', 'department'], ['Manager', 'manager'], ['Progress %', 'progress'], ['Status', 'status']],
}

function Panel({ children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>
}

function RatingBadge({ score }) {
  const rating = getPerformanceRating(score)
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRatingColor(rating)}`}>{rating}</span>
}

function buildReportData(type, employees, projects) {
  if (type === 'employee-performance') return employees.map((employee) => { const overallScore = calculateOverallPerformance(employee); return { name: employee.name, department: employee.department, designation: employee.designation, overallScore, rating: getPerformanceRating(overallScore) } })
  if (type === 'department-performance') return DEPARTMENTS.map((department) => ({ department, employeeCount: employees.filter((employee) => employee.department === department).length, averagePerformance: calculateDepartmentAverage(employees, department), averageAttendance: calculateAverageAttendance(employees.filter((employee) => employee.department === department)) }))
  if (type === 'attendance') return employees.map((employee) => ({ name: employee.name, department: employee.department, attendance: employee.attendance }))
  return projects.map((project) => ({ projectName: project.name, department: project.department, manager: project.manager, progress: project.progress, status: project.status }))
}

function renderCell(type, row, key) {
  if (type === 'employee-performance' && key === 'overallScore') return <span className="font-bold text-slate-800">{Number(row[key]).toFixed(1)}%</span>
  if (type === 'employee-performance' && key === 'rating') return <RatingBadge score={row.overallScore} />
  if ((type === 'department-performance' && (key === 'averagePerformance' || key === 'averageAttendance')) || (type === 'attendance' && key === 'attendance')) return `${Number(row[key]).toFixed(1)}%`
  if (type === 'projects' && key === 'progress') return `${row[key]}%`
  if (type === 'projects' && key === 'status') return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${row[key] === 'Active' ? 'border-blue-200 bg-blue-100 text-blue-700' : row[key] === 'Completed' ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : row[key] === 'Delayed' ? 'border-red-200 bg-red-100 text-red-700' : 'border-amber-200 bg-amber-100 text-amber-700'}`}>{row[key]}</span>
  return row[key]
}

export default function Reports() {
  const [employees, setEmployees] = useState(null)
  const [projects, setProjects] = useState([])
  const [reportType, setReportType] = useState(reportTypes[0].value)

  useEffect(() => {
    queueMicrotask(() => {
      setEmployees(getEmployees())
      setProjects(getProjects())
    })
  }, [])

  const rows = useMemo(() => employees ? buildReportData(reportType, employees, projects) : [], [employees, projects, reportType])
  const selectedReport = reportTypes.find((report) => report.value === reportType)
  const reportColumns = columns[reportType]

  if (!employees) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading reports...</div>

  function handleExport() {
    exportToCSV(rows, selectedReport.filename)
  }

  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Data exports</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Reports</h2><p className="mt-1 text-sm text-slate-500">Preview and download operational performance reports.</p></div><Panel><div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-end sm:p-6"><label className="block max-w-xl flex-1 text-sm font-semibold text-slate-700">Report type<select className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={reportType} onChange={(event) => setReportType(event.target.value)}>{reportTypes.map((report) => <option key={report.value} value={report.value}>{report.label}</option>)}</select></label><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={handleExport} disabled={!rows.length}><Download size={18} /> Export CSV</button></div></Panel><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm text-slate-500"><FileSpreadsheet className="text-indigo-600" size={18} /> Showing {rows.length} {reportType === 'projects' ? 'projects' : reportType === 'department-performance' ? 'departments' : 'employees'}</div><span className="hidden text-xs text-slate-400 sm:inline">{selectedReport.label}</span></div><Panel><div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">{reportType === 'projects' ? <BarChart3 size={18} /> : reportType === 'department-performance' ? <Table2 size={18} /> : <FileBarChart size={18} />}</span><div><h3 className="font-bold text-slate-900">{selectedReport.label}</h3><p className="text-xs text-slate-500">Live data preview</p></div></div>{rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr>{reportColumns.map(([label, key]) => <th className="px-5 py-4 font-semibold" key={key}>{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={`${reportType}-${row.name || row.department || row.projectName}-${index}`} className="hover:bg-slate-50">{reportColumns.map(([, key]) => <td className="px-5 py-4 text-slate-600" key={key}>{renderCell(reportType, row, key)}</td>)}</tr>)}</tbody></table></div> : <div className="px-6 py-16 text-center text-sm text-slate-500">No data available for this report.</div>}</Panel><div className="text-xs text-slate-400">Reports are generated from the current employee and project records.</div></div>
}