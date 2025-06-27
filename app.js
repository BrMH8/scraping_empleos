import puppeteer from "puppeteer";

(async() => {
    const navegador = await puppeteer.launch({
        headless: false,
        slowMo: 1000
    });

    const pagina = await navegador.newPage();

    await pagina.goto("https://hireline.io/mx");

    await pagina.waitForSelector(".fa-search", {
        timeout: 60000
    })

     //Ingresar elemento a buscar dinámicamentes
    await pagina.locator("#keyword-input").fill("desarrollador junior");
}
)()
