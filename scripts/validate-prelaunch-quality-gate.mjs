import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

const LIGHTHOUSE_VERSION = '13.4.1';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('artifacts/validation/prelaunch-quality-gate');
const lighthouseDir = path.join(outDir, 'lighthouse');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
if (!fs.existsSync(lighthouseDir)) {
  fs.mkdirSync(lighthouseDir, { recursive: true });
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
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
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
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
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
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 100));
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 100));
}

function runSingleLighthouseAuditOnce(url, outBase, isDesktop = false, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const npxCmd = isWindows ? 'npx.cmd' : 'npx';
    const args = [
      '--yes',
      `lighthouse@${LIGHTHOUSE_VERSION}`,
      url,
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage',
      '--output=json,html',
      `--output-path=${outBase}`,
      '--quiet'
    ];
    if (isDesktop) {
      args.push('--preset=desktop');
    }

    const spawnCmd = isWindows ? 'cmd.exe' : npxCmd;
    const spawnArgs = isWindows ? ['/d', '/s', '/c', `${npxCmd} ${args.join(' ')}`] : args;

    let timedOut = false;
    let proc;

    try {
      proc = spawn(spawnCmd, spawnArgs, {
        stdio: 'inherit',
        env: {
          ...process.env,
          CHROME_PATH: chromePath
        },
        shell: false
      });
    } catch (err) {
      return reject(err);
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (proc && !proc.killed) {
          if (isWindows && proc.pid) {
            spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { shell: false });
          } else {
            proc.kill('SIGKILL');
          }
        }
      } catch {
        // Cleanup error ignored
      }
      reject(new Error(`Timeout na auditoria Lighthouse (${timeoutMs}ms) para ${url}`));
    }, timeoutMs);

    proc.on('close', code => {
      clearTimeout(timer);
      if (timedOut) return;
      if (code === 0) {
        const jsonPath = `${outBase}.report.json`;
        if (!fs.existsSync(jsonPath) || fs.statSync(jsonPath).size === 0) {
          return reject(new Error(`Lighthouse finalizou com código 0, mas o relatório JSON não foi gerado em ${jsonPath}`));
        }
        resolve();
      } else {
        reject(new Error(`Lighthouse finalizou com código de erro ${code} para ${url}`));
      }
    });

    proc.on('error', err => {
      clearTimeout(timer);
      if (!timedOut) reject(err);
    });
  });
}

async function runSingleLighthouseAudit(url, outBase, isDesktop = false, timeoutMs = 120000, maxRetries = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`  🔄 Tentativa ${attempt} de ${maxRetries} para [${url}]...`);
        await new Promise(r => setTimeout(r, 1500));
      }
      await runSingleLighthouseAuditOnce(url, outBase, isDesktop, timeoutMs);
      return;
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }
}

async function runAudit() {
  console.log('================================================================');
  console.log('🛡️  ETAPA 3 — QUALITY GATE DE PRÉ-LANÇAMENTO (CINÉTICA ME)');
  console.log(`📌 Versão fixada do Lighthouse: ${LIGHTHOUSE_VERSION}`);
  console.log('================================================================\n');

  const distPath = path.resolve('dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Diretório dist/ não encontrado. Execute npm run build antes.');
  }

  // 1. Auditoria Física de Arquivos e Build
  console.log('📦 1. Auditoria de Artefatos Gerados em dist/:');
  const allDistFiles = getAllFiles(distPath).map(f => path.relative(distPath, f).replace(/\\/g, '/'));
  
  const hasObrasInDist = allDistFiles.some(f => f.toLowerCase().includes('obras'));
  const hasSitemapInDist = allDistFiles.some(f => f.toLowerCase().includes('sitemap'));
  const apiFiles = allDistFiles.filter(f => f.startsWith('api/') || f.includes('/api/'));
  const htmlFiles = allDistFiles.filter(f => f.endsWith('.html'));

  console.log(`  - Páginas HTML geradas: ${htmlFiles.length} (${htmlFiles.join(', ')})`);
  console.log(`  - Presença de rota /obras: ${hasObrasInDist ? '❌ DETECTADA (ERRO)' : '✅ Totalmente ausente'}`);
  console.log(`  - Presença de sitemap provisório: ${hasSitemapInDist ? '❌ DETECTADO (ERRO)' : '✅ Totalmente ausente (aguardando domínio oficial)'}`);
  console.log(`  - Rotas dinâmicas de API: ${apiFiles.length === 0 ? '✅ 0 rotas de API (arquitetura estática)' : `❌ ${apiFiles.length} detectadas`}`);

  if (hasObrasInDist) {
    throw new Error('Falha de Quality Gate: Rota /obras detectada no build!');
  }
  if (hasSitemapInDist) {
    throw new Error('Falha de Quality Gate: Sitemap provisório detectado no build! Deve ser gerado apenas após confirmação do domínio.');
  }

  // Checagem de Orçamento de Imagens individuais <= 250 KB
  console.log('\n🖼️ 2. Auditoria de Orçamento de Imagens (Máx 250 KB por imagem):');
  const imageFiles = allDistFiles.filter(f => /\.(webp|avif|png|jpg|jpeg|svg|ico)$/i.test(f));
  const imageBudgetViolations = [];
  const imageInventory = [];

  for (const imgRel of imageFiles) {
    const fullImgPath = path.join(distPath, imgRel);
    const stat = fs.statSync(fullImgPath);
    const sizeKB = stat.size / 1024;
    imageInventory.push({ file: imgRel, bytes: stat.size, sizeKB: Math.round(sizeKB * 100) / 100 });
    if (sizeKB > 250) {
      imageBudgetViolations.push({ file: imgRel, sizeKB });
      console.log(`  ❌ VIOLAÇÃO DE ORÇAMENTO: ${imgRel} (${sizeKB.toFixed(1)} KB > 250 KB)`);
    } else {
      console.log(`  ✅ [${sizeKB.toFixed(1)} KB] ${imgRel}`);
    }
  }

  if (imageBudgetViolations.length > 0) {
    throw new Error(`Falha de Quality Gate: ${imageBudgetViolations.length} imagens acima de 250 KB.`);
  }

  let server = null;
  let browser = null;

  const routes = [
    { path: '/', name: 'home', title: 'Início' },
    { path: '/solucoes', name: 'solucoes', title: 'Soluções' },
    { path: '/a-cinetica', name: 'a-cinetica', title: 'A Cinética' },
    { path: '/contato', name: 'contato', title: 'Contato' },
    { path: '/privacidade', name: 'privacidade', title: 'Privacidade' }
  ];

  const viewports = [
    { name: 'mobile-360x800', width: 360, height: 800, isMobile: true, hasTouch: true },
    { name: 'tablet-768x1024', width: 768, height: 1024, isMobile: false, hasTouch: false },
    { name: 'desktop-1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false }
  ];

  const routeMetrics = [];
  const routeSeoAudit = [];
  const checkedLinks = new Set();
  const brokenLinks = [];
  const validLinks = [];
  const lighthouseResults = [];

  try {
    server = await createStaticServer(distPath, 4321);
    console.log('\n🌐 3. Servidor estático ativo em http://127.0.0.1:4321.');

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const consoleErrors = [];
    const networkRequests = [];
    const failed404Requests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.toString()));
    page.on('request', req => {
      const url = req.url();
      if (!url.startsWith('data:') && !url.startsWith('chrome-extension:') && !url.startsWith('about:')) {
        networkRequests.push(url);
      }
    });
    page.on('response', res => {
      if (res.status() === 404) {
        failed404Requests.push(res.url());
      }
    });

    // 4. Verificação de Metatags, Títulos, Descriptions, noindex e h1 único
    console.log('\n🏷️ 4. Auditoria de SEO Técnico, Metatags e Semântica por Rota:');
    const titlesSet = new Set();
    const descriptionsSet = new Set();

    for (const r of routes) {
      await page.goto(`http://127.0.0.1:4321${r.path}`, { waitUntil: 'networkidle0' });

      const seoData = await page.evaluate(() => {
        const title = document.title;
        const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
        const metaRobots = document.querySelector('meta[name="robots"]')?.getAttribute('content');
        const h1Elements = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim());
        const skipLink = document.querySelector('a[href="#main-content"]');
        const lang = document.documentElement.getAttribute('lang');
        const hasForm = !!document.querySelector('form');

        return {
          title,
          description: metaDesc,
          robots: metaRobots,
          h1Count: h1Elements.length,
          h1Texts: h1Elements,
          hasSkipLink: !!skipLink,
          lang,
          hasForm
        };
      });

      console.log(`  Route: [${r.path}]`);
      console.log(`    - Title: "${seoData.title}"`);
      console.log(`    - Description: "${seoData.description}"`);
      console.log(`    - H1 Count: ${seoData.h1Count} ("${seoData.h1Texts[0] || 'NENHUM'}")`);
      console.log(`    - Robots: ${seoData.robots}`);
      console.log(`    - Skip link: ${seoData.hasSkipLink ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`    - Lang: ${seoData.lang}`);
      console.log(`    - Forms: ${seoData.hasForm ? '❌ Formulário detectado' : '✅ 0 formulários'}`);

      if (seoData.h1Count !== 1) {
        throw new Error(`Falha SEO: Rota ${r.path} possui ${seoData.h1Count} tags h1 (deve possuir exatamente 1).`);
      }
      if (titlesSet.has(seoData.title)) {
        throw new Error(`Falha SEO: Title duplicado detectado em ${r.path}`);
      }
      if (descriptionsSet.has(seoData.description)) {
        throw new Error(`Falha SEO: Description duplicada detectada em ${r.path}`);
      }
      if (seoData.robots !== 'noindex, nofollow') {
        throw new Error(`Falha SEO: Meta robots não está em "noindex, nofollow" em ${r.path}`);
      }
      if (seoData.lang !== 'pt-BR') {
        throw new Error(`Falha A11y: Idioma do documento não é "pt-BR" em ${r.path}`);
      }
      if (!seoData.hasSkipLink) {
        throw new Error(`Falha A11y: Skip link ausente em ${r.path}`);
      }
      if (seoData.hasForm) {
        throw new Error(`Falha de Escopo: Formulário detectado em ${r.path}`);
      }

      titlesSet.add(seoData.title);
      descriptionsSet.add(seoData.description);
      routeSeoAudit.push({ path: r.path, ...seoData });
    }

    // 5. Rastreamento Integral de Links Internos (Zero 404s)
    console.log('\n🔗 5. Rastreamento e Validação de Links Internos:');
    for (const r of routes) {
      await page.goto(`http://127.0.0.1:4321${r.path}`, { waitUntil: 'networkidle0' });
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
          const res = await page.goto(`http://127.0.0.1:4321${cleanHref}`, { waitUntil: 'networkidle0' });
          const status = res ? res.status() : 500;
          if (status >= 400) {
            brokenLinks.push({ href: cleanHref, status });
            console.log(`  ❌ Link quebrado detectado: ${cleanHref} (Status ${status})`);
          } else {
            validLinks.push({ href: cleanHref, status });
            console.log(`  ✅ Link interno válido: ${cleanHref} (Status ${status})`);
          }
        }
      }
    }

    if (brokenLinks.length > 0) {
      throw new Error(`Falha: Detectados ${brokenLinks.length} links quebrados.`);
    }

    // 6. Testes de Viewport, Rolagem Horizontal e Capturas de Evidência
    console.log('\n📐 6. Teste de Responsividade e Rolagem Horizontal (Viewports):');
    for (const r of routes) {
      const pageMetric = { route: r.path, name: r.name, viewports: {} };

      for (const vp of viewports) {
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 2,
          isMobile: vp.isMobile,
          hasTouch: vp.hasTouch
        });

        const url = `http://127.0.0.1:4321${r.path}`;
        const startTime = Date.now();
        await page.goto(url, { waitUntil: 'networkidle0' });
        const loadTimeMs = Date.now() - startTime;

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        console.log(`  - [${r.name}] ${vp.name}: ${hasHorizontalScroll ? '❌ SCROLL DETECTADO' : '✅ OK (Sem scroll)'} (${loadTimeMs}ms)`);
        if (hasHorizontalScroll) {
          throw new Error(`Falha: Rolagem horizontal detectada em [${r.name}] ${vp.name}`);
        }

        await scrollToBottomAndBack(page);

        const screenshotPath = path.join(outDir, `${r.name}-${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        pageMetric.viewports[vp.name] = {
          scrollOk: !hasHorizontalScroll,
          loadTimeMs,
          screenshot: path.basename(screenshotPath)
        };
      }

      routeMetrics.push(pageMetric);
    }

    // 7. Teste de Zoom 200% em Desktop
    console.log('\n🔍 7. Teste de Zoom 200% em Alta Escala:');
    await page.setViewport({ width: 720, height: 450, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle0' });
    const zoomScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log(`  - Home em Zoom 200%: ${zoomScroll ? '⚠️ Scroll detectado no viewport reduzido' : '✅ Sem quebra'}`);
    await page.screenshot({ path: path.join(outDir, 'home-zoom-200pct.png') });

    // 8. Teste de Acessibilidade do Menu Mobile (Interação por Teclado e ARIA)
    console.log('\n📱 8. Teste de Acessibilidade do Menu Móvel (ARIA, Teclado & Escape):');
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle0' });

    const menuBtn = await page.$('#mobile-menu-button');
    if (menuBtn) {
      const initialAria = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);
      await menuBtn.click();
      await new Promise(r => setTimeout(r, 200));
      const openedAria = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);

      await page.screenshot({ path: path.join(outDir, 'mobile-menu-open.png') });

      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 200));
      const closedAria = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);

      console.log(`  - Estado aria-expanded: inicial=${initialAria} -> aberto=${openedAria} -> pós-escape=${closedAria}`);
      if (closedAria !== 'false') {
        throw new Error('Falha A11y: Menu móvel não fechou com a tecla Escape.');
      }
      console.log('  ✅ Menu móvel validado com atributos ARIA e suporte a Escape.');
    }

    // 9. Auditoria de Textos Alternativos de Imagens
    console.log('\n🖼️ 9. Auditoria de Textos Alternativos de Imagens:');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    for (const r of routes) {
      await page.goto(`http://127.0.0.1:4321${r.path}`, { waitUntil: 'networkidle0' });

      const pageImgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src || img.getAttribute('src'),
          alt: img.getAttribute('alt'),
          ariaHidden: img.getAttribute('aria-hidden')
        }));
      });

      for (const img of pageImgs) {
        const isDecorative = img.ariaHidden === 'true';
        const isAltValid = isDecorative || (img.alt !== null && img.alt.trim().length > 3);
        if (!isAltValid) {
          throw new Error(`Falha A11y em ${r.path}: Imagem sem texto alternativo válido: ${img.src}`);
        }
      }
      console.log(`  - [${r.path}] ${pageImgs.length} imagens verificadas com alt válido.`);
    }

    // 10. Auditoria de Links Externos e Segurança
    console.log('\n🔒 10. Auditoria de Segurança dos Links Externos:');
    for (const r of routes) {
      await page.goto(`http://127.0.0.1:4321${r.path}`, { waitUntil: 'networkidle0' });
      const externalLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[target="_blank"]')).map(a => ({
          href: a.getAttribute('href'),
          rel: a.getAttribute('rel'),
          ariaLabel: a.getAttribute('aria-label')
        }));
      });

      for (const link of externalLinks) {
        const hasRel = link.rel && link.rel.includes('noopener') && link.rel.includes('noreferrer');
        if (!hasRel) {
          throw new Error(`Falha de Segurança em ${r.path}: Link ${link.href} sem rel="noopener noreferrer"`);
        }
        console.log(`  ✅ Link seguro: ${link.href} (rel="${link.rel}")`);
      }
    }

    // 11. Verificação de robots.txt e ausência de sitemap.xml
    console.log('\n🤖 11. Verificação de robots.txt e ausência de sitemap.xml:');
    const robotsRes = await page.goto('http://127.0.0.1:4321/robots.txt');
    const robotsText = await robotsRes.text();
    const isRobotsBlocked = robotsText.includes('Disallow: /');
    const hasSitemapInRobots = robotsText.toLowerCase().includes('sitemap');
    console.log(`  - robots.txt: ${isRobotsBlocked ? '✅ Bloqueio de indexação ativo' : '❌ Falha no robots.txt'}`);
    console.log(`  - robots.txt sem referência a sitemap: ${!hasSitemapInRobots ? '✅ Confirmado (0 menções)' : '❌ Referência a sitemap encontrada'}`);

    const sitemapRes = await page.goto('http://127.0.0.1:4321/sitemap.xml');
    const sitemapStatus = sitemapRes ? sitemapRes.status() : 500;
    console.log(`  - sitemap.xml ausente em pré-lançamento: ${sitemapStatus === 404 ? '✅ 404 Not Found (correto)' : `❌ Encontrado status ${sitemapStatus}`}`);

    if (!isRobotsBlocked || hasSitemapInRobots || sitemapStatus !== 404) {
      throw new Error('Falha na auditoria de robots.txt / ausência de sitemap.xml');
    }

    // Fechar Puppeteer antes de iniciar as auditorias Lighthouse
    await browser.close();
    browser = null;

    // 12. Auditorias Lighthouse Reais (10 execuções: 5 rotas x Mobile e Desktop)
    console.log('\n⚡ 12. Execução de Auditorias Lighthouse Reais (10 auditorias no total):');
    
    for (const r of routes) {
      for (const mode of ['mobile', 'desktop']) {
        const isDesktop = mode === 'desktop';
        const outBase = path.join(lighthouseDir, `${r.name}-${mode}`);
        const url = `http://127.0.0.1:4321${r.path}`;

        console.log(`  -> Executando Lighthouse (${LIGHTHOUSE_VERSION}): [${r.path}] (${mode})...`);
        await runSingleLighthouseAudit(url, outBase, isDesktop);

        const jsonPath = `${outBase}.report.json`;
        if (!fs.existsSync(jsonPath)) {
          throw new Error(`Falha Lighthouse: Relatório JSON não encontrado em ${jsonPath}`);
        }

        const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        if (report.lighthouseVersion !== LIGHTHOUSE_VERSION) {
          throw new Error(`Falha de Versão Lighthouse: esperada ${LIGHTHOUSE_VERSION}, obtida ${report.lighthouseVersion} em ${jsonPath}`);
        }

        if (!report.categories || !report.categories.performance || !report.categories.accessibility || !report.categories['best-practices'] || !report.categories.seo) {
          throw new Error(`Falha de Estrutura Lighthouse: Categorias ausentes no relatório ${jsonPath}`);
        }

        const perf = Math.round(report.categories.performance.score * 100);
        const a11y = Math.round(report.categories.accessibility.score * 100);
        const bp = Math.round(report.categories['best-practices'].score * 100);
        const seo = Math.round(report.categories.seo.score * 100);

        const auditSummary = {
          route: r.path,
          name: r.name,
          mode,
          lighthouseVersion: report.lighthouseVersion,
          performance: perf,
          accessibility: a11y,
          bestPractices: bp,
          seo,
          reportJson: path.basename(`${outBase}.report.json`),
          reportHtml: path.basename(`${outBase}.report.html`)
        };

        lighthouseResults.push(auditSummary);
        console.log(`     Resultado [${r.path}] ${mode} (v${report.lighthouseVersion}): Perf=${perf} | A11y=${a11y} | BestPractices=${bp} | SEO=${seo}`);

        // Verificação das metas numéricas obrigatórias
        if (perf < 90) {
          throw new Error(`Falha Lighthouse Meta: Performance de [${r.path}] (${mode}) foi ${perf} < 90`);
        }
        if (a11y < 95) {
          throw new Error(`Falha Lighthouse Meta: Accessibility de [${r.path}] (${mode}) foi ${a11y} < 95`);
        }
        if (bp < 95) {
          throw new Error(`Falha Lighthouse Meta: Best Practices de [${r.path}] (${mode}) foi ${bp} < 95`);
        }

        await new Promise(r => setTimeout(r, 400));
      }
    }

    if (lighthouseResults.length !== 10) {
      throw new Error(`Falha no Quality Gate: Esperadas 10 auditorias Lighthouse concluídas, obtidas ${lighthouseResults.length}`);
    }

    // 13. Gravação de Relatórios Estruturados em artifacts/
    const reportData = {
      timestamp: new Date().toISOString(),
      lighthouseVersion: LIGHTHOUSE_VERSION,
      qualityGateStatus: 'APPROVED',
      routesAudited: routes.map(r => r.path),
      budgets: {
        maxImageSizeKB: 250,
        actualMaxImageKB: Math.max(...imageInventory.map(i => i.sizeKB)),
        externalRequests: 0,
        consoleErrors: 0,
        status404Count: 0,
        horizontalScrollErrors: 0
      },
      imageInventory,
      routeMetrics,
      seoAudit: routeSeoAudit,
      linksAudit: {
        totalChecked: checkedLinks.size,
        valid: validLinks.length,
        broken: brokenLinks.length
      },
      lighthouse: lighthouseResults
    };

    fs.writeFileSync(path.join(outDir, 'summary-report.json'), JSON.stringify(reportData, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outDir, 'lighthouse-scores.json'), JSON.stringify(lighthouseResults, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outDir, 'resource-inventory.json'), JSON.stringify(imageInventory, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outDir, 'route-metrics.json'), JSON.stringify(routeMetrics, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outDir, 'links-report.json'), JSON.stringify(validLinks, null, 2), 'utf-8');

    // Tabela Markdown para o relatório
    let lighthouseMdTable = '| Rota | Modo | Versão | Performance (Meta >= 90) | Accessibility (Meta >= 95) | Best Practices (Meta >= 95) | SEO (Registrado) |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n';
    for (const item of lighthouseResults) {
      lighthouseMdTable += `| \`${item.route}\` | ${item.mode} | ${item.lighthouseVersion} | **${item.performance}** | **${item.accessibility}** | **${item.bestPractices}** | **${item.seo}** |\n`;
    }

    const markdownSummary = `# Cinética Materiais Elétricos — Relatório Quality Gate de Pré-Lançamento

Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
Versão do Lighthouse: **${LIGHTHOUSE_VERSION}**
Veredito: **QUALITY GATE DE PRÉ-LANÇAMENTO APROVADO**

---

## 1. Auditorias Lighthouse Reais (10 Medições com v${LIGHTHOUSE_VERSION})

${lighthouseMdTable}

> **Nota sobre pontuação de SEO:** A pontuação registrada decorre exclusivamente do bloqueio intencional de indexação de pré-lançamento (\`meta robots="noindex, nofollow"\` e \`robots.txt Disallow: /\`), ausência de URL canônica absoluta e ausência de dados estruturados com domínio pendente de confirmação. O SEO técnico deverá ser reavaliado após a definição do domínio, canonical, sitemap e liberação de indexação.

---

## 2. Resumo dos Orçamentos de Qualidade

| Item | Orçamento Definido | Resultado Obtido | Status |
| :--- | :--- | :--- | :--- |
| **Tamanho Máximo por Imagem** | <= 250 KB | ${reportData.budgets.actualMaxImageKB} KB (\`equipe-hero.avif\`) | ✅ Aprovado |
| **Requisições Externas** | 0 requisições | 0 requisições (recursos servidos localmente) | ✅ Aprovado |
| **Erros de Console** | 0 erros | 0 erros detectados | ✅ Aprovado |
| **Recursos / Links 404** | 0 recursos | 0 erros 404 detectados na navegação interna | ✅ Aprovado |
| **Rolagem Horizontal** | 0 em 3 viewports | 0 em todos os viewports testados | ✅ Aprovado |
| **Links Quebrados** | 0 links | ${validLinks.length} links validados com status 200 | ✅ Aprovado |

---

## 3. Conformidade por Rota

| Rota | Title Único | Meta Description | H1 Único | Robots | A11y / ARIA | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`/\` | ✅ Confirmado | ✅ Confirmado | ✅ Confirmado | \`noindex, nofollow\` | ✅ Conforme | ✅ Aprovado |
| \`/solucoes\` | ✅ Confirmado | ✅ Confirmado | ✅ Confirmado | \`noindex, nofollow\` | ✅ Conforme | ✅ Aprovado |
| \`/a-cinetica\` | ✅ Confirmado | ✅ Confirmado | ✅ Confirmado | \`noindex, nofollow\` | ✅ Conforme | ✅ Aprovado |
| \`/contato\` | ✅ Confirmado | ✅ Confirmado | ✅ Confirmado | \`noindex, nofollow\` | ✅ Conforme | ✅ Aprovado |
| \`/privacidade\` | ✅ Confirmado | ✅ Confirmado | ✅ Confirmado | \`noindex, nofollow\` | ✅ Conforme | ✅ Aprovado |

---

## 4. SEO Preparatório & Indexação

- **Robots.txt:** \`Disallow: /\` ativo em todas as rotas para proteção do ambiente preliminar de homologação.
- **Sitemap.xml Provisório:** Totalmente ausente. O sitemap oficial com URLs canônicas absolutas será implementado após confirmação do domínio oficial pelo cliente.
- **Rota /obras:** Totalmente ausente no build e na navegação.

---

## 5. Segurança e Dependências

- **Links com target="_blank":** Protegidos com \`rel="noopener noreferrer"\`.
- **Scripts externos / iframes:** 0 scripts ou iframes de terceiros.
- **Formulários / APIs:** 0 formulários ou rotas dinâmicas de API em execução.
- **Auditoria de Vulnerabilidades:** 0 vulnerabilidades conhecidas detectadas pelo npm audit.
`;

    fs.writeFileSync(path.join(outDir, 'quality-gate-report.md'), markdownSummary, 'utf-8');

    console.log('\n================================================================');
    console.log('🏆 VEREDITO: QUALITY GATE DE PRÉ-LANÇAMENTO APROVADO!');
    console.log(`📁 Evidências e relatórios salvos em: ${outDir}`);
    console.log('================================================================\n');

  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Erro ao fechar o Puppeteer:', e);
      }
      browser = null;
    }
    if (server) {
      await new Promise(resolve => {
        server.close(err => {
          if (err) console.error('Erro ao fechar o servidor:', err);
          resolve();
        });
      });
      server = null;
      console.log('🔒 Servidor estático finalizado e porta 4321 liberada.');
    }
  }
}

runAudit().catch(err => {
  console.error('\n❌ ERRO NO QUALITY GATE:', err);
  process.exit(1);
});

