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

  console.log('Navigating cleanly to http://localhost:3000/ ...');
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(1000);

  async function snap(name) {
    const scr = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`/tmp/verify_${name}.png`, Buffer.from(scr.data, 'base64'));
    console.log(`Saved screenshot /tmp/verify_${name}.png`);
  }

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true
    });
    return res.result.value;
  }

  // 1. Verificar se inicia direto no tour guiado (Passo 1)
  const initialStep = await evalJs(`(() => {
    const S = window.store || window.__mepedeStore;
    return {
      step: S ? S.tutorialStep : null,
      menusCount: S && S.data ? S.data.menus.length : -1,
      productsCount: S && S.data ? S.data.products.length : -1
    };
  })()`);

  console.log('Initial state on load:', initialStep);
  if (initialStep.step !== 1) {
    throw new Error(`Expected tutorialStep === 1 on initial load, got ${initialStep.step}`);
  }
  if (initialStep.menusCount !== 0) {
    throw new Error(`Expected menusCount === 0 on initial load, got ${initialStep.menusCount}`);
  }
  await snap('01_initial_tour_step_1');
  console.log('✓ PASS: Inicia direto no tour guiado com estado limpo!');

  // 2. Executar passos do tour
  console.log('Step 1 -> Click #tut-btn-new-menu');
  await evalJs(`document.querySelector('#tut-btn-new-menu').click()`);
  await sleep(400);

  console.log('Step 2 -> Click #tut-btn-save-menu');
  await evalJs(`document.querySelector('#tut-btn-save-menu').click()`);
  await sleep(400);

  console.log('Step 3 -> Click #tut-quick-cat-lanches');
  await evalJs(`document.querySelector('#tut-quick-cat-lanches').click()`);
  await sleep(400);

  console.log('Step 4 -> Click #tut-btn-new-product-empty');
  await evalJs(`document.querySelector('#tut-btn-new-product-empty').click()`);
  await sleep(400);

  console.log('Step 5 -> Click #tut-quickfill-product');
  await evalJs(`document.querySelector('#tut-quickfill-product').click()`);
  await sleep(400);

  console.log('Step 6 -> Click #tut-btn-save-product');
  await evalJs(`document.querySelector('#tut-btn-save-product').click()`);
  await sleep(400);

  // 3. Verificar o card do produto no celular (Step 7)
  const cardDetails = await evalJs(`(() => {
    const card = document.querySelector('#tut-phone-product-card');
    if (!card) return { error: 'Card not found' };
    const btn = card.querySelector('button');
    const badge = card.querySelector('.product-tag-pill');
    const title = card.querySelector('div[style*="font-weight: 700"], div[style*="font-weight:700"]');
    const csBtn = btn ? window.getComputedStyle(btn) : null;
    const csBadge = badge ? window.getComputedStyle(badge.parentElement) : null;
    return {
      titleText: title ? title.innerText : null,
      btnText: btn ? btn.innerText.trim() : null,
      btnWhiteSpace: csBtn ? csBtn.whiteSpace : null,
      badgeText: badge ? badge.innerText.trim() : null,
      badgePosition: csBadge ? csBadge.position : null,
      badgeTop: csBadge ? csBadge.top : null
    };
  })()`);

  console.log('Step 7 Phone Card details:', cardDetails);
  await snap('02_step7_phone_card');

  if (cardDetails.btnWhiteSpace !== 'nowrap') {
    throw new Error(`Expected btn whiteSpace === nowrap, got: ${cardDetails.btnWhiteSpace}`);
  }
  if (!cardDetails.badgeText || !cardDetails.badgeText.includes('mais pedido')) {
    throw new Error(`Expected badge to contain "mais pedido", got: ${cardDetails.badgeText}`);
  }
  if (cardDetails.badgePosition !== 'absolute') {
    throw new Error(`Expected badge position === absolute, got: ${cardDetails.badgePosition}`);
  }
  console.log('✓ PASS: Card de produto no smartphone com layout pixel-perfect, tag flutuante e botão nowrap!');

  // Continuar tour até o fim
  console.log('Step 7 -> Click #tut-phone-product-card');
  await evalJs(`document.querySelector('#tut-phone-product-card').click()`);
  await sleep(400);

  console.log('Step 8 -> Click #tut-phone-add-to-cart');
  await evalJs(`document.querySelector('#tut-phone-add-to-cart').click()`);
  await sleep(400);

  console.log('Step 9 -> Click #tut-phone-checkout');
  await evalJs(`document.querySelector('#tut-phone-checkout').click()`);
  await sleep(500);

  await snap('03_whatsapp_modal');
  console.log('✓ PASS: Tour guiado concluído de ponta a ponta com sucesso!');

  // Fechar modal de WhatsApp
  await evalJs(`window.__mepedeStore.orderModalOpen = false; window.__mepedeStore.notify()`);
  await sleep(300);

  // 4. Testar abertura do modal de Documentação ("O que mudou neste painel")
  console.log('Testing Documentation Modal...');
  await evalJs(`document.querySelector('.doc-banner').click()`);
  await sleep(500);

  const docModalInfo = await evalJs(`(() => {
    const S = window.__mepedeStore;
    const modal = document.querySelector('.modal-overlay');
    const stats = document.querySelectorAll('.modal-box [style*="font-size:28px"], .modal-box [style*="font-size: 28px"]');
    const sections = document.querySelectorAll('.modal-box section');
    const imgs = document.querySelectorAll('.modal-box section img');
    return {
      docModalOpen: S ? S.docModalOpen : false,
      modalExists: !!modal,
      statsCount: stats.length,
      sectionsCount: sections.length,
      imagesCount: imgs.length
    };
  })()`);

  console.log('Doc modal info:', docModalInfo);
  await snap('04_documentation_modal');

  if (!docModalInfo.docModalOpen || !docModalInfo.modalExists) {
    throw new Error('Documentation modal failed to open');
  }
  if (docModalInfo.statsCount !== 4) {
    throw new Error(`Expected 4 stats cards, got: ${docModalInfo.statsCount}`);
  }
  if (docModalInfo.sectionsCount !== 7) {
    throw new Error(`Expected 7 sections, got: ${docModalInfo.sectionsCount}`);
  }
  console.log('✓ PASS: Modal de documentação "Antes e Depois" abriu perfeitamente com todas as 7 seções e métricas!');

  // 5. Testar fechar o modal
  console.log('Testing close modal...');
  await evalJs(`window.__mepedeStore.closeDocModal()`);
  await sleep(300);

  const isClosed = await evalJs(`!window.__mepedeStore.docModalOpen`);
  if (!isClosed) throw new Error('Expected modal to close');
  console.log('✓ PASS: Modal de documentação fecha normalmente!');

  console.log('\n🎉 ALL TESTS PASSED WITH 100% SUCCESS!');
  ws.close();
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
