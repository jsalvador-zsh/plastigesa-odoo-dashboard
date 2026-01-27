import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exporta un array de objetos a un archivo Excel
 * @param data Datos a exportar
 * @param fileName Nombre del archivo (sin extensión)
 * @param sheetName Nombre de la hoja
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Datos') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generar el buffer de Excel
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  saveAs(dataBlob, `${fileName}_${new Date().getTime()}.xlsx`);
};
