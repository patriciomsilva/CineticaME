import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('artifacts/validation/premium-polish/after');
const viewportsDir = path.resolve('artifacts/validation/premium-polish/viewports');
const sectionsDir = path.resolve('artifacts/validation/premium-polish/sections');

[outDir, viewportsDir, sectionsDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function createStaticServer(distDir, port = 0) {
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
    '.txt': 'text/plain; charset=utf-8'
  };

  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    let filePath = path.join(distDir, reqUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

async function run() {
  console.log('================================================================');
  console.log('📐 VALIDAÇÃO FINAL E CAPTURA DE EVIDÊNCIAS DETERMINÍSTICAS');
  console.log('================================================================\n');

  const dist = path.resolve('dist');
  if (!fs.existsSync(dist)) {
    throw new Error('Diretório dist/ não encontrado. Execute npm run build antes.');
  }

  let server = null;
  let browser = null;
  const validationErrors = [];
  const matrixResults = [];

  try {
    server = await createStaticServer(dist, 0);
    const assignedPort = server.address().port;
    const baseUrl = `http://127.0.0.1:${assignedPort}`;
    console.log(`🌐 Servidor estático ativo em ${baseUrl}`);

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--force-color-profile=srgb',
        '--disable-features=IsolateOrigins,site-per-process,CalculateNativeWinOcclusion'
      ]
    });

    const page = await browser.newPage();

    // Reduzir animações durante capturas determinísticas
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        consoleErrors.push(text);
        console.error(`  ❌ [Console Error]: ${text}`);
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.toString());
      console.error(`  ❌ [Page Error]: ${err.toString()}`);
    });

    const routes = [
      { path: '/', slug: 'home', name: 'Home' },
      { path: '/solucoes', slug: 'solucoes', name: 'Soluções' },
      { path: '/a-cinetica', slug: 'a-cinetica', name: 'A Cinética' },
      { path: '/contato', slug: 'contato', name: 'Contato' }
    ];

    const requiredViewports = [
      { name: '320x568', width: 320, height: 568, isMobile: true, hasTouch: true },
      { name: '360x800', width: 360, height: 800, isMobile: true, hasTouch: true },
      { name: '390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
      { name: '768x1024', width: 768, height: 1024, isMobile: false, hasTouch: false },
      { name: '1024x768', width: 1024, height: 768, isMobile: false, hasTouch: false },
      { name: '1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false },
      { name: '1920x1080', width: 1920, height: 1080, isMobile: false, hasTouch: false }
    ];

    console.log('\n📊 Validando 4 rotas nos 7 viewports (28 combinações totais)...');

    async function preparePageForScreenshots(p) {
      await p.evaluate(async () => {
        await document.fonts.ready;
        const imgs = document.querySelectorAll('img');
        for (const img of imgs) {
          img.removeAttribute('loading');
          img.loading = 'eager';
          img.decoding = 'sync';
        }
        await Promise.all(
          Array.from(imgs).map(img => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return img.decode().catch(() => {});
          })
        );
      });
      await new Promise(r => setTimeout(r, 150));
    }

    for (const r of routes) {
      console.log(`\n🔹 Rota: ${r.name} (${r.path})`);

      for (const vp of requiredViewports) {
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          isMobile: vp.isMobile,
          hasTouch: vp.hasTouch
        });

        const url = `${baseUrl}${r.path}`;
        await page.goto(url, { waitUntil: 'networkidle0' });
        await preparePageForScreenshots(page);

        // Rolagem completa e acionamento de carregamento de todas as imagens lazy
        await page.evaluate(async () => {
          const totalHeight = document.body.scrollHeight;
          const step = 400;
          for (let top = 0; top <= totalHeight; top += step) {
            window.scrollTo(0, top);
            await new Promise(res => setTimeout(res, 50));
          }
          // Garantir que imagens terminaram o carregamento
          await Promise.all(
            Array.from(document.images).map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(resolve => {
                img.onload = img.onerror = resolve;
              });
            })
          );
          window.scrollTo(0, 0);
        });
        await new Promise(r => setTimeout(r, 100));

        // 1. scrollWidth <= clientWidth
        const scrollCheck = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const hasScroll = scrollWidth > clientWidth;

          // Encontrar elementos que excedem o viewport
          const overflowingElements = [];
          const allEls = document.querySelectorAll('*');
          for (const el of allEls) {
            const rect = el.getBoundingClientRect();
            if (rect.right > clientWidth + 1) {
              const tag = el.tagName.toLowerCase();
              const cls = el.className ? `.${el.className.split(' ').join('.')}` : '';
              const id = el.id ? `#${el.id}` : '';
              overflowingElements.push(`${tag}${id}${cls} (right: ${rect.right.toFixed(1)}px > ${clientWidth}px)`);
            }
          }

          return {
            hasScroll,
            scrollWidth,
            clientWidth,
            overflowingElements: overflowingElements.slice(0, 3)
          };
        });

        if (scrollCheck.hasScroll) {
          const errMsg = `Scroll horizontal em [${r.name}] [${vp.name}]: scrollWidth (${scrollCheck.scrollWidth}) > clientWidth (${scrollCheck.clientWidth}). Elementos: ${scrollCheck.overflowingElements.join('; ')}`;
          validationErrors.push(errMsg);
          console.log(`  ❌ [${vp.name}]: Scroll horizontal detectado!`);
        } else {
          console.log(`  ✅ [${vp.name}]: scrollWidth (${scrollCheck.scrollWidth}) <= clientWidth (${scrollCheck.clientWidth})`);
        }

        // 2. Imagens carregadas
        const imgAudit = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img'));
          const failed = [];
          for (const img of imgs) {
            const ok = img.complete && img.naturalWidth > 0;
            if (!ok) {
              failed.push(img.src || img.getAttribute('src'));
            }
          }
          return { total: imgs.length, failed };
        });

        if (imgAudit.failed.length > 0) {
          const errMsg = `Imagens quebradas em [${r.name}] [${vp.name}]: ${imgAudit.failed.join(', ')}`;
          validationErrors.push(errMsg);
          console.log(`  ❌ Imagens falhas: ${imgAudit.failed.length}`);
        }

        // 3. Verificação de texto cortado / overflow inesperado em elementos visíveis
        const textClipCheck = await page.evaluate(() => {
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, button, span.eyebrow, figcaption'));
          const clipped = [];
          for (const el of headings) {
            if (el.classList.contains('sr-only') || el.closest('.sr-only')) continue;
            const s = window.getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden') continue;
            if (s.overflow === 'hidden' && el.scrollHeight > el.clientHeight + 2) {
              clipped.push(`${el.tagName} (${el.textContent.slice(0, 30)}...): scrollHeight=${el.scrollHeight} > clientHeight=${el.clientHeight}`);
            }
          }
          return clipped;
        });

        if (textClipCheck.length > 0) {
          const errMsg = `Texto cortado com overflow hidden em [${r.name}] [${vp.name}]: ${textClipCheck.join('; ')}`;
          validationErrors.push(errMsg);
          console.log(`  ❌ Texto cortado detectado`);
        }

        // 4. Verificação de sobreposição indevida entre elementos chave
        const overlapCheck = await page.evaluate(() => {
          const sections = Array.from(document.querySelectorAll('section'));
          const overlaps = [];
          for (let i = 0; i < sections.length - 1; i++) {
            const r1 = sections[i].getBoundingClientRect();
            const r2 = sections[i + 1].getBoundingClientRect();
            if (r1.bottom > r2.top + 2 && r1.top < r2.top) {
              overlaps.push(`Sobreposição entre section[${i}] e section[${i + 1}] (${(r1.bottom - r2.top).toFixed(1)}px)`);
            }
          }
          return overlaps;
        });

        if (overlapCheck.length > 0) {
          const errMsg = `Sobreposição de seções em [${r.name}] [${vp.name}]: ${overlapCheck.join('; ')}`;
          validationErrors.push(errMsg);
          console.log(`  ❌ Sobreposição detectada`);
        }

        // 5. Teste de Menu Mobile (se viewport móvel)
        let mobileMenuOk = true;
        if (vp.isMobile) {
          const menuBtn = await page.$('#mobile-menu-button');
          if (menuBtn) {
            const initialExpanded = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);
            await menuBtn.click();
            await new Promise(r => setTimeout(r, 150));
            const openExpanded = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);
            const menuHidden = await page.evaluate(() => {
              const m = document.getElementById('mobile-menu');
              return m ? m.classList.contains('hidden') : true;
            });

            await menuBtn.click();
            await new Promise(r => setTimeout(r, 150));
            const closedExpanded = await page.evaluate(el => el.getAttribute('aria-expanded'), menuBtn);

            mobileMenuOk = (initialExpanded === 'false' && openExpanded === 'true' && !menuHidden && closedExpanded === 'false');
            if (!mobileMenuOk) {
              validationErrors.push(`Falha no menu mobile em [${r.name}] [${vp.name}]: init=${initialExpanded}, open=${openExpanded}, closed=${closedExpanded}`);
            }
          }
        }

        // 6. Teste de foco de teclado visível
        const focusOk = await page.evaluate(() => {
          const firstInteractive = document.querySelector('a[href], button');
          if (!firstInteractive) return true;
          firstInteractive.focus();
          const active = document.activeElement;
          return active === firstInteractive;
        });

        if (!focusOk) {
          validationErrors.push(`Foco de teclado inacessível em [${r.name}] [${vp.name}]`);
        }

        // Captura de screenshot por viewport
        const screenshotName = `${r.slug}-${vp.name}.png`;
        const screenshotPath = path.join(viewportsDir, screenshotName);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        matrixResults.push({
          route: r.path,
          name: r.name,
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          scrollOk: !scrollCheck.hasScroll,
          imagesOk: imgAudit.failed.length === 0,
          textClipOk: textClipCheck.length === 0,
          overlapOk: overlapCheck.length === 0,
          mobileMenuOk: vp.isMobile ? mobileMenuOk : null,
          focusOk,
          screenshot: screenshotName
        });
      }
    }

    // Seções Específicas Obrigatórias e Recortes Nativos
    console.log('\n📸 Capturando seções e recortes solicitados...');

    // 1. HOME - Desktop 1920x1080
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
    await preparePageForScreenshots(page);

    // Hero 1920x1080
    await page.screenshot({ path: path.join(sectionsDir, 'home-01-hero-1920x1080.png') });

    // Home Seções
    const sectionsHome = await page.$$('section');
    if (sectionsHome.length >= 3) {
      await sectionsHome[1].screenshot({ path: path.join(sectionsDir, 'home-02-publicos-1920x1080.png') });
      await sectionsHome[2].screenshot({ path: path.join(sectionsDir, 'home-03-equipe-completa-1920x1080.png') });
    }

    // Transição TeamSection -> CTA (scroll para centralizar a junção)
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section');
      if (sections.length >= 4) {
        sections[2].scrollIntoView();
        window.scrollBy(0, 350);
      }
    });
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(sectionsDir, 'home-04-transicao-cta-footer-1920x1080.png') });

    // 2. HOME - Mobile 360x800
    await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
    await preparePageForScreenshots(page);
    await page.screenshot({ path: path.join(sectionsDir, 'home-05-hero-mobile-360x800.png') });

    const sectionsHomeMobile = await page.$$('section');
    if (sectionsHomeMobile.length >= 3) {
      await sectionsHomeMobile[2].screenshot({ path: path.join(sectionsDir, 'home-06-equipe-mobile-360x800.png') });
    }

    // 3. SOLUÇÕES - Desktop 1920x1080 e 1440x900 (com foco em Solução 04 nativa)
    for (const vp of [{ width: 1920, height: 1080, name: '1920x1080' }, { width: 1440, height: 900, name: '1440x900' }]) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${baseUrl}/solucoes`, { waitUntil: 'networkidle0' });
      await preparePageForScreenshots(page);

      if (vp.name === '1920x1080') {
        await page.screenshot({ path: path.join(sectionsDir, 'solucoes-01-hero-1920x1080.png') });
        const sectionsSolucoes = await page.$$('section');
        if (sectionsSolucoes.length >= 2) {
          await sectionsSolucoes[1].screenshot({ path: path.join(sectionsDir, 'solucoes-02-grid-5-solucoes-1920x1080.png') });
        }
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1080));
        await new Promise(r => setTimeout(r, 200));
        await page.screenshot({ path: path.join(sectionsDir, 'solucoes-03-cta-final-footer-1920x1080.png') });
      }

      // Solução 04 em recorte nativo estável (card completo e título)
      const solucao04 = await page.$('#iluminacao-infraestrutura');
      if (solucao04) {
        await solucao04.screenshot({ path: path.join(sectionsDir, `solucao-04-recorte-nativo-${vp.name}.png`) });
      }
      const solucao04Title = await page.$('#iluminacao-infraestrutura h3');
      if (solucao04Title) {
        await solucao04Title.screenshot({ path: path.join(sectionsDir, `solucao-04-titulo-nativo-${vp.name}.png`) });
      }
    }

    // 4. SOLUÇÕES - Mobile 360x800
    await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });
    await page.goto(`${baseUrl}/solucoes`, { waitUntil: 'networkidle0' });
    await preparePageForScreenshots(page);
    const sectionsSolucoesMobile = await page.$$('section');
    if (sectionsSolucoesMobile.length >= 2) {
      await sectionsSolucoesMobile[1].screenshot({ path: path.join(sectionsDir, 'solucoes-04-grid-mobile-360x800.png') });
    }

    // 5. Full page captures AFTER
    console.log('\n📸 Gerando capturas completas AFTER (todas as 4 rotas)...');
    for (const r of routes) {
      // Desktop 1920x1080
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle0' });
      await preparePageForScreenshots(page);
      await page.screenshot({ path: path.join(outDir, `${r.slug}-desktop-1920x1080-full.png`), fullPage: true });

      // Mobile 360x800
      await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });
      await page.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle0' });
      await preparePageForScreenshots(page);
      await page.screenshot({ path: path.join(outDir, `${r.slug}-mobile-360x800-full.png`), fullPage: true });
    }

    // Checagem de erros no console
    if (consoleErrors.length > 0) {
      validationErrors.push(`Erros no console detectados (${consoleErrors.length}): ${consoleErrors.join(' | ')}`);
    }

    // Gravar relatório estruturado
    const reportSummary = {
      timestamp: new Date().toISOString(),
      totalRoutesTested: routes.length,
      totalViewportsTested: requiredViewports.length,
      totalCombinations: matrixResults.length,
      allPassed: validationErrors.length === 0,
      validationErrors,
      consoleErrorsCount: consoleErrors.length,
      matrixResults
    };

    fs.writeFileSync(
      path.resolve('artifacts/validation/premium-polish/final-polish-report.json'),
      JSON.stringify(reportSummary, null, 2),
      'utf-8'
    );

    console.log('\n----------------------------------------------------------------');
    console.log(`📈 Resumo: ${matrixResults.length} combinações testadas | ${validationErrors.length} erros detectados.`);
    console.log('----------------------------------------------------------------\n');

    if (validationErrors.length > 0) {
      console.error('❌ ERROS ENCONTRADOS NA VALIDAÇÃO:');
      validationErrors.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }

    console.log('🎉 Validação e geração de evidências concluídas com 100% de conformidade!');
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser Puppeteer encerrado.');
    }
    if (server) {
      server.close();
      console.log('🔒 Servidor estático encerrado.');
    }
  }
}

run().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
