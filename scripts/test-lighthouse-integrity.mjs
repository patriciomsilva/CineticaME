import fs from 'fs';
import path from 'path';
import assert from 'assert';
import {
  prepareLighthouseOutputPaths,
  validateLighthouseReport,
  isToleratedEpermNonZeroExit
} from './validate-prelaunch-quality-gate.mjs';

const tempDir = path.resolve('artifacts/test-integrity-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

function createValidReportJson(overrides = {}) {
  return {
    lighthouseVersion: '13.4.1',
    fetchTime: new Date().toISOString(),
    finalUrl: 'http://127.0.0.1:4321/',
    audits: {
      'first-contentful-paint': { score: 1 }
    },
    categories: {
      performance: { score: 0.98 },
      accessibility: { score: 1.0 },
      'best-practices': { score: 1.0 },
      seo: { score: 0.92 }
    },
    ...overrides
  };
}

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASSOU] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FALHOU] ${name}:`, err.message);
    failedTests++;
  }
}

console.log('================================================================');
console.log('🧪 TESTES DE INTEGRIDADE E PROTEÇÃO DOS VALIDADORES LIGHTHOUSE');
console.log('================================================================\n');

// TESTE 0: Limpeza e verificação de arquivos prévios
runTest('Limpeza prévia: remove arquivos existentes e confirma caminhos livres', () => {
  const base = path.join(tempDir, 'test-clean');
  const jsonPath = `${base}.report.json`;
  const htmlPath = `${base}.report.html`;

  fs.writeFileSync(jsonPath, 'dummy json');
  fs.writeFileSync(htmlPath, 'dummy html');
  assert(fs.existsSync(jsonPath));
  assert(fs.existsSync(htmlPath));

  const result = prepareLighthouseOutputPaths(base);
  assert.strictEqual(result.jsonPath, jsonPath);
  assert(!fs.existsSync(jsonPath), 'JSON deve ter sido removido');
  assert(!fs.existsSync(htmlPath), 'HTML deve ter sido removido');
});

// TESTE 1: Relatório antigo não pode produzir aprovação
runTest('Proteção 1: Relatório com fetchTime anterior ao início da auditoria é rejeitado', () => {
  const base = path.join(tempDir, 'test-old-report');
  const jsonPath = `${base}.report.json`;

  const oldFetchTime = new Date(Date.now() - 60000).toISOString(); // 1 minuto atrás
  const oldReport = createValidReportJson({ fetchTime: oldFetchTime });
  fs.writeFileSync(jsonPath, JSON.stringify(oldReport, null, 2), 'utf-8');

  const auditStartTimeMs = Date.now(); // Auditoria iniciada agora

  assert.throws(
    () => validateLighthouseReport(jsonPath, auditStartTimeMs),
    /é anterior ao início da auditoria/,
    'Deveria rejeitar relatório com fetchTime antigo'
  );
});

// TESTE 2: JSON inválido é rejeitado
runTest('Proteção 2: Arquivo com JSON malformado/corrompido é rejeitado', () => {
  const base = path.join(tempDir, 'test-invalid-json');
  const jsonPath = `${base}.report.json`;

  fs.writeFileSync(jsonPath, '{ "lighthouseVersion": "13.4.1", "corrompido: true ...', 'utf-8');
  const auditStartTimeMs = Date.now() - 1000;

  assert.throws(
    () => validateLighthouseReport(jsonPath, auditStartTimeMs),
    /Relatório corrompido\/JSON inválido/,
    'Deveria rejeitar JSON malformado'
  );
});

// TESTE 3: JSON parcial é rejeitado
runTest('Proteção 3: JSON parcial/incompleto (sem campos ou scores obrigatórios) é rejeitado', () => {
  const base = path.join(tempDir, 'test-partial-json');
  const jsonPath = `${base}.report.json`;
  const auditStartTimeMs = Date.now() - 1000;

  // Sem audits
  const missingAudits = createValidReportJson();
  delete missingAudits.audits;
  fs.writeFileSync(jsonPath, JSON.stringify(missingAudits), 'utf-8');
  assert.throws(
    () => validateLighthouseReport(jsonPath, auditStartTimeMs),
    /Objeto 'audits' ausente ou inválido/,
    'Deveria rejeitar objeto audits ausente'
  );

  // Sem lighthouseVersion
  const missingVersion = createValidReportJson();
  delete missingVersion.lighthouseVersion;
  fs.writeFileSync(jsonPath, JSON.stringify(missingVersion), 'utf-8');
  assert.throws(
    () => validateLighthouseReport(jsonPath, auditStartTimeMs),
    /Campo 'lighthouseVersion' ausente ou inválido/,
    'Deveria rejeitar lighthouseVersion ausente'
  );

  // Sem categoria accessibility
  const missingA11y = createValidReportJson();
  delete missingA11y.categories.accessibility;
  fs.writeFileSync(jsonPath, JSON.stringify(missingA11y), 'utf-8');
  assert.throws(
    () => validateLighthouseReport(jsonPath, auditStartTimeMs),
    /Categoria obrigatória 'accessibility' ausente/,
    'Deveria rejeitar categoria obrigatória ausente'
  );

  // Score não numérico
  const invalidScore = createValidReportJson({
    categories: {
      performance: { score: 'NaN' },
      accessibility: { score: 1.0 },
      'best-practices': { score: 1.0 }
    }
  });
  fs.writeFileSync(jsonPath, JSON.stringify(invalidScore), 'utf-8');
  assert.throws(
    () => validateLighthouseReport(jsonPath, auditStartTimeMs),
    /Score numérico da categoria 'performance' ausente ou inválido/,
    'Deveria rejeitar score não numérico'
  );
});

// TESTE 4: Código não zero sem EPERM é rejeitado
runTest('Proteção 4: Código de saída não zero sem EPERM explícito é estritamente rejeitado', () => {
  const stdout = 'Lighthouse execution started...';
  const stderrGenericError = 'RuntimeError: Unable to connect to Chrome. Target closed.';

  const isTolerated = isToleratedEpermNonZeroExit(1, stdout, stderrGenericError);
  assert.strictEqual(isTolerated, false, 'Erro sem EPERM não deve ser tolerado');

  const stderrOtherError = 'Error: EACCES: permission denied, open /var/log';
  assert.strictEqual(isToleratedEpermNonZeroExit(1, stdout, stderrOtherError), false, 'EACCES ou outro erro não deve ser tolerado');

  const stderrEpermWithoutCleanup = 'Error: EPERM: operation not permitted, read custom-plugin.js';
  assert.strictEqual(isToleratedEpermNonZeroExit(1, stdout, stderrEpermWithoutCleanup), false, 'EPERM não relacionado a limpeza de temporários não deve ser tolerado');
});

// TESTE 5: Código não zero com EPERM e relatório completo recém-gerado é aceito
runTest('Proteção 5: Código não zero com EPERM de limpeza de temporários no Windows E relatório completo recém-gerado é aceito', () => {
  const stdout = 'Lighthouse finished generating report.';
  const stderrEpermCleanup = 'Error: EPERM: operation not permitted, unlink C:\\Users\\User\\AppData\\Local\\Temp\\lighthouse.12345\\scoped_dir_9876\\Default\\Preferences';

  const isTolerated = isToleratedEpermNonZeroExit(1, stdout, stderrEpermCleanup);
  if (process.platform === 'win32') {
    assert.strictEqual(isTolerated, true, 'EPERM de limpeza de arquivos temporários no Windows deve ser tolerado');
  }

  const base = path.join(tempDir, 'test-valid-fresh');
  const jsonPath = `${base}.report.json`;
  const auditStartTimeMs = Date.now() - 500;
  const freshReport = createValidReportJson({ fetchTime: new Date().toISOString() });
  fs.writeFileSync(jsonPath, JSON.stringify(freshReport, null, 2), 'utf-8');

  const validated = validateLighthouseReport(jsonPath, auditStartTimeMs);
  assert(validated, 'Relatório completo recém-gerado deve ser validado com sucesso');
  assert.strictEqual(validated.lighthouseVersion, '13.4.1');
  assert.strictEqual(validated.categories.performance.score, 0.98);
});

// Limpeza de diretório temporário de testes
try {
  fs.rmSync(tempDir, { recursive: true, force: true });
} catch {}

console.log('\n----------------------------------------------------------------');
console.log(`📊 Resultado dos testes: ${passedTests} passaram, ${failedTests} falharam.`);
console.log('----------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
}
