const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
  if (!pageTab) throw new Error('Tab not found');

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const reqId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === reqId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: reqId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Resetting localStorage and reloading...');
  await send('Runtime.evaluate', { expression: 'localStorage.clear()' });
  await send('Page.reload', { ignoreCache: true });
  await sleep(1000);

  async function snap(name) {
    const scr = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`/tmp/tour_${name}.png`, Buffer.from(scr.data, 'base64'));
    console.log(`Saved screenshot /tmp/tour_${name}.png`);
  }

  async function getInfo() {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const S = window.store || window.__mepedeStore;
        const spotlight = document.getElementById('tutorial-spotlight');
        const beacon = document.getElementById('tut-beacon-pin');
        const highlighted = document.querySelector('.tutorial-target-highlight');
        return {
          step: S ? S.tutorialStep : null,
          drawer: S ? S.drawer : null,
          menusCount: S && S.data ? S.data.menus.length : 0,
          categoriesCount: S && S.data ? S.data.categories.length : 0,
          productsCount: S && S.data ? S.data.products.length : 0,
          orderModalOpen: S ? S.orderModalOpen : false,
          spotlightDisplay: spotlight ? spotlight.style.display : null,
          spotlightOpacity: spotlight ? spotlight.style.opacity : null,
          beaconText: beacon ? beacon.innerText : null,
          highlightedId: highlighted ? (highlighted.id || highlighted.className) : null
        };
      })()`,
      returnByValue: true
    });
    return res.result.value;
  }

  async function clickSelector(selector) {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('${selector}');
        if (!el) return { error: 'Element not found: ${selector}' };
        el.click();
        return { success: true };
      })()`,
      returnByValue: true
    });
    if (res.result.value && res.result.value.error) {
      throw new Error(res.result.value.error);
    }
  }

  // Step 1
  let info = await getInfo();
  console.log('Step 1 info:', info);
  await snap('01_step1_empty');
  if (info.step !== 1) throw new Error('Expected step 1');

  // Click #tut-btn-new-menu
  console.log('Clicking #tut-btn-new-menu...');
  await clickSelector('#tut-btn-new-menu');
  await sleep(400);

  // Step 2
  info = await getInfo();
  console.log('Step 2 info:', info);
  await snap('02_step2_menu_drawer');
  if (info.step !== 2) throw new Error('Expected step 2, got: ' + info.step);

  // Click #tut-btn-save-menu
  console.log('Clicking #tut-btn-save-menu...');
  await clickSelector('#tut-btn-save-menu');
  await sleep(400);

  // Step 3
  info = await getInfo();
  console.log('Step 3 info:', info);
  await snap('03_step3_cat_banner');
  if (info.step !== 3) throw new Error('Expected step 3, got: ' + info.step);

  // Click #tut-quick-cat-lanches
  console.log('Clicking #tut-quick-cat-lanches...');
  await clickSelector('#tut-quick-cat-lanches');
  await sleep(400);

  // Step 4
  info = await getInfo();
  console.log('Step 4 info:', info);
  await snap('04_step4_products_empty');
  if (info.step !== 4) throw new Error('Expected step 4, got: ' + info.step);

  // Click #tut-btn-new-product-empty
  console.log('Clicking #tut-btn-new-product-empty...');
  await clickSelector('#tut-btn-new-product-empty');
  await sleep(400);

  // Step 5
  info = await getInfo();
  console.log('Step 5 info:', info);
  await snap('05_step5_prod_drawer');
  if (info.step !== 5) throw new Error('Expected step 5, got: ' + info.step);

  // Click #tut-quickfill-product
  console.log('Clicking #tut-quickfill-product...');
  await clickSelector('#tut-quickfill-product');
  await sleep(400);

  // Step 6
  info = await getInfo();
  console.log('Step 6 info:', info);
  await snap('06_step6_save_product');
  if (info.step !== 6) throw new Error('Expected step 6, got: ' + info.step);

  // Click #tut-btn-save-product
  console.log('Clicking #tut-btn-save-product...');
  await clickSelector('#tut-btn-save-product');
  await sleep(400);

  // Step 7
  info = await getInfo();
  console.log('Step 7 info:', info);
  await snap('07_step7_phone_preview');
  if (info.step !== 7) throw new Error('Expected step 7, got: ' + info.step);

  // Click #tut-phone-product-card
  console.log('Clicking #tut-phone-product-card...');
  await clickSelector('#tut-phone-product-card');
  await sleep(400);

  // Step 8
  info = await getInfo();
  console.log('Step 8 info:', info);
  await snap('08_step8_phone_sheet');
  if (info.step !== 8) throw new Error('Expected step 8, got: ' + info.step);

  // Click #tut-phone-add-to-cart
  console.log('Clicking #tut-phone-add-to-cart...');
  await clickSelector('#tut-phone-add-to-cart');
  await sleep(400);

  // Step 9
  info = await getInfo();
  console.log('Step 9 info:', info);
  await snap('09_step9_phone_cart');
  if (info.step !== 9) throw new Error('Expected step 9, got: ' + info.step);

  // Click #tut-phone-checkout
  console.log('Clicking #tut-phone-checkout...');
  await clickSelector('#tut-phone-checkout');
  await sleep(600);

  // Celebration / WhatsApp Modal
  info = await getInfo();
  console.log('Final info:', info);
  await snap('10_final_celebration');

  console.log('ALL 9 STEPS COMPLETED SUCCESSFULLY! 🎉');
  ws.close();
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
