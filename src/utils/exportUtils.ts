
import { TimeEntry } from "@/types/timeTracking";
import { format } from "date-fns";
import ExcelJS from "exceljs";

// Function to export time entries to CSV file
export const exportTimeEntriesToCSV = async (
  timeEntries: TimeEntry[],
  userName: string
) => {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Time Entries");

  // Add user name as title
  worksheet.addRow([userName]);
  
  // Add current month
  const currentMonth = format(new Date(), "MMMM yyyy");
  worksheet.addRow([currentMonth]);
  
  // Add empty row
  worksheet.addRow([]);
  
  // Add headers
  worksheet.addRow(["Description", "Start Time", "End Time", "Duration (hh:mm)"]);

  // Add time entries
  timeEntries.forEach(entry => {
    const startTime = new Date(entry.start_time);
    const endTime = entry.end_time ? new Date(entry.end_time) : null;
    
    let duration = "";
    if (endTime) {
      const durationMs = endTime.getTime() - startTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      duration = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }
    
    worksheet.addRow([
      entry.description || "No description",
      format(startTime, "yyyy-MM-dd HH:mm"),
      endTime ? format(endTime, "yyyy-MM-dd HH:mm") : "In progress",
      duration
    ]);
  });

  // Apply some basic styling
  worksheet.getColumn(1).width = 40;
  worksheet.getColumn(2).width = 20;
  worksheet.getColumn(3).width = 20;
  worksheet.getColumn(4).width = 15;
  
  // Make the first row (user name) bold
  worksheet.getRow(1).font = { bold: true, size: 14 };
  
  // Make the header row bold
  worksheet.getRow(4).font = { bold: true };

  // Generate CSV file
  const buffer = await workbook.csv.writeBuffer();
  
  // Create a blob from the buffer
  const blob = new Blob([buffer], { type: "text/csv" });
  
  // Create a download link and trigger the download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `time_entries_${format(new Date(), "yyyy-MM")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
