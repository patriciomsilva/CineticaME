# Plano de Implantação Segura — Cinética Materiais Elétricos

Este documento define as diretrizes técnicas, arquiteturais e operacionais para a implantação, publicação e operação segura do site institucional da **Cinética Materiais Elétricos**.

> **Princípio de Neutralidade e Segurança:**  
> Este plano foi elaborado de forma agnóstica a provedores específicos de hospedagem ou CDN. Nenhuma credencial, token, chave de API ou dado sensível deve ser registrado neste repositório. O processo prioriza disponibilidade contínua, integridade de dados e proteção rigorosa contra vulnerabilidades web.

---

## 1. Gestão de Ambientes

O ciclo de vida de implantação é estruturado em três ambientes isolados:

```
[Desenvolvimento Local] ---> [Homologação Privada / Staging] ---> [Produção]
   (npm run dev/build)         (Acesso restrito + noindex)        (Distribuição Estática)
```

### 1.1. Desenvolvimento Local (`localhost`)
* **Finalidade:** Implementação de funcionalidades, correções estilísticas e testes de componentes.
* **Execução:** Ambiente local do desenvolvedor (`Node.js` + Astro em modo dev/preview).
* **Dados e Mídia:** Utilização estrita de dados mockados e fixtures aprovadas. Proibido conectar ou transitar dados pessoais reais de clientes.
* **Acesso:** Restrito à máquina local do desenvolvedor.

### 1.2. Homologação Privada (*Staging / Preview*)
* **Finalidade:** Validação visual, funcional, responsiva e de conteúdo pela equipe interna e pelo cliente antes do lançamento.
* **Isolamento e Restrição:**
  * Proteção de acesso preferencial por autenticação (HTTP Basic Auth), controle de identidade ou restrição por lista de permissão de IPs/VPN, quando suportado pela plataforma de hospedagem.
  * O bloqueio de indexação via cabeçalho HTTP `X-Robots-Tag: noindex, nofollow` e meta tag `<meta name="robots" content="noindex, nofollow" />` atua exclusivamente como camada complementar contra rastreamento de buscadores, não substituindo o controle de acesso.
* **Critérios de Entrada:** Build local aprovado, validação de linting e ausência de erros no console.

### 1.3. Produção (*Production*)
* **Finalidade:** Servir o site institucional ao público final e aos clientes da empresa com alta disponibilidade e segurança.
* **Arquitetura:** Distribuição estática através de CDN/Edge ou servidor web estático configurado com terminação TLS/HTTPS e políticas adequadas de cache para assets compilados.
* **Indexação:** Habilitada exclusivamente após a conclusão de todos os gates de homologação e autorização expressa por escrito do cliente.

### 1.4. Critérios de Promoção entre Ambientes

| Transição | Critérios Obrigatórios de Liberação | Aprovador Responsável |
| :--- | :--- | :--- |
| **Dev &rarr; Homologação** | • Build estático sem erros (`npm run build`).<br>• Zero erros de validação estrutural e a11y.<br>• Branch intermediária revisada via Pull Request. | Responsável Técnico (`[PREENCHER]`) |
| **Homologação &rarr; Produção** | • [Formulário de Homologação](file:///c:/PROJETOS/CineticaME/Projeto/Formulario-Homologacao-Cliente.md) integralmente assinado pelo cliente.<br>• [Checklist de Lançamento](file:///c:/PROJETOS/CineticaME/Projeto/Checklist-Lancamento.md) com 100% dos gates críticos atendidos.<br>• Backup de zona DNS e testes de e-mail concluídos.<br>• Procedimento de rollback documentado e alinhado aos objetivos de RTO/RPO a definir e testar. | Gestão de Projeto / Cliente (`[PREENCHER]`) |

> [!IMPORTANT]
> **Proibição de Dados Sensíveis:** É expressamente vedado o uso de dados pessoais reais de terceiros, credenciais de produção ou informações bancárias/cadastrais confidenciais em ambientes de desenvolvimento ou homologação (LGPD - Lei 13.709/2018).

---

## 2. Processo de Build e Publicação

A esteira de publicação adota o modelo de Geração de Sites Estáticos (SSG), eliminando superfícies de ataque em tempo de execução no servidor (sem banco de dados SQL exposto, sem runtime dinâmico PHP/Node no host final).

### 2.1. Instalação e Compilação Reproduzível
1. **Instalação com Lockfile:**  
   Emprego exclusivo de instalação estrita com resolução determinística de dependências:
   ```bash
   npm ci
   ```
2. **Validações de Qualidade e Segurança Pré-Build:**
   * Verificação de integridade de dependências (`npm audit` ou ferramenta equivalente).
   * Verificação de sintaxe e padrões de código.
3. **Compilação Estática:**
   ```bash
   npm run build
   ```

### 2.2. Inspeção e Validação do Artefato (`dist/`)
Antes de qualquer publicação, o diretório `dist/` gerado deve ser inspecionado:
* Confirmação de ausência de arquivos sensíveis ou não intencionais (ex.: `.env`, `.git`, `.DS_Store`, arquivos de backup `.bak`, arquivos de configuração interna).
* Verificação da presença das páginas compiladas do escopo:
  * `dist/index.html` (Página inicial)
  * `dist/solucoes/index.html` (Página de soluções)
  * `dist/a-cinetica/index.html` (Página institucional A Cinética)
  * `dist/contato/index.html` (Página de contato)
  * `dist/privacidade/index.html` (Página legal de privacidade)
  * `dist/404.html` (Página institucional de erro 404 personalizada)
* Validação de integridade dos hashes de arquivos CSS e JS em `dist/_astro/`.

### 2.3. Estratégias de Publicação (Deploy Atômico e Hospedagem Estática Tradicional)
* **Deploy Atômico (quando suportado pela plataforma/CDN):** O novo build é transferido integralmente para uma versão/release isolada. Apenas após a integridade validada, o ponteiro de tráfego de produção é comutado para a nova versão, eliminando janelas de inconsistência entre HTML e assets.
* **Hospedagem Estática Tradicional (quando deploy atômico nativo não estiver disponível):** Adotar estratégias seguras de sincronização (como publicação em diretório versionado paralelo alternando links simbólicos/blue-green, ou sincronização cuidadosa com `rsync`/SFTP) para minimizar riscos de inconsistência temporária durante a transferência de arquivos.

### 2.4. Testes de Fumaça (*Smoke Tests*) Pós-Publicação
Imediatamente após a virada em produção, executar:
1. Requisição HTTP/HTTPS para a raiz e verificação de status `200 OK`.
2. Acesso direto a todas as rotas institucionais (`/solucoes`, `/a-cinetica`, `/contato`, `/privacidade`) e verificação de renderização completa com status `200 OK`.
3. Requisição a uma rota inexistente (ex.: `/rota-inexistente-teste`) e confirmação de resposta com status HTTP `404 Not Found` (nunca status `200 OK`), renderizando o conteúdo de `dist/404.html`.
4. Acesso direto a `/404.html` validando carregamento correto de estilos e assets.
5. Teste de carregamento de imagens e assets estáticos (sem erros no console).
6. Teste de canais de contato e links ativos (quando canais como WhatsApp ou formulários forem confirmados e implementados).

### 2.5. Registro de Versão e Rastreabilidade
Cada publicação em produção deve ser acompanhada de:
* Criação de uma tag Git anotada no repositório (ex.: `git tag -a v1.0.0 -m "Release 1.0.0 - Lancamento Oficial"`). Tags anotadas devem ser configuradas como protegidas contra deleção ou substituição assim que uma plataforma remota compatível estiver configurada.
* Registro em log interno com: Data/Hora UTC, Hash do commit publicado, Tag Git, Responsável pelo disparo e Link da evidência de homologação.

### 2.6. Diretrizes Mandatórias de Tratamento de Erro 404 na Hospedagem
O comportamento de tratamento de rotas não mapeadas varia conforme a plataforma de hospedagem ou servidor web adotado (ex.: Cloudflare Pages, Vercel, Netlify, AWS S3/CloudFront, Nginx, Apache). Após a definição e contratação do provedor final, as seguintes regras técnicas devem ser obrigatoriamente aplicadas:

1. **Configuração de Fallback para `404.html`:** O servidor ou CDN deve ser explicitamente configurado para servir o arquivo `/404.html` como página de erro padrão quando uma rota ou arquivo não existir.
2. **Status HTTP 404 Real (Prevenção de Soft-404):** A resposta enviada ao cliente ou rastreador para URLs inexistentes deve conter obrigatoriamente o cabeçalho `HTTP/1.1 404 Not Found` (ou equivalente HTTP/2 / HTTP/3), jamais status `200 OK`.
3. **Proibição de Roteamento SPA (*Single Page Application*):** Não utilizar regras de reescrita global (como `/* -> /index.html`), pois geram "soft-404" (status 200 para páginas inexistentes), degradando a indexação e a experiência do usuário.
4. **Validação de Teste em Produção:** Realizar teste automatizado e via cURL (`curl -I https://[DOMINIO]/rota-inexistente-teste`) após o deploy para confirmar o código `404`.
5. **Proteção contra Indexação:** Confirmar que a página 404 continue com a meta tag `noindex, nofollow` e que sua URL nunca conste em sitemaps XML oficiais.

---

## 3. Controle de Acesso e Segurança Operacional

O acesso aos painéis de hospedagem, registrador de domínio, DNS, e-mails e repositório de código deve seguir padrões rigorosos de segurança corporativa.

### 3.1. Princípios Mandatórios
* **Contas Individuais:** Cada colaborador ou prestador deve possuir sua própria conta nominal. É expressamente **proibido o uso de contas genéricas ou compartilhadas** (ex.: `admin@`, `ti@`, `contato@`).
* **Autenticação Multifator Obrigatória (MFA):** Todas as contas com acesso a qualquer camada de infraestrutura (Registrador de domínio, Provedor de DNS, Provedor de Hospedagem/CDN, Repositório Git) devem ter MFA ativado obrigatoriamente (preferencialmente via aplicativo TOTP autenticador ou chave física FIDO2/WebAuthn; evitar SMS quando possível).
* **Princípio do Privilégio Mínimo (Least Privilege):** Conceder estritamente as permissões necessárias para cada função (ex.: desenvolvedores possuem permissão de leitura/deploy em staging, apenas o responsável de infraestrutura possui permissão de alteração de DNS de produção).
* **Armazenamento Seguro de Códigos de Recuperação:** Códigos de recuperação e chaves de backup do MFA devem ser guardados em cofre de senhas corporativo criptografado gerenciado pela organização, nunca em arquivos de texto plano, Markdown ou repositórios Git.
* **Segurança de Segredos:** É terminantemente proibido comitar senhas, tokens de API, chaves privadas SSH ou credenciais no repositório.

### 3.2. Inventário de Acessos e Responsáveis

| Camada de Infraestrutura | Responsabilidade | Papel / Escopo | MFA Ativo | Responsável Nomeado |
| :--- | :--- | :--- | :---: | :--- |
| **Registrador de Domínio** | Titularidade e DNS Autorativo | Administrador Titular | `[SIM / OBRIGATÓRIO]` | `[PREENCHER: Nome/Cargo]` |
| **Zona DNS** | Apontamentos A/AAAA/CNAME/MX/TXT | Administrador DNS | `[SIM / OBRIGATÓRIO]` | `[PREENCHER: Nome/Cargo]` |
| **Hospedagem / CDN** | Provisionamento e Builds | Operador de Infra/Deploy | `[SIM / OBRIGATÓRIO]` | `[PREENCHER: Nome/Cargo]` |
| **Repositório Git** | Código-fonte e Versionamento | Mantenedor do Código | `[SIM / OBRIGATÓRIO]` | `[PREENCHER: Nome/Cargo]` |
| **E-mails Corporativos** | Administração de Caixas Postais | Administrador de E-mail | `[SIM / OBRIGATÓRIO]` | `[PREENCHER: Nome/Cargo]` |

### 3.3. Revisão e Desligamento
* Os acessos devem ser revisados formalmente a cada 90 dias.
* Em caso de desligamento de colaborador ou troca de fornecedor técnico, todas as credenciais e acessos individuais devem ser revogados no mesmo dia.

---

## 4. Matriz Preparatória de HTTPS e Cabeçalhos de Segurança

Todos os cabeçalhos de segurança devem ser configurados na borda (CDN / Web Server) para proteger os visitantes contra ataques como Clickjacking, MIME-confusion, Cross-Site Scripting (XSS) e vazamento de referenciadores.

### 4.1. Matriz de Cabeçalhos HTTP

| Cabeçalho | Objetivo de Segurança | Valor Inicial Recomendado | Dependências / Impactos | Risco de Configuração Incorreta | Como Validar | Como Reverter |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`Content-Security-Policy` (CSP)** | Restringe a origem de scripts, estilos, imagens e conexões, mitigando injeção de código (XSS). | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';` | Se forem incluídos scripts externos futuros (ex.: Tag Manager, Analytics), seus domínios devem ser declarados explicitamente na diretiva correspondente. | Bloqueio de renderização de estilos embutidos do Astro ou falha no carregamento de fontes/imagens se a diretiva for excessivamente restritiva. | Inspecionar painel *Console* do navegador (DevTools) buscando por erros `Refused to load... because it violates CSP`. Testar em `securityheaders.com`. | Relaxar ou ajustar a diretiva correspondente no arquivo de cabeçalhos do host/CDN e republicar. |
| **`Strict-Transport-Security` (HSTS)** | Força o navegador a se comunicar com o domínio exclusivamente via HTTPS, prevenindo ataques Man-in-the-Middle (MITM) e downgrade de protocolo. | `max-age=300; includeSubDomains` *(Fase inicial de testes)* evoluindo para `max-age=31536000; includeSubDomains` *(Produção estável)*. | **Requisito mandatório:** HTTPS deve estar 100% configurado, válido e estável em todos os subdomínios antes de aumentar o `max-age`. | Se ativado antes de o certificado SSL estar funcional em todos os subdomínios, o acesso do usuário ao site ou subdomínios pode ficar bloqueado no navegador até a expiração do cache. | `curl -I https://[DOMINIO_OFICIAL]` e verificar se o cabeçalho `Strict-Transport-Security` está presente na resposta. | Reduzir `max-age=0` na CDN caso haja falha crítica na emissão do certificado. |
| **`X-Content-Type-Options`** | Impede que o navegador tente adivinhar o tipo MIME de um arquivo (*MIME-sniffing*), forçando o respeito ao `Content-Type` enviado. | `nosniff` | Nenhuma dependência externa. O servidor deve servir arquivos com o `Content-Type` correto (ex.: `text/css`, `application/javascript`). | Arquivos estáticos com tipo MIME configurado incorretamente pelo servidor podem ser bloqueados pelo navegador. | Verificar cabeçalho via cURL: `curl -I https://[DOMINIO_OFICIAL] \| grep X-Content-Type-Options`. | Remover o cabeçalho no arquivo de configuração do host (raramente necessário). |
| **`Referrer-Policy`** | Controla quanta informação de referência (URL de origem) é enviada quando um usuário clica em um link externo (ex.: canais de contato ou links externos). | `strict-origin-when-cross-origin` | Nenhuma dependência. Compatível com todos os navegadores modernos. | Enviar `no-referrer` pode impedir análises de origem de tráfego; enviar `unsafe-url` pode vazar parâmetros internos. O valor recomendado oferece o equilíbrio ideal de privacidade e compatibilidade. | Inspecionar cabeçalho de requisição ao clicar em links externos ou via DevTools Network. | Alterar o valor para `same-origin` ou `origin-when-cross-origin` na configuração de cabeçalhos. |
| **`Permissions-Policy`** | Desativa o acesso do navegador a recursos de hardware sensíveis (câmera, microfone, geolocalização, etc.) que o site não utiliza. | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=()` | Nenhuma dependência (o site da Cinética ME não faz uso de hardware local do visitante). | Bloqueio acidental de funcionalidades se um recurso necessário for desativado indevidamente no futuro. | Inspecionar cabeçalho de resposta via DevTools Network ou `securityheaders.com`. | Adicionar a permissão necessária à lista no cabeçalho (ex.: `geolocation=(self)`). |
| **Proteção contra Framing (`X-Frame-Options` e CSP `frame-ancestors`)** | Impede que o site seja incorporado em `<frame>`, `<iframe>` ou `<embed>` por outros sites, prevenindo ataques de Clickjacking. | `X-Frame-Options: DENY` (ou `SAMEORIGIN` se houver necessidade de preview interno) e CSP `frame-ancestors 'none'`. | Nenhuma dependência externa. | Se o site precisar ser exibido em um portal parceiro via iframe no futuro, a diretiva bloqueará essa exibição até ser reconfigurada. | Testar embedding criando um arquivo HTML local simples com `<iframe src="https://[DOMINIO_OFICIAL]"></iframe>` e verificar o bloqueio no console. | Alterar para `X-Frame-Options: SAMEORIGIN` ou atualizar a diretiva `frame-ancestors` com a URL autorizada. |

### 4.2. Diretriz Explícita sobre HSTS Preload
> [!CAUTION]
> **NÃO ATIVAR HSTS PRELOAD NESTA FASE:**  
> A diretiva `preload` no cabeçalho HSTS e o envio do domínio para a lista de pré-carregamento dos navegadores (`hstspreload.org`) **NÃO devem ser realizados nesta fase**.  
> O registro no HSTS Preload é praticamente irreversível no curto prazo e torna impossível qualquer comunicação HTTP em qualquer subdomínio do domínio raiz.  
> O HSTS Preload só poderá ser avaliado no futuro, após no mínimo 6 meses de operação contínua com HTTPS 100% estável em toda a infraestrutura da empresa.

---

## 5. Monitoramento, Observabilidade e Recuperação

A operação contínua do site deve ser respaldada por rotinas de monitoramento preventivo e procedimentos claros de resposta a incidentes.

### 5.1. Monitoramento Contínuo
1. **Monitoramento de Disponibilidade (Uptime Synthetic Check):**
   * Verificação periódica automatizada (intervalo de 1 a 5 minutos) via requisição HTTP/HTTPS contra o endpoint raiz.
   * Alerta imediato para a equipe técnica caso o status retornado seja diferente de `200 OK` por mais de 2 checagens consecutivas.
2. **Monitoramento de Certificado TLS/SSL:**
   * Monitoramento contínuo da data de expiração do certificado digital.
   * Emissão de alertas com antecedência mínima de **30 dias** e **15 dias** caso a renovação automática falhe.
3. **Monitoramento de Erros e Tráfego:**
   * Acompanhamento de taxas de erro `4xx` (recursos não encontrados) e `5xx` (falhas de infraestrutura) através dos relatórios de tráfego da CDN/Hospedagem.

### 5.2. Política de Backups e Retenção
* **Backup de Configuração:** Todas as regras de redirecionamento, cabeçalhos de segurança e configurações de CDN devem ser versionadas em código (IaC ou arquivos de configuração no repositório Git).
* **Backup dos Artefatos de Build:** O arquivo comprimido (`.zip` / `.tar.gz`) do diretório `dist/` correspondente a cada tag Git de produção deve ser arquivado em armazenamento seguro por no mínimo 12 meses.
* **Teste de Restauração:** A cada 6 meses, a equipe técnica deve realizar um teste simulado de restauração a partir do artefato arquivado em um ambiente de homologação limpo para validar a reprodutibilidade.

### 5.3. Processo de Tratamento de Incidentes

```
[Detecção do Incidente]
          |
          v
[1. Triagem e Severidade] ---> [Crítico: Indisponibilidade total / Falha de segurança]
          |                   [Médio: Falha de renderização / Link quebrado]
          v
[2. Contenção Imediata] -----> Se Crítico: Acionar Procedimento de Rollback
          |
          v
[3. Análise de Causa Raiz] ---> Reprodução em ambiente local / Correção em hotfix
          |
          v
[4. Validação em Staging] ---> Testes completos antes da republicação
          |
          v
[5. Pós-Mortem e Registro] ---> Documentação do ocorrido e melhoria contínua
```

### 5.4. Procedimento Operacional de Rollback e Metas de Recuperação

Os objetivos de tempo de recuperação (RTO - *Recovery Time Objective*) e ponto de recuperação (RPO - *Recovery Point Objective*) devem ser formalmente definidos e testados em simulações de contingência conforme a infraestrutura contratada.

O procedimento de reversão depende diretamente da plataforma de hospedagem utilizada:

1. **Rollback via Plataforma de Hospedagem / CDN (quando suportado):**
   * Acessar o histórico de deploys no painel do provedor de hospedagem/CDN.
   * Identificar o deploy anterior estável.
   * Acionar a opção de reversão/redeploy para restabelecer a versão anterior.
2. **Rollback via Repositório Git / Pipeline de Build (Alternativo):**
   * Identificar o commit/tag da última versão estável:
     ```bash
     git checkout tags/[TAG_ESTAVEL_ANTERIOR]
     ```
   * Reexecutar o build limpo:
     ```bash
     npm ci
     npm run build
     ```
   * Publicar o artefato compilado para o ambiente de produção.
3. **Rollback em Hospedagem Estática Tradicional:**
   * Alternar o ponteiro/symlink para a versão estável anterior ou reenviar o artefato arquivado da última publicação válida.
4. **Validação Pós-Rollback:**
   * Executar os testes de fumaça para confirmar o restabelecimento da operação normal.
   * Notificar os responsáveis sobre a conclusão do procedimento.

### 5.5. Matriz de Escalonamento e Contatos Internos

| Nível de Escalonamento | Papel / Função | Responsabilidade | Contato de Emergência |
| :--- | :--- | :--- | :--- |
| **Nível 1 (Operação/Plantão)** | Engenheiro de Deploy / QA | Triagem inicial e execução do rollback | `[PREENCHER: Nome / Tel / E-mail]` |
| **Nível 2 (Infraestrutura)** | Responsável DevOps / DNS | Intervenção em zona DNS, CDN e certificados | `[PREENCHER: Nome / Tel / E-mail]` |
| **Nível 3 (Gestão / Cliente)** | Gerente de Projeto / Titular | Comunicação executiva e autorizações excepcionais | `[PREENCHER: Nome / Tel / E-mail]` |
