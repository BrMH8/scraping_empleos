import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import {preguntarElemento} from "./utils/pregunta.js";
import {crearArchivoJson} from "./utils/crearArchivoJson.js";
import {crearArchivoCsv} from "./utils/crearArchivoCsv.js";
import {crearArchivoExcel} from "./utils/crearArchivoExcel.js";
import { crearArchivoPdf } from "./utils/crearArchivoPdf.js";

const app = express();
app.use(cors('https://front-empleos-khaki.vercel.app/'));
app.use(express.json());

app.get("/api/vacantes", async (req, res) => {
    const busquedaVacante = req.query.busqueda || "php"; // Valor por defecto si no se proporciona
    try {
        const dataVacantes = await buscarVacantes(busquedaVacante);
        res.status(200).json({ data: dataVacantes, message: "Vacantes encontradas y archivos creados." });
    } catch (error) { 
        console.error("Error al buscar vacantes:", error);
        res.status(500).json({ error: "Error al buscar vacantes." });
    }
  }
)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});



async function buscarVacantes(busquedaVacante) {

  // const busquedaVacante = await preguntarElemento(); 

  const navegador = await puppeteer.launch({
    headless: true, // Cambiado a true para ocultar la ventana
    slowMo: 100, // Reducido de 1000ms a 100ms para mayor velocidad
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const pagina = await navegador.newPage();

  await pagina.goto("https://hireline.io/mx", { waitUntil: "domcontentloaded", timeout: 30000});

  await pagina.waitForSelector("#keyword-input", {
    timeout: 30000,
  });

  //Ingresar elemento a buscar dinámicamentes
  await pagina.click("#keyword-input"); 
  await pagina.type("#keyword-input", busquedaVacante, { delay: 100 });
  await pagina.click("#home-search-btn");

  await pagina.waitForSelector("#jobs", {
    timeout: 30000,
  });

  let vacantesArray = await pagina.evaluate(() => {
    const elementos = Array.from(document.querySelectorAll(".hl-vacancy-card"));

    return elementos.map((el) => {
      const enlace = el.getAttribute("href") || "Sin enlace";
      return enlace;
    });
  });

  let existNextBtn = true;

  while (existNextBtn) {
    const nextBtn = await pagina.evaluate(() => {
      const existBtn = document.querySelector("a[rel='next']");
      if (!existBtn) return false;
      return true;
    });

    if (nextBtn) {
      await pagina.locator("a[rel='next']").click();

      await pagina.waitForSelector("#jobs", {
        timeout: 30000,
      });

      const vacantes = await pagina.evaluate(() => {
        const elementos = Array.from(
          document.querySelectorAll(".hl-vacancy-card")
        );

        return elementos.map((el) => {
          const enlace = el.getAttribute("href") || "Sin enlace";
          return enlace;
        });
      });

      vacantesArray = [...vacantesArray, ...vacantes];
    }

    existNextBtn = nextBtn;
  }

  console.log("Vacantes encontradas:");
  console.log(vacantesArray);
  console.log(vacantesArray.length);

  await navegador.close();


  let dataVacantes = []
  
  // Crear un solo navegador para procesar todas las vacantes
  const navegadorDetalles = await puppeteer.launch({
    headless: true, // Oculto
    slowMo: 50, // Muy rápido
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  // Procesar vacantes en lotes para mayor velocidad
  const batchSize = 5; // Procesar 5 vacantes a la vez
  for (let i = 0; i < vacantesArray.length; i += batchSize) {
    const batch = vacantesArray.slice(i, i + batchSize);
    const batchPromises = batch.map(async (vacanteUrl) => {
      const pagina = await navegadorDetalles.newPage();
      
      try {
        await pagina.goto(vacanteUrl, {
          waitUntil: "domcontentloaded", // Más rápido que networkidle2
          timeout: 15000 // Reducido el timeout
        });

        await pagina.waitForSelector("#current-vacancy", {
          timeout: 15000,
        });

        const datos = await pagina.evaluate(() => {
            const titulo = document.querySelector("#current-vacancy > div:nth-child(2) > h1")?.innerText || "No Disponible";
            const sueldo = document.querySelector("#current-vacancy > div:nth-child(2) > p:nth-of-type(2)")?.innerText || "No Disponible";
            const ciudadModalidad = document.querySelector("#current-vacancy > div:nth-child(2) > div:nth-of-type(2) > div:first-child > p")?.innerText || "No Disponible";
            const horario = document.querySelector("#current-vacancy > div:nth-child(2) > div:nth-of-type(2) > div:nth-child(2) > p")?.innerText || "No Disponible";
            const idioma = document.querySelector("#current-vacancy > div:nth-child(2) > div:nth-of-type(2) > div:nth-child(3) > p")?.innerText || "No Disponible";
            const requisitos = document.querySelector("#current-vacancy > div:nth-child(2) > div:nth-of-type(4)")?.innerText?.replace(/\n+/g, ' ') || "No Disponible";

            return {
                titulo,
                sueldo,
                ciudadModalidad,
                horario,
                idioma,
                requisitos
            };
        });

        await pagina.close();
        return datos;
      } catch (error) {
        console.log(`Error procesando vacante ${vacanteUrl}:`, error.message);
        await pagina.close();
        return {
          titulo: "Error al cargar",
          sueldo: "No Disponible",
          ciudadModalidad: "No Disponible",
          horario: "No Disponible",
          idioma: "No Disponible",
          requisitos: "No Disponible"
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    dataVacantes.push(...batchResults);
    
    console.log(`Procesadas ${Math.min(i + batchSize, vacantesArray.length)} de ${vacantesArray.length} vacantes`);
  }

  await navegadorDetalles.close();

  const nombreArchivo = `vacantes-${busquedaVacante}`;

  //Crear archivo JSON
  crearArchivoJson(dataVacantes, `${nombreArchivo}.json`);

  //crear archivo CSV
  crearArchivoCsv(dataVacantes, `${nombreArchivo}.csv`);
  //crear archivo Excel
  crearArchivoExcel(dataVacantes, `${nombreArchivo}.xlsx`);
  // crear archivo PDF
  crearArchivoPdf(dataVacantes, `${nombreArchivo}.pdf`);

  return dataVacantes;
}
