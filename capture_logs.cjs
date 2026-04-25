const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
    page.on('requestfailed', request => console.log('BROWSER_NETWORK_ERR:', request.url(), request.failure().errorText));

    await page.goto('http://localhost:5173');
    console.log('Waiting for splash screen to finish (5s)...');
    await new Promise(r => setTimeout(r, 5000));
    
    await browser.close();
})();
