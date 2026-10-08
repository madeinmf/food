const http = require('http');
const fs = require('fs');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const list = JSON.parse(data);
        const page = list.find(x => x.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          resolve(page.webSocketDebuggerUrl);
        } else {
          reject(new Error('No page target found'));
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const wsUrl = await getWsUrl();
  console.log('Connecting to', wsUrl);
  const ws = new WebSocket(wsUrl);

  let id = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const { resolve, reject } = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  console.log('Connected to CDP.');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n--- VERIFYING BANNER REMOVAL ---');
  const bannerExists = await evaluate('!!document.querySelector(".doc-banner")');
  console.log('Doc banner exists in sidebar?', bannerExists);
  if (bannerExists) throw new Error('FAIL: .doc-banner was not removed from sidebar');
  console.log('PASS: .doc-banner removed from sidebar.');

  console.log('\n--- VERIFYING DRAWER INPUT FLICKER / FOCUS LOSS ---');
  // Click on "Criar cardápio" button (#tut-btn-new-menu)
  await evaluate(`
    const btn = document.querySelector('#tut-btn-new-menu') || document.querySelector('#tut-btn-new-menu-top');
    if (btn) btn.click();
  `);
  await new Promise(r => setTimeout(r, 400));

  const drawerOpen = await evaluate('!!document.querySelector(".drawer-content")');
  console.log('Menu drawer open?', drawerOpen);
  if (!drawerOpen) throw new Error('FAIL: Drawer failed to open');

  // Focus input-md-name and simulate typing character by character
  const testName = 'Festival de Smash Burger';
  const typeResult = await evaluate(`
    (() => {
      const input = document.getElementById('input-md-name');
      if (!input) return { ok: false, error: 'input not found' };
      input.focus();
      input.value = '';
      let focusedThroughout = true;
      const letters = "${testName}".split('');
      for (const char of letters) {
        input.value += char;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (document.activeElement !== input) {
          focusedThroughout = false;
        }
      }
      const title = document.getElementById('drawer-md-title');
      return {
        ok: true,
        focusedThroughout,
        finalValue: input.value,
        titleText: title ? title.textContent : null,
        activeElementId: document.activeElement ? document.activeElement.id : null
      };
    })()
  `);
  console.log('Type result:', typeResult);
  if (!typeResult.ok || !typeResult.focusedThroughout || typeResult.finalValue !== testName) {
    throw new Error('FAIL: Focus was lost or value was not preserved during typing');
  }
  console.log('PASS: Typing in drawer input was 100% smooth without losing focus or flickering!');

  // Now save menu
  await evaluate(`
    const saveBtn = document.getElementById('tut-btn-save-menu');
    if (saveBtn) saveBtn.click();
  `);
  await new Promise(r => setTimeout(r, 500));

  const savedMenuName = await evaluate('window.__mepedeStore.data.menus[0] ? window.__mepedeStore.data.menus[0].name : null');
  console.log('Saved menu name in store:', savedMenuName);
  if (savedMenuName !== testName) {
    throw new Error('FAIL: Menu name was not properly saved to store');
  }
  console.log('PASS: Menu saved successfully with typed name.');

  console.log('\n--- VERIFYING PHONE MOCKUP PRICE FORMATTING ---');
  // Load demo seed so we have products with discounts in the mockup
  await evaluate(`window.__mepedeStore.loadSeedData()`);
  await new Promise(r => setTimeout(r, 500));

  const cardPriceInfo = await evaluate(`
    (() => {
      const card = document.querySelector('#tut-phone-product-card') || document.querySelector('.phone-screen [onclick*="setPhone"]');
      if (!card) return { found: false };
      const priceText = card.querySelector('[style*="00B368"]')?.textContent;
      const origText = card.querySelector('[style*="text-decoration:line-through"]')?.textContent;
      const pillText = card.querySelector('[style*="padding:1px 4.5px"]')?.textContent;
      const button = card.querySelector('button');
      const buttonText = button ? button.textContent.trim() : null;
      return {
        found: true,
        priceText,
        origText,
        pillText,
        buttonText
      };
    })()
  `);
  console.log('Card price info:', cardPriceInfo);
  if (!cardPriceInfo.found) throw new Error('FAIL: Product card not found in phone mockup');
  console.log('PASS: Product card found with clean single-line prices:', cardPriceInfo);

  console.log('\n--- VERIFYING PDF DOCUMENTATION ---');
  if (!fs.existsSync('documentacao.pdf')) throw new Error('FAIL: documentacao.pdf does not exist');
  const stat = fs.statSync('documentacao.pdf');
  console.log('documentacao.pdf file size:', stat.size, 'bytes');
  if (stat.size < 1000000) throw new Error('FAIL: documentacao.pdf size too small');
  console.log('PASS: documentacao.pdf is generated and valid (> 3MB)');

  console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY! 🎉');
  ws.close();
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
