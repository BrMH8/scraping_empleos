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
  console.log(vacantesArray.length)

  await navegador.close();
})();
