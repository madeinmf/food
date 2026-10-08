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

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/documentacao.html' });

  // Wait for network idle and rendering
  await new Promise(r => setTimeout(r, 2000));

  console.log('Printing to PDF...');
  const res = await send('Page.printToPDF', {
    printBackground: true,
    paperWidth: 8.27, // A4
    paperHeight: 11.69,
    marginTop: 0.4,
    marginBottom: 0.4,
    marginLeft: 0.4,
    marginRight: 0.4,
    preferCSSPageSize: true
  });

  const buffer = Buffer.from(res.data, 'base64');
  fs.writeFileSync('documentacao.pdf', buffer);
  console.log('PDF saved to documentacao.pdf, size:', buffer.length, 'bytes');

  // Also navigate back to http://localhost:3000/
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 1000));

  ws.close();
}

run().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
