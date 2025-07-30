// lib/export-utils.ts

export function exportToCSV(data: unknown[], filename: string) {
  if (data.length === 0) return;

  // Type guard or assertion might be needed if you access specific properties
  // For a generic CSV exporter handling objects, 'unknown' is acceptable for the array itself.
  // However, accessing properties requires care or type assertions within the function.
  const firstRow = data[0];
  if (typeof firstRow !== "object" || firstRow === null) {
    console.error("CSV export data must be an array of objects.");
    return;
  }

  const headers = Object.keys(firstRow as Record<string, unknown>); // Asserting it's an object to get keys
  const csvContent = [
    headers.join(","),
    ...data.map((row) => {
      // Ensure row is an object for property access
      if (typeof row !== "object" || row === null) return ""; // Or handle error

      const objRow = row as Record<string, unknown>; // Assert type for access
      return headers
        .map((header) => {
          const value = objRow[header];
          // Handle value types for CSV escaping
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          // Convert other types (number, boolean) to string safely
          if (value != null) {
            // Check for null or undefined
            return String(value);
          }
          return ""; // Or return '""' if you prefer empty fields as quoted empty strings
        })
        .join(",");
    }),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// For PDF, data is an array of arrays, so unknown[][] is appropriate.
// You primarily iterate over it, so unknown[][] is safer than any[][].
export function exportToPDF(
  data: unknown[][],
  headers: string[],
  title: string
) {
  // Simple PDF generation using HTML and print
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  // Ensure data elements are treated as arrays of printable values (strings/numbers)
  // Map handles this iteration safely even with unknown[][]
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .date { text-align: center; margin-top: 20px; color: #666; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        <thead>
          <tr>
            ${headers
              .map((header) => `<th>${escapeHtml(header)}</th>`)
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) =>
                `<tr>${row
                  .map((cell) => `<td>${escapeHtml(String(cell ?? ""))}</td>`)
                  .join("")}</tr>` // Convert cell to string safely
            )
            .join("")}
        </tbody>
      </table>
      <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

// Helper function to escape HTML to prevent injection issues when generating HTML content
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
