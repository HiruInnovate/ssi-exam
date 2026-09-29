const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log('Finding buttons...');
  const buttons = await page.$$('button');
  
  let adminButton = null;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.trim() === 'Admin') {
      adminButton = btn;
      break;
    }
  }
  
  if (!adminButton) {
    console.log('Admin button not found!');
  } else {
    console.log('Admin button found! Trying to click...');
    try {
      await adminButton.click();
      console.log('Successfully clicked Admin button!');
      
      // Let's verify if the state updated
      const newClass = await page.evaluate(el => el.className, adminButton);
      console.log('Admin button classes after click:', newClass);
    } catch (err) {
      console.log('Error clicking:', err.message);
    }
  }
  
  await browser.close();
})();
