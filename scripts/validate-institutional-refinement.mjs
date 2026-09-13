import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const afterDir = path.resolve('artifacts/validation/institutional-refinement/after');

if (!fs.existsSync(afterDir)) {
  fs.mkdirSync(afterDir, { recursive: true });
}

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
    '.xml': 'application/xml; charset=utf-8',
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

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
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
  console.log('================================================================');
  console.log('🧪 VALIDAÇÃO TÉCNICA E VISUAL — REFINAMENTO INSTITUCIONAL');
  console.log('================================================================\n');

  const distPath = path.resolve('dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Diretório dist/ não encontrado. Execute npm run build antes.');
  }

  // 1. Verificações Estruturais no Build
  console.log('📁 1. Verificação de Arquitetura e Rotas em dist/:');
  const allDistFiles = getAllFiles(distPath).map(f => path.relative(distPath, f).replace(/\\/g, '/'));
  
  const hasObrasInDist = allDistFiles.some(f => f.toLowerCase().includes('obras'));
  console.log(`  - Presença de rota /obras em dist/: ${hasObrasInDist ? '❌ DETECTADA (ERRO)' : '✅ TOTALMENTE AUSENTE (Correto)'}`);
  if (hasObrasInDist) {
    throw new Error('Falha: Rota /obras ainda presente no build!');
  }

  const apiFiles = allDistFiles.filter(f => f.startsWith('api/') || f.includes('/api/'));
  console.log(`  - Rotas de API em dist/: ${apiFiles.length === 0 ? '✅ 0 rotas de API (100% Estático)' : `❌ ${apiFiles.length} detectadas`}`);

  // Checagem de formulários e noindex em todos os HTMLs
  const htmlFiles = allDistFiles.filter(f => f.endsWith('.html'));
  console.log(`  - Páginas HTML geradas: ${htmlFiles.length} (${htmlFiles.join(', ')})`);

  let formCount = 0;
  let missingNoindex = 0;

  for (const hf of htmlFiles) {
    const content = fs.readFileSync(path.join(distPath, hf), 'utf-8');
    if (/<form[\s>]/i.test(content)) {
      formCount++;
      console.log(`    ❌ Formulário encontrado em ${hf}`);
    }
    if (!/<meta[^>]*name=["']robots["'][^>]*content=["']noindex,\s*nofollow["']/i.test(content)) {
      missingNoindex++;
      console.log(`    ❌ Meta noindex ausente em ${hf}`);
    }
  }

  console.log(`  - Total de formulários no site: ${formCount === 0 ? '✅ 0 formulários' : `❌ ${formCount} formulários encontrados`}`);
  console.log(`  - Bloqueio noindex em todas as páginas: ${missingNoindex === 0 ? '✅ 100% protegido com noindex, nofollow' : `❌ ${missingNoindex} páginas sem tag`}`);

  let server = null;
  let browser = null;

  try {
    // 2. Iniciar servidor estático
    server = await createStaticServer(distPath, 4321);
    console.log('\n🌐 2. Servidor local estático ativo na porta 4321.');

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const consoleErrors = [];
    const networkRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.toString()));
    page.on('request', req => networkRequests.push(req.url()));

    const routes = [
      { path: '/', name: 'home' },
      { path: '/solucoes', name: 'solucoes' },
      { path: '/a-cinetica', name: 'a-cinetica' },
      { path: '/contato', name: 'contato' },
      { path: '/privacidade', name: 'privacidade' }
    ];

    const viewports = [
      { name: 'mobile-360x800', width: 360, height: 800, isMobile: true, hasTouch: true },
      { name: 'tablet-768x1024', width: 768, height: 1024, isMobile: false, hasTouch: false },
      { name: 'desktop-1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false }
    ];

    // 3. Rastreamento e Validação de Links Internos
    console.log('\n🔗 3. Rastreamento de Links Internos (Zero 404s):');
    const checkedLinks = new Set();
    const brokenLinks = [];

    for (const r of routes) {
      await page.goto(`http://localhost:4321${r.path}`, { waitUntil: 'networkidle0' });
      const hrefs = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map(a => a.getAttribute('href'));
      });

      for (const href of hrefs) {
        if (!href) continue;
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
          continue;
        }
        const cleanHref = href.split('#')[0] || '/';
        if (!checkedLinks.has(cleanHref)) {
          checkedLinks.add(cleanHref);
          const res = await page.goto(`http://localhost:4321${cleanHref}`, { waitUntil: 'networkidle0' });
          const status = res ? res.status() : 500;
          if (status >= 400) {
            brokenLinks.push({ href: cleanHref, status });
            console.log(`  ❌ Link quebrado detectado: ${cleanHref} (Status ${status})`);
          } else {
            console.log(`  ✅ Link interno válido: ${cleanHref} (Status ${status})`);
          }
        }
      }
    }

    if (brokenLinks.length > 0) {
      throw new Error(`Falha: Detectados ${brokenLinks.length} links internos quebrados.`);
    }

    // 4. Testes de Responsividade, Rolagem e Capturas "AFTER"
    console.log('\n📸 4. Captura de Evidências AFTER e Verificação de Rolagem:');
    for (const r of routes) {
      for (const vp of viewports) {
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 2,
          isMobile: vp.isMobile,
          hasTouch: vp.hasTouch
        });

        const url = `http://localhost:4321${r.path}`;
        await page.goto(url, { waitUntil: 'networkidle0' });

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        console.log(`  - [${r.name}] ${vp.name}: ${hasHorizontalScroll ? '❌ SCROLL DETECTADO' : '✅ Sem scroll horizontal'}`);
        if (hasHorizontalScroll) {
          throw new Error(`Falha: Scroll horizontal detectado em [${r.name}] ${vp.name}`);
        }

        // Trigger lazy loading of images across the whole page
        await scrollToBottomAndBack(page);

        await page.screenshot({
          path: path.join(afterDir, `${r.name}-${vp.name}.png`),
          fullPage: true
        });
      }
    }

    // 5. Verificação de Imagens e Acessibilidade (Alt texts, Natural Width)
    console.log('\n🖼️ 5. Verificação de Imagens e Atributos de Acessibilidade:');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });
    await scrollToBottomAndBack(page);

    const imageAudit = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        alt: img.getAttribute('alt'),
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }));
    });

    let imgErrors = 0;
    for (const img of imageAudit) {
      const isOk = img.complete && img.naturalWidth > 0 && img.alt && img.alt.trim().length > 3;
      if (!isOk) {
        imgErrors++;
        console.log(`  ❌ Problema na imagem: ${img.src} | alt: "${img.alt}" | w: ${img.naturalWidth}`);
      } else {
        console.log(`  ✅ Imagem válida: ${path.basename(img.src)} | alt: "${img.alt.substring(0, 45)}..." (${img.naturalWidth}x${img.naturalHeight}px)`);
      }
    }

    if (imgErrors > 0) {
      throw new Error(`Falha: Detectados ${imgErrors} problemas em imagens.`);
    }

    // 6. Teste de Acessibilidade do Menu Mobile (360x800)
    console.log('\n📱 6. Teste de Acessibilidade do Menu Mobile (Teclado / ARIA / Escape):');
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });

    const menuBtn = await page.$('#mobile-menu-button');
    if (menuBtn) {
      const initialAria = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);
      await menuBtn.click();
      await new Promise(r => setTimeout(r, 300));
      const openedAria = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);
      
      await page.screenshot({
        path: path.join(afterDir, 'home-mobile-menu-open-360x800.png')
      });

      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
      const closedAria = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);

      console.log(`  - aria-expanded: inicial=${initialAria} -> aberto=${openedAria} -> pós-escape=${closedAria}`);
      console.log(`  - Comportamento de Escape: ${closedAria === 'false' ? '✅ Aprovado (Menu fechou)' : '❌ Reprovado'}`);
      if (closedAria !== 'false') {
        throw new Error('Falha: Tecla Escape não fechou o menu móvel.');
      }
    }

    // 7. Teste de Zoom 200%
    console.log('\n🔍 7. Teste de Zoom em Alta Escala (200%):');
    await page.setViewport({ width: 720, height: 450, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: path.join(afterDir, 'home-zoom-200pct.png')
    });
    console.log('  ✅ Captura de 200% salva.');

    // 8. Verificação de robots.txt
    console.log('\n🤖 8. Verificação do robots.txt:');
    const robotsRes = await page.goto('http://localhost:4321/robots.txt');
    const robotsText = await robotsRes.text();
    console.log('--- robots.txt content ---\n' + robotsText.trim() + '\n-------------------------');

    // 9. Verificação de Erros de Console e Requisições Externas
    const externalRequests = networkRequests.filter(url => !url.startsWith('http://localhost:4321'));
    console.log(`\n🌐 9. Requisições Externas (${externalRequests.length}):`, externalRequests.length === 0 ? '✅ Nenhuma (100% Local)' : `⚠️ ${externalRequests.join(', ')}`);
    console.log(`⚠️ 10. Erros de Console:`, consoleErrors.length === 0 ? '✅ Nenhum erro de console' : `❌ ${consoleErrors.join(' | ')}`);

    if (consoleErrors.length > 0) {
      throw new Error(`Falha: Erros de console detectados: ${consoleErrors.join(', ')}`);
    }

    console.log('\n🎉 Validação e captura de evidências concluída com SUCESSO TOTAL!');
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.close();
      console.log('🔒 Servidor estático na porta 4321 finalizado e porta liberada com sucesso.');
    }
  }
}

run().catch(err => {
  console.error('❌ Erro fatal na validação:', err);
  process.exit(1);
});
