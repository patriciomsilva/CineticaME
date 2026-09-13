import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('artifacts/validation');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('🚀 Iniciando validação institucional com Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Monitorar erros e requisições
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

  // 1. Teste de Rolagem Horizontal em Múltiplas Resoluções
  const viewports = [
    { name: '320px (Mobile Mini)', width: 320, height: 600, isMobile: true },
    { name: '390px (Mobile Standard)', width: 390, height: 844, isMobile: true },
    { name: '768px (Tablet)', width: 768, height: 1024, isMobile: false },
    { name: '1024px (Laptop/Tablet Land)', width: 1024, height: 768, isMobile: false },
    { name: '1440px (Desktop Full)', width: 1440, height: 900, isMobile: false }
  ];

  console.log('\n📐 Verificação de Rolagem Horizontal:');
  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2, isMobile: vp.isMobile });
    await page.goto('http://localhost:4321', { waitUntil: 'networkidle0' });
    const hasScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`  - ${vp.name}: ${hasScroll ? '❌ SCROLL DETECTADO (ERRO)' : '✅ OK (Sem scroll)'}`);
  }

  // 2. Validações e Capturas em Desktop (1440x900)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle0' });

  // Captura Desktop Completa
  await page.screenshot({
    path: path.join(outDir, 'screenshot-desktop-full.png'),
    fullPage: true
  });
  console.log('📸 screenshot-desktop-full.png salvo');

  // Captura Hero Desktop
  const sections = await page.$$('section');
  if (sections.length > 0) {
    await sections[0].screenshot({
      path: path.join(outDir, 'screenshot-hero-desktop.png')
    });
    console.log('📸 screenshot-hero-desktop.png salvo');
  }

  // Captura Fotografia Institucional da Equipe em Desktop (Section 3)
  if (sections.length > 2) {
    await sections[2].screenshot({
      path: path.join(outDir, 'screenshot-team-desktop.png')
    });
    console.log('📸 screenshot-team-desktop.png salvo');
  }

  // 3. Validações e Capturas em Mobile (390x844)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle0' });

  // Testar Menu Mobile
  const menuBtn = await page.$('#mobile-menu-button');
  const menuGaveta = await page.$('#mobile-menu');
  if (menuBtn && menuGaveta) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 300));
    
    // Captura Mobile com Menu Aberto
    await page.screenshot({
      path: path.join(outDir, 'screenshot-mobile-menu.png')
    });
    console.log('📸 screenshot-mobile-menu.png salvo');

    // Fechar menu
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 300));
  }

  // Captura Mobile Completa
  await page.screenshot({
    path: path.join(outDir, 'screenshot-mobile-full.png'),
    fullPage: true
  });
  console.log('📸 screenshot-mobile-full.png salvo');

  // Captura Hero Mobile
  const mobileSections = await page.$$('section');
  if (mobileSections.length > 0) {
    await mobileSections[0].screenshot({
      path: path.join(outDir, 'screenshot-hero-mobile.png')
    });
    console.log('📸 screenshot-hero-mobile.png salvo');
  }

  // Captura Equipe Mobile
  if (mobileSections.length > 2) {
    await mobileSections[2].screenshot({
      path: path.join(outDir, 'screenshot-team-mobile.png')
    });
    console.log('📸 screenshot-team-mobile.png salvo');
  }

  // 4. Verificação de Imagens Quebradas
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
  });
  console.log('\n🖼️ Imagens Quebradas:', brokenImages.length === 0 ? '✅ Nenhuma' : `❌ ${brokenImages.join(', ')}`);

  // 5. Verificação de Links Internos
  const internalLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]'))
      .map(a => a.getAttribute('href'))
      .filter(href => href && href.startsWith('/') && !href.startsWith('//'));
  });
  console.log(`🔗 Links Internos Encontrados (${internalLinks.length}):`, [...new Set(internalLinks)].join(', '));

  // 6. Requisições Externas
  const externalRequests = networkRequests.filter(url => !url.startsWith('http://localhost:4321'));
  console.log(`🌐 Requisições Externas (${externalRequests.length}):`, externalRequests.length === 0 ? '✅ Nenhuma (100% Local)' : `⚠️ ${externalRequests.join(', ')}`);

  console.log(`⚠️ Console Errors:`, consoleErrors.length === 0 ? '✅ Nenhum' : `❌ ${consoleErrors.join(' | ')}`);

  await browser.close();
  console.log('\n🏁 Validação concluída com sucesso!');
}

run().catch(err => {
  console.error('Erro na validação:', err);
  process.exit(1);
});
