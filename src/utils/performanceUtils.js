// src/utils/performanceUtils.js
// Core performance calculation utilities used across the whole app

// Calculate overall performance score from 5 KPIs
export function calculateOverallPerformance(employee) {
  const { productivity, quality, teamwork, communication, attendance } = employee;
  const sum = productivity + quality + teamwork + communication + attendance;
  return Math.round((sum / 5) * 10) / 10; // 1 decimal place
}

export function calculateKpiFromRatings(ratings) {
  if (!ratings?.length) return 0;
  const sum = ratings.reduce((total, rating) => total + Number(rating || 0), 0);
  return Math.round((sum / (ratings.length * 5)) * 100);
}

// Get rating label based on score
export function getPerformanceRating(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Poor";
}

// Get color classes for a rating badge (Tailwind)
export function getRatingColor(rating) {
  switch (rating) {
    case "Excellent":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Very Good":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Good":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "Needs Improvement":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Poor":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

// Average performance across a list of employees
export function calculateAveragePerformance(employees) {
  if (!employees.length) return 0;
  const total = employees.reduce((sum, e) => sum + calculateOverallPerformance(e), 0);
  return Math.round((total / employees.length) * 10) / 10;
}

// Average attendance across a list of employees
export function calculateAverageAttendance(employees) {
  if (!employees.length) return 0;
  const total = employees.reduce((sum, e) => sum + e.attendance, 0);
  return Math.round((total / employees.length) * 10) / 10;
}

// Department-wise average performance
export function calculateDepartmentAverage(employees, department) {
  const deptEmployees = employees.filter((e) => e.department === department);
  return calculateAveragePerformance(deptEmployees);
}

// Get performance averages for all departments (used in charts)
export function getDepartmentPerformanceData(employees, departments) {
  return departments.map((dept) => ({
    department: dept,
    average: calculateDepartmentAverage(employees, dept),
    employeeCount: employees.filter((e) => e.department === dept).length,
  }));
}

// Top N performers
export function getTopPerformers(employees, count = 5) {
  return [...employees]
    .map((e) => ({ ...e, overallScore: calculateOverallPerformance(e) }))
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, count);
}

// Performance distribution (count of employees per rating category)
export function getPerformanceDistribution(employees) {
  const distribution = {
    Excellent: 0,
    "Very Good": 0,
    Good: 0,
    "Needs Improvement": 0,
    Poor: 0,
  };
  employees.forEach((e) => {
    const rating = getPerformanceRating(calculateOverallPerformance(e));
    distribution[rating]++;
  });
  return distribution;
}

// KPI averages across employees (for KPI comparison chart)
export function getKPIAverages(employees) {
  if (!employees.length) {
    return { productivity: 0, quality: 0, teamwork: 0, communication: 0, attendance: 0 };
  }
  const totals = employees.reduce(
    (acc, e) => {
      acc.productivity += e.productivity;
      acc.quality += e.quality;
      acc.teamwork += e.teamwork;
      acc.communication += e.communication;
      acc.attendance += e.attendance;
      return acc;
    },
    { productivity: 0, quality: 0, teamwork: 0, communication: 0, attendance: 0 }
  );
  const n = employees.length;
  return {
    productivity: Math.round((totals.productivity / n) * 10) / 10,
    quality: Math.round((totals.quality / n) * 10) / 10,
    teamwork: Math.round((totals.teamwork / n) * 10) / 10,
    communication: Math.round((totals.communication / n) * 10) / 10,
    attendance: Math.round((totals.attendance / n) * 10) / 10,
  };
}

// Highest and lowest performing departments
export function getHighestLowestDepartments(employees, departments) {
  const data = getDepartmentPerformanceData(employees, departments);
  const sorted = [...data].sort((a, b) => b.average - a.average);
  return {
    highest: sorted[0],
    lowest: sorted[sorted.length - 1],
  };
}

// Generate dynamic insights based on actual data
export function generatePerformanceInsights(employees, departments) {
  const insights = [];
  const { highest, lowest } = getHighestLowestDepartments(employees, departments);
  const distribution = getPerformanceDistribution(employees);
  const avgAttendance = calculateAverageAttendance(employees);
  const companyAvg = calculateAveragePerformance(employees);

  if (highest) {
    insights.push(`${highest.department} currently has the highest average performance at ${highest.average}%.`);
  }
  if (lowest) {
    insights.push(`${lowest.department} has the lowest average performance at ${lowest.average}% and may need attention.`);
  }
  if (distribution.Excellent > 0) {
    insights.push(`${distribution.Excellent} employee${distribution.Excellent > 1 ? "s are" : " is"} in the Excellent performance category.`);
  }
  if (avgAttendance >= 90) {
    insights.push(`Average attendance is strong at ${avgAttendance}%.`);
  } else {
    insights.push(`Average attendance is ${avgAttendance}%, below the ideal 90% threshold.`);
  }
  insights.push(`Overall company performance average stands at ${companyAvg}%.`);

  return insights;
}
