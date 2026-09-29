const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  const buttons = await page.$$('button');
  
  let adminButton = null;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.trim() === 'Admin') {
      adminButton = btn;
      break;
    }
  }
  
  if (adminButton) {
    await adminButton.click();
    await page.waitForTimeout(1000); // Wait to see if error pops up
    const newClass = await page.evaluate(el => el.className, adminButton);
    console.log('CLASS:', newClass);
  }
  
  await browser.close();
})();
