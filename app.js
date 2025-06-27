import puppeteer from "puppeteer";

(async() => {
    const navegador = await puppeteer.launch({
        headless: false,
        slowMo: 1000
    });

    const pagina = await navegador.newPage();

    await pagina.goto("https://hireline.io/mx");
}
)()
