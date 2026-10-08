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
  await new Promise(r => setTimeout(r, 1200));

  console.log('\n--- 1. TEST OPENING PRODUCT DRAWER WITH LINKED GROUPS ---');
  await evaluate(`
    window.__mepedeStore.loadSeedData();
    const p = window.__mepedeStore.data.products.find(x => x.groupIds && x.groupIds.length > 0) || window.__mepedeStore.data.products[0];
    window.__mepedeStore.openProduct(p);
  `);
  await new Promise(r => setTimeout(r, 600));

  const drawerOpen = await evaluate('!!document.querySelector(".drawer-content")');
  console.log('Product drawer open:', drawerOpen);
  if (!drawerOpen) throw new Error('Product drawer failed to open');

  console.log('\n--- 2. VERIFYING DESTAQUES / TAGS SELECT & CHIPS ---');
  const badgeSelectExists = await evaluate('!!document.getElementById("select-draft-badge")');
  console.log('select-draft-badge exists:', badgeSelectExists);
  if (!badgeSelectExists) throw new Error('FAIL: select-draft-badge missing');

  // Test selecting badge
  const badgeResult = await evaluate(`
    (() => {
      const sel = document.getElementById("select-draft-badge");
      sel.value = "Novidade";
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return window.__mepedeStore.draft.badge;
    })()
  `);
  console.log('Badge after select change:', badgeResult);
  if (badgeResult !== 'Novidade') throw new Error('FAIL: Badge was not set to Novidade');

  // Test quick chip click
  await evaluate(`
    (() => {
      // Find quick chip for 'mais pedido'
      const chips = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('mais pedido'));
      if (chips.length > 0) chips[0].click();
    })()
  `);
  await new Promise(r => setTimeout(r, 300));
  const badgeAfterChip = await evaluate('window.__mepedeStore.draft.badge');
  console.log('Badge after clicking quick chip:', badgeAfterChip);
  if (badgeAfterChip !== 'mais pedido') throw new Error('FAIL: Badge was not set by quick chip');

  console.log('\n--- 3. VERIFYING COMPLEMENTOS / ADICIONAIS DISPLAY ---');
  const groupCardsCount = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.drawer-content div')).filter(d => d.textContent.includes('adicionais disponíveis neste grupo'));
      return cards.length;
    })()
  `);
  console.log('Group containers with visible options found:', groupCardsCount);
  if (groupCardsCount === 0) throw new Error('FAIL: No expanded groups with visible options found');

  const optionPillsCount = await evaluate(`
    (() => {
      const pills = Array.from(document.querySelectorAll('.drawer-content span')).filter(s => s.textContent.includes('+ R$') || s.textContent.includes('Grátis'));
      return pills.length;
    })()
  `);
  console.log('Option pills with price badges found:', optionPillsCount);
  if (optionPillsCount === 0) throw new Error('FAIL: No option pills found');

  // Check button "Ver adicionais" / "Ocultar"
  const toggleBtnText = await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Ocultar') || b.textContent.includes('Ver adicionais'));
      return btns.map(b => b.textContent.trim());
    })()
  `);
  console.log('Toggle buttons found:', toggleBtnText);
  if (toggleBtnText.length === 0) throw new Error('FAIL: No toggle button found');

  // Click toggle to collapse
  await evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ocultar'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 200));

  const afterCollapseText = await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Ver adicionais'));
      return btns.map(b => b.textContent.trim());
    })()
  `);
  console.log('Toggle button after collapse:', afterCollapseText);
  if (afterCollapseText.length === 0) throw new Error('FAIL: Button did not change to "Ver adicionais"');

  // Check "Editar" button
  const editBtns = await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Editar'));
      return btns.length;
    })()
  `);
  console.log('Group edit buttons found:', editBtns);

  console.log('\n--- 4. VERIFYING PRICE INPUT MASKING & BLUR ---');
  const priceInputExists = await evaluate('!!document.getElementById("input-draft-price")');
  console.log('input-draft-price exists:', priceInputExists);
  if (!priceInputExists) throw new Error('FAIL: input-draft-price missing');

  // Test typing '35' then blur -> should become '35,00'
  const testFormat1 = await evaluate(`
    (() => {
      const inp = document.getElementById("input-draft-price");
      inp.value = "35";
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('blur', { bubbles: true }));
      return { val: inp.value, storeVal: window.__mepedeStore.draft.priceStr };
    })()
  `);
  console.log('Typing "35" ->', testFormat1);
  if (testFormat1.val !== '35,00') throw new Error(`FAIL: expected "35,00" but got "${testFormat1.val}"`);

  // Test typing '35,9' then blur -> should become '35,90'
  const testFormat2 = await evaluate(`
    (() => {
      const inp = document.getElementById("input-draft-price");
      inp.value = "35,9";
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('blur', { bubbles: true }));
      return { val: inp.value, storeVal: window.__mepedeStore.draft.priceStr };
    })()
  `);
  console.log('Typing "35,9" ->', testFormat2);
  if (testFormat2.val !== '35,90') throw new Error(`FAIL: expected "35,90" but got "${testFormat2.val}"`);

  // Test typing letters 'abc39,5' -> should sanitize to '39,50' on blur
  const testFormat3 = await evaluate(`
    (() => {
      const inp = document.getElementById("input-draft-price");
      inp.value = "abc39,5xyz";
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('blur', { bubbles: true }));
      return { val: inp.value, storeVal: window.__mepedeStore.draft.priceStr };
    })()
  `);
  console.log('Typing "abc39,5xyz" ->', testFormat3);
  if (testFormat3.val !== '39,50') throw new Error(`FAIL: expected "39,50" but got "${testFormat3.val}"`);

  console.log('\n--- 5. CAPTURING VERIFICATION SCREENSHOT ---');
  // Scroll drawer down to capture complementos groups
  await evaluate(`
    const scrollEl = document.querySelector('.drawer-content > div:nth-child(2)');
    if (scrollEl) scrollEl.scrollTop = 1400;
  `);
  await new Promise(r => setTimeout(r, 400));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('screenshot_audio_feedbacks.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to screenshot_audio_feedbacks.png');

  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
  process.exit(0);
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
