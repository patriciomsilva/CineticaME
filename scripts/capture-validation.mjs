import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const mode = process.argv[2] || 'before'; // 'before' or 'after'
const baseDir = path.resolve(`artifacts/validation/institutional-refinement/${mode}`);

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Simple static server for dist directory
function createStaticServer(distDir, port = 4321) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };

  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    
    let filePath = path.join(distDir, reqUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      resolve(server);
    });
    server.on('error', reject);
  });
}

async function scrollToBottomAndBack(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 40);
    });
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      });
    }));
  });
  await new Promise(r => setTimeout(r, 300));
}

async function run() {
  console.log(`🚀 Iniciando captura de evidências [MODO: ${mode.toUpperCase()}]...`);
  let server = null;
  let browser = null;

  try {
    server = await createStaticServer(path.resolve('dist'), 4321);
    console.log('✅ Servidor estático iniciado na porta 4321.');

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const viewports = [
      { name: 'mobile-360x800', width: 360, height: 800, isMobile: true, hasTouch: true },
      { name: 'tablet-768x1024', width: 768, height: 1024, isMobile: false, hasTouch: false },
      { name: 'desktop-1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false }
    ];

    // Discover all HTML files in dist
    function getHtmlRoutes(dir, prefix = '') {
      let routes = [];
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          routes = routes.concat(getHtmlRoutes(fullPath, `${prefix}/${file}`));
        } else if (file === 'index.html') {
          routes.push(prefix === '' ? '/' : prefix);
        }
      }
      return routes;
    }

    const routes = getHtmlRoutes(path.resolve('dist'));
    console.log(`📄 Rotas encontradas no build (${routes.length}):`, routes.join(', '));

    console.log('\n📸 Capturando páginas completas nos 3 viewports...');
    for (const r of routes) {
      const routeSlug = r === '/' ? 'home' : r.replace(/^\//, '').replace(/\//g, '-');
      for (const vp of viewports) {
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 2,
          isMobile: vp.isMobile,
          hasTouch: vp.hasTouch
        });

        const url = `http://localhost:4321${r}`;
        await page.goto(url, { waitUntil: 'networkidle0' });

        // Verificação de rolagem horizontal
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        console.log(`  - [${routeSlug}] ${vp.name}: ${hasHorizontalScroll ? '❌ SCROLL DETECTADO' : '✅ Sem scroll horizontal'}`);

        // Trigger lazy-loaded images
        await scrollToBottomAndBack(page);

        await page.screenshot({
          path: path.join(baseDir, `${routeSlug}-${vp.name}.png`),
          fullPage: true
        });
      }
    }

    // Captura especial: Mobile Menu Aberto (360x800)
    console.log('\n📱 Testando e capturando Menu Mobile (360x800)...');
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });

    const menuBtn = await page.$('#mobile-menu-button');
    if (menuBtn) {
      const ariaExpandedBefore = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);
      await menuBtn.click();
      await new Promise(r => setTimeout(r, 300));
      const ariaExpandedAfter = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);
      console.log(`  - Menu mobile aria-expanded: ${ariaExpandedBefore} -> ${ariaExpandedAfter}`);

      await page.screenshot({
        path: path.join(baseDir, 'home-mobile-menu-open-360x800.png')
      });

      // Test Escape key
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
      const ariaExpandedEsc = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);
      console.log(`  - Pós-Escape aria-expanded: ${ariaExpandedEsc} (${ariaExpandedEsc === 'false' ? '✅ Sucesso' : '❌ Falha'})`);
    }

    // Captura com Zoom 200%
    console.log('\n🔍 Testando visualização em alta escala (Zoom 200%)...');
    await page.setViewport({ width: 720, height: 450, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: path.join(baseDir, 'home-zoom-200pct.png')
    });

    console.log(`\n🎉 Capturas e validações [${mode.toUpperCase()}] salvas em: ${baseDir}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.close();
      console.log('🔒 Servidor estático na porta 4321 finalizado e porta liberada.');
    }
  }
}

run().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
