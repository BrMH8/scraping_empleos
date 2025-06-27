import fs from "fs";

/**
 * 
 * @param {Array} datos lista de datos
 * @param {String} nombreArchivo noombre para el archivo a crear ejemplo: ("vacantes.json")
 */

export function crearArchivoJson(datos, nombreArchivo) {
    if(!Array.isArray(datos)) throw new Error("Los datos proporcionados no son aceptables, (verifique que sea un array)");

    const data = JSON.stringify(datos);
    fs.writeFileSync(nombreArchivo, data);

    console.log("::: Archivo JSON Creado!! :::");
}