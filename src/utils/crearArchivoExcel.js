import fs from "fs";
import XLSX from "xlsx";

/**
 * 
 * @param {Array} datos lista de datos
 * @param {String} nombreArchivo noombre para el archivo a crear ejemplo: ("vacantes.json")
 */

export function crearArchivoExcel(datos, nombreArchivo) {
    if(!Array.isArray(datos)) throw new Error("Los datos proporcionados no son aceptables, (verifique que sea un array)");
    const ws  = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws, "Archivo Excel");
    XLSX.writeFile(wb, nombreArchivo);
    console.log("Excel creado con exito")
}


