// src/services/storageService.js
// Central localStorage data access layer for PEAS
// All components should go through this file instead of touching localStorage directly

import { employees as demoEmployees } from "../data/employees";
import { projects as demoProjects } from "../data/projects";
import { users as demoUsers } from "../data/users";

const KEYS = {
  EMPLOYEES: "peas_employees",
  PROJECTS: "peas_projects",
  USERS: "peas_users",
  NOTIFICATIONS: "peas_notifications",
  SESSION: "peas_session",
  SETTINGS: "peas_settings",
};

// ---------- Generic helpers ----------
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
    return false;
  }
}

// ---------- Initialization ----------
export function initializeDemoData() {
  if (!localStorage.getItem(KEYS.EMPLOYEES)) {
    safeSet(KEYS.EMPLOYEES, demoEmployees);
  }
  if (!localStorage.getItem(KEYS.PROJECTS)) {
    safeSet(KEYS.PROJECTS, demoProjects);
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    safeSet(KEYS.USERS, demoUsers);
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    safeSet(KEYS.NOTIFICATIONS, [
      { id: 1, message: "Performance review completed.", date: new Date().toISOString(), read: false },
      { id: 2, message: "Employee performance updated.", date: new Date().toISOString(), read: false },
      { id: 3, message: "New project assigned.", date: new Date().toISOString(), read: false },
      { id: 4, message: "Attendance report updated.", date: new Date().toISOString(), read: false },
    ]);
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    safeSet(KEYS.SETTINGS, { darkMode: false, notifications: true, compactSidebar: false });
  }
}

// ---------- Employees ----------
export function getEmployees() {
  return safeGet(KEYS.EMPLOYEES, []);
}

export function saveEmployees(employees) {
  return safeSet(KEYS.EMPLOYEES, employees);
}

export function addEmployee(employee) {
  const employees = getEmployees();
  const newId = employees.length ? Math.max(...employees.map((e) => e.id)) + 1 : 1;
  const newEmployee = { id: newId, ...employee };
  const updated = [...employees, newEmployee];
  saveEmployees(updated);
  return newEmployee;
}

export function updateEmployee(id, updatedFields) {
  const employees = getEmployees();
  const updated = employees.map((e) => (e.id === id ? { ...e, ...updatedFields } : e));
  saveEmployees(updated);
  return updated.find((e) => e.id === id);
}

export function deleteEmployee(id) {
  const employees = getEmployees();
  const updated = employees.filter((e) => e.id !== id);
  saveEmployees(updated);
  return updated;
}

export function getEmployeeById(id) {
  return getEmployees().find((e) => e.id === Number(id));
}

// ---------- Projects ----------
export function getProjects() {
  return safeGet(KEYS.PROJECTS, []);
}

export function saveProjects(projects) {
  return safeSet(KEYS.PROJECTS, projects);
}

export function addProject(project) {
  const projects = getProjects();
  const newId = projects.length ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
  const newProject = { id: newId, ...project };
  saveProjects([...projects, newProject]);
  return newProject;
}

export function updateProject(id, updatedFields) {
  const projects = getProjects();
  const updated = projects.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
  saveProjects(updated);
  return updated.find((p) => p.id === id);
}

export function deleteProject(id) {
  const projects = getProjects();
  const updated = projects.filter((p) => p.id !== id);
  saveProjects(updated);
  return updated;
}

// ---------- Users (for login) ----------
export function getUsers() {
  return safeGet(KEYS.USERS, []);
}

// ---------- Notifications ----------
export function getNotifications() {
  return safeGet(KEYS.NOTIFICATIONS, []);
}

export function addNotification(message) {
  const notifications = getNotifications();
  const newId = notifications.length ? Math.max(...notifications.map((n) => n.id)) + 1 : 1;
  const newNotification = { id: newId, message, date: new Date().toISOString(), read: false };
  const updated = [newNotification, ...notifications];
  safeSet(KEYS.NOTIFICATIONS, updated);
  return updated;
}

export function markNotificationRead(id) {
  const notifications = getNotifications();
  const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  safeSet(KEYS.NOTIFICATIONS, updated);
  return updated;
}

// ---------- Session (login/logout) ----------
export function loginUser(email, password) {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    safeSet(KEYS.SESSION, user);
    return user;
  }
  return null;
}

export function logoutUser() {
  localStorage.removeItem(KEYS.SESSION);
}

export function getCurrentUser() {
  return safeGet(KEYS.SESSION, null);
}

// ---------- Settings ----------
export function getSettings() {
  return safeGet(KEYS.SETTINGS, { darkMode: false, notifications: true, compactSidebar: false });
}

export function saveSettings(settings) {
  return safeSet(KEYS.SETTINGS, settings);
}