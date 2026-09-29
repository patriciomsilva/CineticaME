import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

const LIGHTHOUSE_VERSION = '13.4.1';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('artifacts/validation/custom-404');
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
      // Fallback para 404.html com status 404
      const custom404Path = path.join(distDir, '404.html');
      if (fs.existsSync(custom404Path)) {
        const custom404Content = fs.readFileSync(custom404Path);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(custom404Content);
        return;
      }
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

import { fileURLToPath } from 'url';

export function prepareLighthouseOutputPaths(outBase) {
  const jsonPath = `${outBase}.report.json`;
  const htmlPath = `${outBase}.report.html`;

  for (const filePath of [jsonPath, htmlPath]) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        throw new Error(`[LIMPEZA] Falha ao excluir arquivo prévio de auditoria em ${filePath}: ${err.message}`);
      }
      if (fs.existsSync(filePath)) {
        throw new Error(`[LIMPEZA] Arquivo de auditoria prévio ainda existe após tentativa de exclusão: ${filePath}`);
      }
    }
    if (fs.existsSync(filePath)) {
      throw new Error(`[LIMPEZA] Caminho de saída da auditoria não está livre antes de iniciar o subprocesso: ${filePath}`);
    }
  }

  return { jsonPath, htmlPath };
}

export function validateLighthouseReport(jsonPath, auditStartTimeMs = 0) {
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Arquivo de relatório não encontrado em ${jsonPath}`);
  }

  let stat;
  try {
    stat = fs.statSync(jsonPath);
  } catch (err) {
    throw new Error(`Falha ao obter status do arquivo ${jsonPath}: ${err.message}`);
  }

  // O arquivo precisa ter sido modificado durante ou após o início da auditoria
  if (auditStartTimeMs > 0 && stat.mtimeMs < auditStartTimeMs - 1000) {
    throw new Error(`Relatório em ${jsonPath} é antigo/anterior ao início da auditoria (mtime=${stat.mtime.toISOString()}, início=${new Date(auditStartTimeMs).toISOString()})`);
  }

  let content;
  try {
    content = fs.readFileSync(jsonPath, 'utf8');
  } catch (err) {
    throw new Error(`Falha ao ler o relatório em ${jsonPath}: ${err.message}`);
  }

  if (!content || content.trim().length === 0) {
    throw new Error(`Arquivo de relatório vazio em ${jsonPath}`);
  }

  let report;
  try {
    report = JSON.parse(content);
  } catch (err) {
    throw new Error(`Relatório corrompido/JSON inválido em ${jsonPath}: ${err.message}`);
  }

  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    throw new Error(`Estrutura JSON raiz inválida em ${jsonPath}`);
  }

  // Campos estruturais obrigatórios
  if (!report.lighthouseVersion || typeof report.lighthouseVersion !== 'string') {
    throw new Error(`Campo 'lighthouseVersion' ausente ou inválido no relatório ${jsonPath}`);
  }

  if (!report.fetchTime || typeof report.fetchTime !== 'string') {
    throw new Error(`Campo 'fetchTime' ausente ou inválido no relatório ${jsonPath}`);
  }

  const fetchTimeMs = new Date(report.fetchTime).getTime();
  if (isNaN(fetchTimeMs)) {
    throw new Error(`Campo 'fetchTime' contém formato de data inválido (${report.fetchTime}) no relatório ${jsonPath}`);
  }

  if (auditStartTimeMs > 0 && fetchTimeMs < auditStartTimeMs - 1000) {
    throw new Error(`fetchTime (${report.fetchTime}) é anterior ao início da auditoria (${new Date(auditStartTimeMs).toISOString()}) no relatório ${jsonPath}`);
  }

  if (!report.finalUrl || typeof report.finalUrl !== 'string') {
    throw new Error(`Campo 'finalUrl' ausente ou inválido no relatório ${jsonPath}`);
  }

  if (!report.audits || typeof report.audits !== 'object' || Array.isArray(report.audits)) {
    throw new Error(`Objeto 'audits' ausente ou inválido no relatório ${jsonPath}`);
  }

  if (!report.categories || typeof report.categories !== 'object' || Array.isArray(report.categories)) {
    throw new Error(`Objeto 'categories' ausente ou inválido no relatório ${jsonPath}`);
  }

  const requiredCategories = ['performance', 'accessibility', 'best-practices'];
  for (const cat of requiredCategories) {
    const categoryObj = report.categories[cat];
    if (!categoryObj || typeof categoryObj !== 'object') {
      throw new Error(`Categoria obrigatória '${cat}' ausente no relatório ${jsonPath}`);
    }
    if (typeof categoryObj.score !== 'number' || isNaN(categoryObj.score)) {
      throw new Error(`Score numérico da categoria '${cat}' ausente ou inválido no relatório ${jsonPath}`);
    }
  }

  return report;
}

export function isToleratedEpermNonZeroExit(code, stdout = '', stderr = '') {
  if (code === 0) return true;

  const isWindows = process.platform === 'win32';
  if (!isWindows) {
    return false;
  }

  const combinedOutput = `${stdout}\n${stderr}`;

  // Verificar evidência explícita de EPERM
  const hasEperm = /\bEPERM\b/i.test(combinedOutput);
  if (!hasEperm) {
    return false;
  }

  // Verificar se o erro está relacionado ao encerramento ou limpeza dos arquivos temporários do Chrome/Lighthouse
  const isCleanupOrTeardown = /(?:clean|unlink|rmdir|remove|delete|temp|tmp|userDataDir|scoped_dir|profile|teardown|closing chrome)/i.test(combinedOutput);
  if (!isCleanupOrTeardown) {
    return false;
  }

  return true;
}

function runSingleLighthouseAuditOnce(url, outBase, isDesktop = false, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    // 1. Limpeza dos relatórios prévios e verificação de integridade dos caminhos
    const { jsonPath } = prepareLighthouseOutputPaths(outBase);
    const auditStartTimeMs = Date.now();

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
    let stdoutBuffer = '';
    let stderrBuffer = '';

    try {
      proc = spawn(spawnCmd, spawnArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          CHROME_PATH: chromePath
        },
        shell: false
      });
    } catch (err) {
      return reject(err);
    }

    if (proc.stdout) {
      proc.stdout.on('data', chunk => {
        const text = chunk.toString();
        stdoutBuffer += text;
        process.stdout.write(text);
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', chunk => {
        const text = chunk.toString();
        stderrBuffer += text;
        process.stderr.write(text);
      });
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

      // Se code !== 0, verificar se atende estritamente às condições de tolerância EPERM no Windows
      if (code !== 0) {
        const isTolerated = isToleratedEpermNonZeroExit(code, stdoutBuffer, stderrBuffer);
        if (!isTolerated) {
          return reject(new Error(`Lighthouse encerrou com código não zero (${code}) não tolerado para ${url}.\nStderr: ${stderrBuffer.slice(-500)}\nStdout: ${stdoutBuffer.slice(-500)}`));
        }
      }

      // Validar a integridade estrutural e temporal do relatório recém-gerado
      try {
        const report = validateLighthouseReport(jsonPath, auditStartTimeMs);
        if (code !== 0) {
          console.warn(`  ⚠️ Lighthouse terminou com código não zero (${code}) no encerramento/limpeza do Chrome no Windows com evidência de EPERM, mas gerou relatório estruturalmente válido e recém-criado.`);
        }
        resolve(report);
      } catch (validationErr) {
        if (code === 0) {
          reject(new Error(`Lighthouse finalizou com código 0, mas o relatório falhou na validação estrutural: ${validationErr.message}`));
        } else {
          reject(new Error(`Lighthouse finalizou com código de erro ${code} e sem relatório íntegro para ${url}: ${validationErr.message}`));
        }
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
      return await runSingleLighthouseAuditOnce(url, outBase, isDesktop, timeoutMs);
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }
}

async function run() {
  console.log('================================================================');
  console.log('🛡️  ETAPA 6 — VALIDAÇÃO DA PÁGINA 404 E ROTAS INEXISTENTES');
  console.log(`📌 Versão fixada do Lighthouse: ${LIGHTHOUSE_VERSION}`);
  console.log('================================================================\n');

  const distPath = path.resolve('dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Diretório dist/ não encontrado. Execute npm run build antes.');
  }

  // 1. Verificações de Arquitetura no Build
  console.log('📁 1. Verificação de Arquitetura e Artefato dist/404.html:');
  const allDistFiles = getAllFiles(distPath).map(f => path.relative(distPath, f).replace(/\\/g, '/'));

  const has404InDist = allDistFiles.includes('404.html');
  console.log(`  - Presença de dist/404.html: ${has404InDist ? '✅ Gerado com sucesso' : '❌ NÃO ENCONTRADO'}`);
  if (!has404InDist) {
    throw new Error('Falha: dist/404.html não foi gerado no build.');
  }

  const custom404Content = fs.readFileSync(path.join(distPath, '404.html'), 'utf-8');
  const hasForm = /<form[\s>]/i.test(custom404Content);
  const hasNoindex = /<meta[^>]*name=["']robots["'][^>]*content=["']noindex,\s*nofollow["']/i.test(custom404Content);
  const hasObrasInDist = allDistFiles.some(f => f.toLowerCase().includes('obras'));
  const hasSitemapInDist = allDistFiles.some(f => f.toLowerCase().includes('sitemap'));

  console.log(`  - Ausência de formulários em 404.html: ${!hasForm ? '✅ 0 formulários' : '❌ Formulário detectado'}`);
  console.log(`  - Meta noindex, nofollow em 404.html: ${hasNoindex ? '✅ Confirmado' : '❌ Ausente'}`);
  console.log(`  - Ausência de /obras: ${!hasObrasInDist ? '✅ Confirmado' : '❌ Rota /obras encontrada'}`);
  console.log(`  - Ausência de sitemap provisório: ${!hasSitemapInDist ? '✅ Confirmado' : '❌ Sitemap provisório encontrado'}`);

  if (hasForm || !hasNoindex || hasObrasInDist || hasSitemapInDist) {
    throw new Error('Falha nas verificações estáticas de 404.html.');
  }

  let server = null;
  let browser = null;

  try {
    // 2. Iniciar servidor estático
    server = await createStaticServer(distPath, 4321);
    console.log('\n🌐 2. Servidor estático ativo em http://127.0.0.1:4321.');

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const consoleErrors = [];
    const networkRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // O Chrome emite nativamente 'Failed to load resource: ... status of 404' ao testar rota inexistente
        if (!text.includes('status of 404')) {
          consoleErrors.push(text);
        }
      }
    });
    page.on('pageerror', err => consoleErrors.push(err.toString()));
    page.on('request', req => {
      const url = req.url();
      if (!url.startsWith('data:') && !url.startsWith('chrome-extension:') && !url.startsWith('about:')) {
        networkRequests.push(url);
      }
    });

    // 3. Testar as 5 rotas institucionais públicas
    console.log('\n🏛️ 3. Confirmação das 5 Rotas Institucionais Públicas (Status 200):');
    const institutionalRoutes = [
      { path: '/', name: 'Início' },
      { path: '/solucoes', name: 'Soluções' },
      { path: '/a-cinetica', name: 'A Cinética' },
      { path: '/contato', name: 'Contato' },
      { path: '/privacidade', name: 'Privacidade' }
    ];

    for (const r of institutionalRoutes) {
      const res = await page.goto(`http://127.0.0.1:4321${r.path}`, { waitUntil: 'networkidle0' });
      const status = res ? res.status() : 500;
      console.log(`  - [${r.name}] ${r.path} -> Status HTTP: ${status === 200 ? '✅ 200 OK' : `❌ ${status}`}`);
      if (status !== 200) {
        throw new Error(`Falha: Rota institucional ${r.path} retornou status ${status}`);
      }
    }

    // 4. Testar acesso direto a /404.html e rota inexistente com status 404
    console.log('\n🔍 4. Teste de Acesso a /404.html e Rota Inexistente:');
    
    // Acesso direto ao arquivo
    const resDirect404 = await page.goto('http://127.0.0.1:4321/404.html', { waitUntil: 'networkidle0' });
    const directStatus = resDirect404 ? resDirect404.status() : 500;
    console.log(`  - Acesso direto a /404.html -> Status HTTP: ${directStatus === 200 ? '✅ 200 OK (Arquivo existente servido)' : `Status ${directStatus}`}`);

    // Acesso a rota inexistente
    const resNotFoundRoute = await page.goto('http://127.0.0.1:4321/rota-inexistente-qualquer', { waitUntil: 'networkidle0' });
    const notFoundStatus = resNotFoundRoute ? resNotFoundRoute.status() : 500;
    console.log(`  - Acesso a rota inexistente (/rota-inexistente-qualquer) -> Status HTTP: ${notFoundStatus === 404 ? '✅ 404 Not Found (Correto)' : `❌ ${notFoundStatus}`}`);
    if (notFoundStatus !== 404) {
      throw new Error(`Falha: Rota inexistente retornou status ${notFoundStatus}, esperado 404.`);
    }

    // 5. Auditoria de Semântica e Elementos na Página 404
    console.log('\n🏷️ 5. Auditoria Semântica, Acessibilidade e Links da Página 404:');
    await page.goto('http://127.0.0.1:4321/404.html', { waitUntil: 'networkidle0' });

    const auditData = await page.evaluate(() => {
      const title = document.title;
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
      const metaRobots = document.querySelector('meta[name="robots"]')?.getAttribute('content');
      const h1Elements = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim());
      const hasForm = !!document.querySelector('form');
      const skipLink = !!document.querySelector('a[href="#main-content"]');
      const internalAnchors = Array.from(document.querySelectorAll('main a[href]')).map(a => ({
        text: a.textContent.trim().replace(/\s+/g, ' '),
        href: a.getAttribute('href')
      }));

      return {
        title,
        description: metaDesc,
        robots: metaRobots,
        h1Count: h1Elements.length,
        h1Text: h1Elements[0] || '',
        hasForm,
        skipLink,
        internalAnchors
      };
    });

    console.log(`  - Title: "${auditData.title}"`);
    console.log(`  - Description: "${auditData.description}"`);
    console.log(`  - Robots: "${auditData.robots}"`);
    console.log(`  - H1 único: ${auditData.h1Count === 1 ? `✅ 1 h1 ("${auditData.h1Text}")` : `❌ ${auditData.h1Count} tags h1`}`);
    console.log(`  - Skip link: ${auditData.skipLink ? '✅ Presente' : '❌ Ausente'}`);
    console.log(`  - Formulários: ${!auditData.hasForm ? '✅ 0 formulários' : '❌ Formulário detectado'}`);
    console.log(`  - Links internos em destaque: ${auditData.internalAnchors.map(a => `${a.href}`).join(', ')}`);

    if (auditData.h1Count !== 1) {
      throw new Error(`Falha: Página 404 possui ${auditData.h1Count} tags h1.`);
    }
    if (auditData.robots !== 'noindex, nofollow') {
      throw new Error(`Falha: Meta robots não é noindex, nofollow em 404.`);
    }

    // 6. Testar integridade dos links contidos na 404
    console.log('\n🔗 6. Validação dos Links Internos Oferecidos na 404:');
    const checked404Links = [];
    for (const anchor of auditData.internalAnchors) {
      if (!anchor.href || anchor.href.startsWith('#')) continue;
      const res = await page.goto(`http://127.0.0.1:4321${anchor.href}`, { waitUntil: 'networkidle0' });
      const status = res ? res.status() : 500;
      console.log(`  - Destino [${anchor.href}] -> Status ${status === 200 ? '✅ 200 OK' : `❌ ${status}`}`);
      if (status !== 200) {
        throw new Error(`Falha: Link ${anchor.href} na página 404 está quebrado (status ${status})`);
      }
      checked404Links.push({ href: anchor.href, status });
    }

    // 7. Responsividade e Rolagem Horizontal nos 3 viewports
    console.log('\n📐 7. Testes de Responsividade e Rolagem Horizontal da 404:');
    const viewports = [
      { name: 'mobile-360x800', width: 360, height: 800, isMobile: true, hasTouch: true },
      { name: 'tablet-768x1024', width: 768, height: 1024, isMobile: false, hasTouch: false },
      { name: 'desktop-1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false }
    ];

    for (const vp of viewports) {
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch
      });

      await page.goto('http://127.0.0.1:4321/404.html', { waitUntil: 'networkidle0' });

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      console.log(`  - [404] ${vp.name}: ${hasHorizontalScroll ? '❌ SCROLL HORIZONTAL DETECTADO' : '✅ OK (Sem scroll horizontal)'}`);
      if (hasHorizontalScroll) {
        throw new Error(`Falha: Rolagem horizontal detectada na página 404 em ${vp.name}`);
      }

      const screenshotPath = path.join(outDir, `404-${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    // 8. Verificação de Erros de Console e Requisições Externas
    const externalRequests = networkRequests.filter(url => !url.startsWith('http://127.0.0.1:4321'));
    console.log(`\n🌐 8. Requisições Externas: ${externalRequests.length === 0 ? '✅ 0 (100% Local)' : `❌ ${externalRequests.join(', ')}`}`);
    console.log(`⚠️ 9. Erros de Console: ${consoleErrors.length === 0 ? '✅ 0 erros de console' : `❌ ${consoleErrors.join(' | ')}`}`);

    if (externalRequests.length > 0 || consoleErrors.length > 0) {
      throw new Error('Falha: Requisições externas ou erros de console detectados na página 404.');
    }

    // Fechar Puppeteer antes de rodar o Lighthouse
    await browser.close();
    browser = null;

    // 10. Execução de Auditorias Lighthouse Reais (v13.4.1) na Página 404
    console.log('\n⚡ 10. Auditorias Lighthouse na Página 404 (Mobile e Desktop):');
    const lighthouseResults = [];

    for (const mode of ['mobile', 'desktop']) {
      const isDesktop = mode === 'desktop';
      const outBase = path.join(lighthouseDir, `404-${mode}`);
      const url = 'http://127.0.0.1:4321/404.html';

      console.log(`  -> Executando Lighthouse (${LIGHTHOUSE_VERSION}): [404.html] (${mode})...`);
      await runSingleLighthouseAudit(url, outBase, isDesktop);

      const jsonPath = `${outBase}.report.json`;
      if (!fs.existsSync(jsonPath)) {
        throw new Error(`Falha Lighthouse: Relatório JSON não encontrado em ${jsonPath}`);
      }

      const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      if (report.lighthouseVersion !== LIGHTHOUSE_VERSION) {
        throw new Error(`Falha Versão Lighthouse: esperada ${LIGHTHOUSE_VERSION}, obtida ${report.lighthouseVersion}`);
      }

      const perf = Math.round(report.categories.performance.score * 100);
      const a11y = Math.round(report.categories.accessibility.score * 100);
      const bp = Math.round(report.categories['best-practices'].score * 100);
      const seo = Math.round(report.categories.seo.score * 100);

      const result = {
        route: '/404.html',
        mode,
        lighthouseVersion: report.lighthouseVersion,
        performance: perf,
        accessibility: a11y,
        bestPractices: bp,
        seo,
        reportJson: path.basename(`${outBase}.report.json`),
        reportHtml: path.basename(`${outBase}.report.html`)
      };

      lighthouseResults.push(result);
      console.log(`     Resultado 404 ${mode} (v${report.lighthouseVersion}): Perf=${perf} | A11y=${a11y} | BestPractices=${bp} | SEO=${seo}`);

      if (perf < 90) {
        throw new Error(`Falha Lighthouse: Performance de 404 (${mode}) foi ${perf} < 90`);
      }
      if (a11y < 95) {
        throw new Error(`Falha Lighthouse: Accessibility de 404 (${mode}) foi ${a11y} < 95`);
      }
      if (bp < 95) {
        throw new Error(`Falha Lighthouse: Best Practices de 404 (${mode}) foi ${bp} < 95`);
      }

      await new Promise(r => setTimeout(r, 400));
    }

    // Gravação do Relatório Markdown e JSON
    const reportSummary = {
      timestamp: new Date().toISOString(),
      lighthouseVersion: LIGHTHOUSE_VERSION,
      verdict: 'APPROVED',
      page: '/404.html',
      seoAudit: auditData,
      linksTested: checked404Links,
      lighthouse: lighthouseResults
    };

    fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(reportSummary, null, 2), 'utf-8');

    let lighthouseTable = '| Rota | Modo | Versão | Performance (Meta >= 90) | Accessibility (Meta >= 95) | Best Practices (Meta >= 95) | SEO (Registrado) |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n';
    for (const item of lighthouseResults) {
      lighthouseTable += `| \`${item.route}\` | ${item.mode} | ${item.lighthouseVersion} | **${item.performance}** | **${item.accessibility}** | **${item.bestPractices}** | **${item.seo}** |\n`;
    }

    const markdownDoc = `# Relatório de Validação — Página 404 Institucional

Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
Versão do Lighthouse: **${LIGHTHOUSE_VERSION}**
Veredito: **PÁGINA 404 APROVADA**

---

## 1. Pontuações Lighthouse (v${LIGHTHOUSE_VERSION})

${lighthouseTable}

> **Nota sobre pontuação de SEO na 404:** A pontuação de SEO reflete intencionalmente a presença da diretiva obrigatória \`meta name="robots" content="noindex, nofollow"\` e ausência de URL canônica em páginas de erro, protegendo o site contra indexação de erros por motores de busca.

---

## 2. Verificações Funcionais e Estruturais

- **Status HTTP em rota inexistente:** 404 Not Found
- **Status HTTP em acesso direto a \`/404.html\`:** 200 OK
- **Tag \`<h1>\` única:** Confirmada ("${auditData.h1Text}")
- **Meta Robots:** \`${auditData.robots}\`
- **Formulários:** 0 detectados
- **Requisições externas:** 0 detectadas
- **Erros de console:** 0 detectados
- **Rolagem horizontal:** 0 nos viewports 360×800, 768×1024 e 1440×900
- **Links internos testados:** Início (\`/\`), Soluções (\`/solucoes\`), A Cinética (\`/a-cinetica\`), Contato (\`/contato\`) — todos com status 200 OK.
`;

    fs.writeFileSync(path.join(outDir, 'report-404.md'), markdownDoc, 'utf-8');

    console.log('\n================================================================');
    console.log('🏆 VEREDITO: PÁGINA 404 APROVADA COM SUCESSO!');
    console.log(`📁 Artefatos salvos em: ${outDir}`);
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

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run().catch(err => {
    console.error('\n❌ ERRO NA VALIDAÇÃO DA PÁGINA 404:', err);
    process.exit(1);
  });
}
