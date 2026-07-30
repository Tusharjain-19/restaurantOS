import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportReportsToExcel = (reportsData: { [key: string]: any[] }, fileName: string) => {
  const workbook = XLSX.utils.book_new();
  
  Object.entries(reportsData).forEach(([sheetName, data]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
