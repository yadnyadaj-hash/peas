// src/data/employees.js
// Demo employee dataset for PEAS
// Departments: IT, HR, Finance, Marketing, Sales, Operations

export const DEPARTMENTS = ["IT", "HR", "Finance", "Marketing", "Sales", "Operations"];

const rawEmployees = [
  // ---------------- IT ----------------
  { employeeId: "EMP001", name: "Aarav Sharma", department: "IT", designation: "Software Developer", manager: "Rohan Verma", joiningDate: "2022-03-14", productivity: 88, quality: 91, teamwork: 84, communication: 86, attendance: 94, projectsCompleted: 12, currentProjects: 2, jobSatisfaction: 85, experience: 3 },
  { employeeId: "EMP002", name: "Isha Kapoor", department: "IT", designation: "Frontend Developer", manager: "Rohan Verma", joiningDate: "2021-07-01", productivity: 79, quality: 82, teamwork: 88, communication: 80, attendance: 91, projectsCompleted: 9, currentProjects: 1, jobSatisfaction: 78, experience: 4 },
  { employeeId: "EMP003", name: "Vivaan Mehta", department: "IT", designation: "Backend Developer", manager: "Rohan Verma", joiningDate: "2020-11-20", productivity: 92, quality: 89, teamwork: 76, communication: 74, attendance: 96, projectsCompleted: 15, currentProjects: 3, jobSatisfaction: 82, experience: 5 },
  { employeeId: "EMP004", name: "Ananya Iyer", department: "IT", designation: "QA Engineer", manager: "Rohan Verma", joiningDate: "2023-01-09", productivity: 65, quality: 70, teamwork: 72, communication: 68, attendance: 85, projectsCompleted: 5, currentProjects: 1, jobSatisfaction: 60, experience: 1 },
  { employeeId: "EMP005", name: "Kabir Nair", department: "IT", designation: "System Administrator", manager: "Rohan Verma", joiningDate: "2019-05-17", productivity: 58, quality: 62, teamwork: 55, communication: 60, attendance: 78, projectsCompleted: 4, currentProjects: 1, jobSatisfaction: 55, experience: 6 },
  { employeeId: "EMP006", name: "Reyansh Gupta", department: "IT", designation: "Software Developer", manager: "Rohan Verma", joiningDate: "2022-09-11", productivity: 95, quality: 93, teamwork: 90, communication: 89, attendance: 97, projectsCompleted: 14, currentProjects: 2, jobSatisfaction: 90, experience: 3 },

  // ---------------- HR ----------------
  { employeeId: "EMP007", name: "Priya Singh", department: "HR", designation: "HR Executive", manager: "Neha Kulkarni", joiningDate: "2021-02-15", productivity: 84, quality: 86, teamwork: 90, communication: 92, attendance: 95, projectsCompleted: 8, currentProjects: 1, jobSatisfaction: 88, experience: 4 },
  { employeeId: "EMP008", name: "Rahul Joshi", department: "HR", designation: "HR Coordinator", manager: "Neha Kulkarni", joiningDate: "2022-06-01", productivity: 76, quality: 79, teamwork: 81, communication: 83, attendance: 90, projectsCompleted: 6, currentProjects: 1, jobSatisfaction: 75, experience: 2 },
  { employeeId: "EMP009", name: "Sanya Malhotra", department: "HR", designation: "Talent Acquisition Executive", manager: "Neha Kulkarni", joiningDate: "2020-08-23", productivity: 90, quality: 88, teamwork: 85, communication: 91, attendance: 93, projectsCompleted: 11, currentProjects: 2, jobSatisfaction: 87, experience: 5 },
  { employeeId: "EMP010", name: "Dev Chatterjee", department: "HR", designation: "HR Analyst", manager: "Neha Kulkarni", joiningDate: "2023-03-05", productivity: 62, quality: 65, teamwork: 68, communication: 64, attendance: 82, projectsCompleted: 3, currentProjects: 1, jobSatisfaction: 58, experience: 1 },
  { employeeId: "EMP011", name: "Meera Pillai", department: "HR", designation: "Training Coordinator", manager: "Neha Kulkarni", joiningDate: "2021-10-19", productivity: 80, quality: 82, teamwork: 87, communication: 85, attendance: 92, projectsCompleted: 7, currentProjects: 1, jobSatisfaction: 80, experience: 3 },

  // ---------------- Finance ----------------
  { employeeId: "EMP012", name: "Arjun Reddy", department: "Finance", designation: "Financial Analyst", manager: "Kavita Rao", joiningDate: "2020-01-12", productivity: 87, quality: 90, teamwork: 78, communication: 75, attendance: 94, projectsCompleted: 10, currentProjects: 2, jobSatisfaction: 82, experience: 5 },
  { employeeId: "EMP013", name: "Diya Bhatt", department: "Finance", designation: "Accountant", manager: "Kavita Rao", joiningDate: "2022-04-18", productivity: 72, quality: 75, teamwork: 70, communication: 68, attendance: 88, projectsCompleted: 6, currentProjects: 1, jobSatisfaction: 70, experience: 2 },
  { employeeId: "EMP014", name: "Aditya Menon", department: "Finance", designation: "Senior Accountant", manager: "Kavita Rao", joiningDate: "2018-09-30", productivity: 93, quality: 95, teamwork: 82, communication: 80, attendance: 96, projectsCompleted: 18, currentProjects: 2, jobSatisfaction: 88, experience: 7 },
  { employeeId: "EMP015", name: "Riya Desai", department: "Finance", designation: "Finance Executive", manager: "Kavita Rao", joiningDate: "2023-02-27", productivity: 55, quality: 58, teamwork: 60, communication: 57, attendance: 75, projectsCompleted: 2, currentProjects: 1, jobSatisfaction: 50, experience: 1 },
  { employeeId: "EMP016", name: "Karan Thakur", department: "Finance", designation: "Accounts Executive", manager: "Kavita Rao", joiningDate: "2021-12-08", productivity: 78, quality: 80, teamwork: 74, communication: 72, attendance: 89, projectsCompleted: 7, currentProjects: 1, jobSatisfaction: 74, experience: 3 },

  // ---------------- Marketing ----------------
  { employeeId: "EMP017", name: "Aisha Khan", department: "Marketing", designation: "Marketing Executive", manager: "Sameer Khanna", joiningDate: "2021-05-14", productivity: 89, quality: 87, teamwork: 91, communication: 93, attendance: 92, projectsCompleted: 12, currentProjects: 2, jobSatisfaction: 89, experience: 4 },
  { employeeId: "EMP018", name: "Yash Agarwal", department: "Marketing", designation: "Digital Marketing Executive", manager: "Sameer Khanna", joiningDate: "2022-08-02", productivity: 84, quality: 82, teamwork: 86, communication: 88, attendance: 90, projectsCompleted: 9, currentProjects: 2, jobSatisfaction: 83, experience: 3 },
  { employeeId: "EMP019", name: "Tara Bhatia", department: "Marketing", designation: "Content Strategist", manager: "Sameer Khanna", joiningDate: "2020-03-21", productivity: 91, quality: 93, teamwork: 88, communication: 94, attendance: 95, projectsCompleted: 16, currentProjects: 3, jobSatisfaction: 92, experience: 5 },
  { employeeId: "EMP020", name: "Ishaan Rao", department: "Marketing", designation: "Marketing Analyst", manager: "Sameer Khanna", joiningDate: "2023-06-16", productivity: 68, quality: 70, teamwork: 66, communication: 69, attendance: 84, projectsCompleted: 4, currentProjects: 1, jobSatisfaction: 62, experience: 1 },
  { employeeId: "EMP021", name: "Navya Chawla", department: "Marketing", designation: "SEO Executive", manager: "Sameer Khanna", joiningDate: "2021-11-09", productivity: 80, quality: 78, teamwork: 82, communication: 84, attendance: 91, projectsCompleted: 8, currentProjects: 1, jobSatisfaction: 79, experience: 3 },

  // ---------------- Sales ----------------
  { employeeId: "EMP022", name: "Rohan Verma", department: "Sales", designation: "Sales Executive", manager: "Anil Kapoor", joiningDate: "2019-10-25", productivity: 86, quality: 84, teamwork: 89, communication: 90, attendance: 93, projectsCompleted: 20, currentProjects: 3, jobSatisfaction: 85, experience: 6 },
  { employeeId: "EMP023", name: "Simran Kaur", department: "Sales", designation: "Sales Representative", manager: "Anil Kapoor", joiningDate: "2022-02-13", productivity: 74, quality: 72, teamwork: 76, communication: 78, attendance: 87, projectsCompleted: 10, currentProjects: 2, jobSatisfaction: 71, experience: 2 },
  { employeeId: "EMP024", name: "Aryan Bose", department: "Sales", designation: "Business Development Executive", manager: "Anil Kapoor", joiningDate: "2021-04-30", productivity: 90, quality: 88, teamwork: 85, communication: 92, attendance: 94, projectsCompleted: 17, currentProjects: 2, jobSatisfaction: 88, experience: 4 },
  { employeeId: "EMP025", name: "Pooja Nambiar", department: "Sales", designation: "Sales Analyst", manager: "Anil Kapoor", joiningDate: "2023-07-04", productivity: 60, quality: 63, teamwork: 58, communication: 61, attendance: 80, projectsCompleted: 3, currentProjects: 1, jobSatisfaction: 55, experience: 1 },
  { employeeId: "EMP026", name: "Farhan Ansari", department: "Sales", designation: "Account Executive", manager: "Anil Kapoor", joiningDate: "2020-06-22", productivity: 82, quality: 80, teamwork: 84, communication: 86, attendance: 91, projectsCompleted: 13, currentProjects: 2, jobSatisfaction: 80, experience: 5 },

  // ---------------- Operations ----------------
  { employeeId: "EMP027", name: "Nikhil Choudhary", department: "Operations", designation: "Operations Executive", manager: "Sunita Pillai", joiningDate: "2021-01-28", productivity: 77, quality: 79, teamwork: 81, communication: 76, attendance: 89, projectsCompleted: 8, currentProjects: 1, jobSatisfaction: 75, experience: 3 },
  { employeeId: "EMP028", name: "Anjali Saxena", department: "Operations", designation: "Operations Analyst", manager: "Sunita Pillai", joiningDate: "2022-05-10", productivity: 85, quality: 83, teamwork: 80, communication: 79, attendance: 92, projectsCompleted: 9, currentProjects: 2, jobSatisfaction: 81, experience: 3 },
  { employeeId: "EMP029", name: "Manav Trivedi", department: "Operations", designation: "Process Coordinator", manager: "Sunita Pillai", joiningDate: "2020-12-03", productivity: 70, quality: 68, teamwork: 72, communication: 66, attendance: 86, projectsCompleted: 6, currentProjects: 1, jobSatisfaction: 65, experience: 4 },
  { employeeId: "EMP030", name: "Divya Ramesh", department: "Operations", designation: "Operations Manager", manager: "Sunita Pillai", joiningDate: "2018-04-16", productivity: 94, quality: 92, teamwork: 90, communication: 88, attendance: 97, projectsCompleted: 22, currentProjects: 3, jobSatisfaction: 91, experience: 8 },
  { employeeId: "EMP031", name: "Zoya Siddiqui", department: "Operations", designation: "Business Operations Executive", manager: "Sunita Pillai", joiningDate: "2023-09-01", productivity: 63, quality: 61, teamwork: 65, communication: 60, attendance: 81, projectsCompleted: 3, currentProjects: 1, jobSatisfaction: 56, experience: 1 },
];

function calcOverall(e) {
  return Math.round(((e.productivity + e.quality + e.teamwork + e.communication + e.attendance) / 5) * 10) / 10;
}

function getStatus(e) {
  const onLeaveIds = ["EMP010", "EMP025"];
  return onLeaveIds.includes(e.employeeId) ? "On Leave" : "Active";
}

export const employees = rawEmployees.map((e, idx) => ({
  id: idx + 1,
  employeeId: e.employeeId,
  name: e.name,
  email: `${e.name.toLowerCase().replace(/\s+/g, ".")}@peas.com`,
  phone: `9${Math.floor(100000000 + (idx * 987654) % 899999999)}`,
  department: e.department,
  designation: e.designation,
  manager: e.manager,
  joiningDate: e.joiningDate,
  status: getStatus(e),
  performance: calcOverall(e),
  attendance: e.attendance,
  productivity: e.productivity,
  quality: e.quality,
  teamwork: e.teamwork,
  communication: e.communication,
  projectsCompleted: e.projectsCompleted,
  currentProjects: e.currentProjects,
  jobSatisfaction: e.jobSatisfaction,
  experience: e.experience,
  lastReviewDate: "2026-06-15",
}));

export default employees;