import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('artifacts/dependency-upgrade');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('🚀 Iniciando validação rigorosa pós-hardening de dependências...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const networkRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  page.on('request', req => {
    networkRequests.push(req.url());
  });

  const routes = [
    { path: '/', name: 'home' },
    { path: '/solucoes', name: 'solucoes' },
    { path: '/a-cinetica', name: 'a-cinetica' },
    { path: '/contato', name: 'contato' },
    { path: '/obras', name: 'obras' },
    { path: '/privacidade', name: 'privacidade' }
  ];

  const viewports = [
    { name: 'desktop', width: 1440, height: 900, isMobile: false },
    { name: 'tablet', width: 768, height: 1024, isMobile: false },
    { name: 'celular', width: 390, height: 844, isMobile: true, hasTouch: true }
  ];

  console.log('\n📐 1. Verificação de Rolagem Horizontal e Capturas em Todas as Rotas:');
  for (const r of routes) {
    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2, isMobile: vp.isMobile, hasTouch: vp.hasTouch || false });
      const url = `http://localhost:4321${r.path}`;
      await page.goto(url, { waitUntil: 'networkidle0' });

      const hasScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      console.log(`  - [${r.name}] ${vp.name} (${vp.width}x${vp.height}): ${hasScroll ? '❌ SCROLL DETECTADO (ERRO)' : '✅ OK (Sem scroll)'}`);

      await page.screenshot({
        path: path.join(outDir, `route-${r.name}-${vp.name}-full.png`),
        fullPage: true
      });
    }
  }

  // 2. Capturas detalhadas de componentes chave
  console.log('\n📸 2. Capturas de Componentes Chave da Interface:');
  
  // Desktop 1440x900
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });

  // Header & Logo
  const header = await page.$('header');
  if (header) {
    await header.screenshot({ path: path.join(outDir, 'component-header-desktop.png') });
    console.log('  📸 component-header-desktop.png');
  }

  // Hero
  const sections = await page.$$('section');
  if (sections.length > 0) {
    await sections[0].screenshot({ path: path.join(outDir, 'component-hero-desktop.png') });
    console.log('  📸 component-hero-desktop.png');
  }

  // Caminhos por Público (Section 2)
  if (sections.length > 1) {
    await sections[1].screenshot({ path: path.join(outDir, 'component-audiences-desktop.png') });
    console.log('  📸 component-audiences-desktop.png');
  }

  // Fotografia da Equipe e Estrutura (Section 3)
  if (sections.length > 2) {
    await sections[2].screenshot({ path: path.join(outDir, 'component-team-desktop.png') });
    console.log('  📸 component-team-desktop.png');
  }

  // Rodapé
  const footer = await page.$('footer');
  if (footer) {
    await footer.screenshot({ path: path.join(outDir, 'component-footer-desktop.png') });
    console.log('  📸 component-footer-desktop.png');
  }

  // Celular 390x844: Menu mobile aberto
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });
  const menuBtn = await page.$('#mobile-menu-button');
  const menuGaveta = await page.$('#mobile-menu');
  if (menuBtn && menuGaveta) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 350));
    await page.screenshot({ path: path.join(outDir, 'component-mobile-menu-open.png') });
    console.log('  📸 component-mobile-menu-open.png');
  }

  // 3. Verificação de Imagens Quebradas
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
  });
  console.log('\n🖼️ 3. Imagens Quebradas:', brokenImages.length === 0 ? '✅ Nenhuma' : `❌ ${brokenImages.join(', ')}`);

  // 4. Verificação de noindex em todas as páginas
  console.log('\n🏷️ 4. Verificação de noindex:');
  for (const r of routes) {
    await page.goto(`http://localhost:4321${r.path}`, { waitUntil: 'networkidle0' });
    const robotsMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="robots"]');
      return meta ? meta.getAttribute('content') : null;
    });
    console.log(`  - [${r.name}] meta robots: ${robotsMeta === 'noindex, nofollow' ? '✅ noindex, nofollow confirmado' : robotsMeta}`);
  }

  // 5. Verificação do robots.txt
  console.log('\n🤖 5. Verificação do robots.txt:');
  const robotsRes = await page.goto('http://localhost:4321/robots.txt');
  const robotsText = await robotsRes.text();
  console.log('--- robots.txt content ---\n' + robotsText.trim() + '\n-------------------------');

  // 6. Requisições Externas
  const externalRequests = networkRequests.filter(url => !url.startsWith('http://localhost:4321'));
  console.log(`\n🌐 6. Requisições Externas (${externalRequests.length}):`, externalRequests.length === 0 ? '✅ Nenhuma (100% Local)' : `⚠️ ${externalRequests.join(', ')}`);

  console.log(`\n⚠️ 7. Erros de Console:`, consoleErrors.length === 0 ? '✅ Nenhum' : `❌ ${consoleErrors.join(' | ')}`);

  await browser.close();
  console.log('\n🏁 Validação visual e técnica concluída com sucesso!');
}

run().catch(err => {
  console.error('Erro na validação:', err);
  process.exit(1);
});
