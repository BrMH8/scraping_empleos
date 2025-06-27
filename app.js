import puppeteer from "puppeteer";

(async () => {
  const navegador = await puppeteer.launch({
    headless: false,
    slowMo: 1000,
  });

  const pagina = await navegador.newPage();

  await pagina.goto("https://hireline.io/mx");

  await pagina.waitForSelector("#keyword-input", {
    timeout: 60000,
  });

  //Ingresar elemento a buscar dinámicamentes
  await pagina.locator("#keyword-input").fill("nodejs");

  await pagina.locator("#home-search-btn").click();

  await pagina.waitForSelector("#jobs", {
    timeout: 60000,
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
        timeout: 60000,
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

  for (let i = 0; i < 1; i++) {
    const navegador = await puppeteer.launch({
      headless: false,
      slowMo: 1000,
    });

    const pagina = await navegador.newPage();

    await pagina.goto(vacantesArray[i]);

    await pagina.waitForSelector("#current-vacancy", {
      timeout: 60000,
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
    })

    console.log(datos)

    navegador.close()
  }
})();
