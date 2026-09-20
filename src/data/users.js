// src/data/users.js
// Demo login users for PEAS

export const users = [
  {
    id: 1,
    role: "admin",
    name: "Anita Desai",
    email: "admin@peas.com",
    password: "admin123",
    department: "HR",
    phone: "9876543210",
  },
  {
    id: 2,
    role: "manager",
    name: "Rohan Verma",
    email: "manager@peas.com",
    password: "manager123",
    department: "IT",
    phone: "9876500001",
    managedDepartment: "IT",
  },
  {
    id: 3,
    role: "employee",
    name: "Aarav Sharma",
    email: "employee@peas.com",
    password: "employee123",
    department: "IT",
    phone: "9876500002",
    employeeId: "EMP001",
  },
];

export default users;