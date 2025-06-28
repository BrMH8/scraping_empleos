import fs from "fs";
import { Parser } from 'json2csv';

/**
 * 
 * @param {Array} datos lista de datos
 * @param {String} nombreArchivo noombre para el archivo a crear ejemplo: ("vacantes.json")
 */

export function crearArchivoCsv(datos, nombreArchivo) {
    if(!Array.isArray(datos)) throw new Error("Los datos proporcionados no son aceptables, (verifique que sea un array)");
    const fields = [
            'titulo',
            'sueldo',
            'ciudadModalidad',
            'horario',
            'idioma',
            'requisitos'];
    const json2csvParse = new Parser({
        fields: fields,
        defaultValue: 'No info'
    });
    const csv = json2csvParse.parse(datos);
    fs.writeFileSync(`${nombreArchivo}`, csv, "utf-8");
    console.log('Archivo csv creado');

}