// src/utils/csvExport.js
// Simple CSV export utility - no external libraries needed

export function exportToCSV(data, filename = "export.csv") {
  if (!data || !data.length) {
    console.error("No data to export");
    return;
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);

  // Build CSV rows
  const csvRows = [];
  csvRows.push(headers.join(","));

  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header] ?? "";
      // Escape commas and quotes
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  });

  const csvContent = csvRows.join("\n");

  // Create a downloadable blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}