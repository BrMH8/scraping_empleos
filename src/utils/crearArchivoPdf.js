import PDFDocument from "pdfkit";
import fs from "fs";

export function crearArchivoPdf(data, nombreArchivo) {
  const doc = new PDFDocument({ margin: 30, size: "A4" });
  const stream = fs.createWriteStream(nombreArchivo);

  doc.pipe(stream);

  doc.fontSize(18).text("Vacantes encontradas", { align: "center" });
  doc.moveDown();

  data.forEach((vacante, index) => {
    doc.fontSize(14).fillColor("blue").text(`Vacante #${index + 1}`, { underline: true });
    doc.moveDown(0.3);

    doc.fontSize(12).fillColor("black").text(`Título: ${vacante.titulo}`);
    doc.text(`Sueldo: ${vacante.sueldo}`);
    doc.text(`Ciudad/Modalidad: ${vacante.ciudadModalidad}`);
    doc.text(`Horario: ${vacante.horario}`);
    doc.text(`Idioma: ${vacante.idioma}`);
    doc.text(`Requisitos: ${vacante.requisitos}`);
    doc.moveDown();
  });

  doc.end();

  stream.on("finish", () => {
    console.log(`Archivo PDF creado correctamente: ${nombreArchivo}`);
  });
}
