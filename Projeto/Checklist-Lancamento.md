# Checklist Interno de Lançamento — Cinética Materiais Elétricos

Este documento estabelece o roteiro técnico e operacional rigoroso para a validação, implantação, publicação e pós-lançamento do site da **Cinética Materiais Elétricos**.

> **Regra Crítica de Indexação e Publicação:**  
> **A liberação da indexação por motores de busca (Google, Bing, etc.), a publicação em produção e a remoção de barreiras de acesso SÓ PODERÃO SER REALIZADAS após a confirmação integral do domínio oficial, preenchimento do formulário de homologação, validação dos dados jurídicos e autorização formal por escrito do cliente.**

## Documentos de Referência Operacional
* [Formulário de Homologação do Cliente](file:///c:/PROJETOS/CineticaME/Projeto/Formulario-Homologacao-Cliente.md) — Coleta cadastral, validação de escopo e termo de aprovação formal.
* [Plano de Implantação Segura](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md) — Gestão de ambientes, esteira SSG atômica, controle de acesso MFA, matriz de cabeçalhos e rollback.
* [Plano de Gestão de DNS e Proteção de E-mail](file:///c:/PROJETOS/CineticaME/Projeto/Plano-DNS-Email.md) — Inventário de zona, blindagem de e-mail corporativo, SPF/DKIM/DMARC, sequência operacional de 10 passos e canonicalização.

---

## Gates Obrigatórios de Mudança para Produção (Go / No-Go)

A publicação em produção e a virada de tráfego só estão autorizadas após o cumprimento integral dos 10 gates obrigatórios abaixo:

| Gate | Critério Obrigatório | Plano de Referência | Status | Responsável | Evidência Exigida |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **G-01** | **Backup da Zona DNS** | [Plano DNS/E-mail (Seção 1)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-DNS-Email.md#1-inventário-obrigatório-pré-mudança) | `[ ] Pendente` | Administrador DNS | Exportação do arquivo de zona / tabela de registros |
| **G-02** | **Validação dos Registros de E-mail** | [Plano DNS/E-mail (Seção 2)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-DNS-Email.md#2-proteção-absoluta-do-serviço-de-e-mail) | `[ ] Pendente` | Administrador de E-mail | Registros MX e TXT (SPF/DKIM/DMARC) preservados |
| **G-03** | **Plano de Rollback Aprovado** | [Plano Implantação (Seção 5)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md#54-procedimento-operacional-de-rollback-e-metas-de-recuperação) | `[ ] Pendente` | DevOps / Plantão | Ponto de restauração definido e metas de RTO/RPO alinhadas |
| **G-04** | **HTTPS e Certificado Válido** | [Plano Implantação (Seção 4)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md#4-matriz-preparatória-de-https-e-cabeçalhos-de-segurança) | `[ ] Pendente` | DevOps | Certificado SSL ativo cobrindo apex e www |
| **G-05** | **Cabeçalhos de Segurança Testados** | [Plano Implantação (Seção 4)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md#41-matriz-de-cabeçalhos-http) | `[ ] Pendente` | Segurança / QA | CSP, X-Content-Type, Referrer, Permissions e Frame |
| **G-06** | **Domínio Canônico Definido** | [Plano DNS/E-mail (Seção 5)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-DNS-Email.md#5-canonicalização-e-estratégia-de-domínio) | `[ ] Pendente` | SEO / DevOps | Redirect 301 ativo e tag canonical consistente |
| **G-07** | **Conteúdo Homologado pelo Cliente** | [Formulário Homologação](file:///c:/PROJETOS/CineticaME/Projeto/Formulario-Homologacao-Cliente.md) | `[ ] Pendente` | Gestão / Cliente | Formulário assinado sem dados fictícios |
| **G-08** | **Autorização para Liberar Indexação** | [Formulário (Seção 6)](file:///c:/PROJETOS/CineticaME/Projeto/Formulario-Homologacao-Cliente.md#6-termo-de-homologação-e-autorização-de-lançamento) | `[ ] Pendente` | Gestão / Cliente | Autorização expressa por escrito do titular |
| **G-09** | **Testes de Fumaça Pós-Publicação** | [Plano Implantação (Seção 2)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md#24-testes-de-fumaça-smoke-tests-pós-publicação) | `[ ] Pendente` | QA | Status 200 em rotas, resposta 404 apropriada e canais ativos testados |
| **G-10** | **Confirmação de Envio/Recebimento de E-mail** | [Plano DNS/E-mail (Seção 2)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-DNS-Email.md#22-protocolo-de-testes-bidirecionais-de-e-mail) | `[ ] Pendente` | QA / Administrador | Teste bidirecional interno/externo com SPF/DKIM pass |

---

## 1. Dados do Cliente e Identificação Institucional

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 1.1 | Razão Social e CNPJ validados | `[ ] Pendente` | `A definir` | `Formulário homologado` | `__/__/202_` | Exigido para rodapé e política |
| 1.2 | Endereço físico completo e CEP validados | `[ ] Pendente` | `A definir` | `Formulário homologado` | `__/__/202_` | Morro da Fumaça - SC |
| 1.3 | Horário oficial de atendimento validado | `[ ] Pendente` | `A definir` | `Formulário homologado` | `__/__/202_` | Balcão e suporte |
| 1.4 | WhatsApp comercial e mensagem inicial testados | `[ ] Pendente` | `A definir` | `Teste de acionamento` | `__/__/202_` | Quando canais forem confirmados formalmente |
| 1.5 | Telefone fixo e e-mails comerciais confirmados | `[ ] Pendente` | `A definir` | `Teste de recebimento` | `__/__/202_` | Apenas e-mails oficiais ativos |
| 1.6 | Redes sociais oficiais verificadas | `[ ] Pendente` | `A definir` | `Links testados` | `__/__/202_` | Instagram e perfis oficiais |

---

## 2. Conteúdo e Comunicação Institucional

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 2.1 | História, ano de fundação e valores validados | `[ ] Pendente` | `A definir` | `Aprovação do cliente` | `__/__/202_` | Sem dados fictícios |
| 2.2 | Diferenciais e linhas de materiais confirmados | `[ ] Pendente` | `A definir` | `Tabela do formulário` | `__/__/202_` | Apenas serviços oferecidos |
| 2.3 | Acervo fotográfico autorizado formalmente | `[ ] Pendente` | `A definir` | `Termo de homologação` | `__/__/202_` | Loja, equipe e fachada |
| 2.4 | Ausência de produtos/marcas não autorizadas | `[ ] Concluído` | `Desenvolvimento` | `Inspeção de código` | `13/09/2026` | Catálogo reservado para Fase 2 |
| 2.5 | Ausência de obras sem termo de consentimento | `[ ] Concluído` | `Desenvolvimento` | `Inspeção de código` | `13/09/2026` | Seção isolada para Fase 2 |
| 2.6 | Revisão gramatical e ortográfica em PT-BR | `[ ] Pendente` | `A definir` | `Revisão textual` | `__/__/202_` | Português brasileiro claro |

---

## 3. Domínio e DNS
*Procedimento detalhado:* [Plano de Gestão de DNS e Proteção de E-mail](file:///c:/PROJETOS/CineticaME/Projeto/Plano-DNS-Email.md)

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 3.1 | Domínio oficial registrado e titularidade confirmada | `[ ] Pendente` | `A definir` | `Whois / Registro.br` | `__/__/202_` | Titularidade confirmada |
| 3.2 | Backup completo da zona DNS antes da alteração | `[ ] Pendente` | `Administrador DNS` | `Arquivo de zona exportado` | `__/__/202_` | Obrigatório (Gate G-01) |
| 3.3 | Redução prévia de TTL executada | `[ ] Pendente` | `Administrador DNS` | `Consulta dig/nslookup` | `__/__/202_` | TTL reduzido (ex. 300s ou mín. suportado) |
| 3.4 | Apontamentos DNS do site (A / AAAA / CNAME) aplicados | `[ ] Pendente` | `Administrador DNS` | `Consulta dig / nslookup` | `__/__/202_` | Sem tocar em MX/TXT |
| 3.5 | Redirecionamento canônico configurado (apex/www) | `[ ] Pendente` | `DevOps` | `cURL HTTP 301` | `__/__/202_` | Obrigatório (Gate G-06) |
| 3.6 | Restauração de TTL de produção após estabilidade | `[ ] Pendente` | `Administrador DNS` | `Consulta dig/nslookup` | `__/__/202_` | TTL operacional pós-validação |

---

## 4. E-mails e Entregabilidade
*Procedimento detalhado:* [Plano de Gestão de DNS e Proteção de E-mail (Seção 2 e 3)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-DNS-Email.md#2-proteção-absoluta-do-serviço-de-e-mail)

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 4.1 | Registros MX preservados integralmente | `[ ] Pendente` | `Administrador DNS` | `Consulta DNS MX` | `__/__/202_` | Obrigatório (Gate G-02) |
| 4.2 | Registro SPF unificado sem duplicação (RFC 7208) | `[ ] Pendente` | `Administrador de E-mail` | `Validador SPF / dig TXT` | `__/__/202_` | Apenas 1 registro TXT |
| 4.3 | Registros DKIM mantidos e funcionais | `[ ] Pendente` | `Administrador de E-mail` | `Consulta seletor DKIM` | `__/__/202_` | Chave pública intacta |
| 4.4 | Política DMARC inicial configurada | `[ ] Pendente` | `Administrador de E-mail` | `Consulta TXT _dmarc` | `__/__/202_` | Estratégia inicial (ex.: p=none) |
| 4.5 | Teste bidirecional de envio e recebimento de e-mail | `[ ] Pendente` | `QA / Administrador` | `Log de entrega / Headers` | `__/__/202_` | Obrigatório (Gate G-10) |
| 4.6 | Destinatários de formulários/orçamentos ativos | `[ ] Pendente` | `A definir` | `Teste de entrega` | `__/__/202_` | Caixa de entrada monitorada |

---

## 5. Hospedagem e Infraestrutura
*Procedimento detalhado:* [Plano de Implantação Segura (Seção 1 e 2)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md)

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 5.1 | Ambiente de produção provisionado para publicação estática | `[ ] Pendente` | `DevOps` | `Painel do Provedor / CDN` | `__/__/202_` | Deploy atômico ou esteira estática segura |
| 5.2 | Pipeline de build estático reproduzível (`npm ci && npm run build`) | `[ ] Concluído` | `Desenvolvimento` | `Build log sem erros` | `13/09/2026` | Astro SSG puro |
| 5.3 | Inspeção do artefato `dist/` (sem arquivos sensíveis ou mapas de debug) | `[ ] Pendente` | `DevOps / QA` | `Relatório de inspeção` | `__/__/202_` | Ausência de `.env` |
| 5.4 | Compressão de recursos (Gzip / Brotli) ativa | `[ ] Pendente` | `DevOps` | `Response headers` | `__/__/202_` | Otimização de tráfego |
| 5.5 | Cache estático de assets configurado com imutabilidade | `[ ] Pendente` | `DevOps` | `Cache-Control headers` | `__/__/202_` | Hash de assets Astro |

---

## 6. HTTPS e Cabeçalhos de Segurança
*Procedimento detalhado:* [Matriz de Cabeçalhos no Plano de Implantação](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md#4-matriz-preparatória-de-https-e-cabeçalhos-de-segurança)

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 6.1 | Certificado SSL/TLS válido cobrindo apex e www | `[ ] Pendente` | `DevOps` | `SSL Labs rating A/A+` | `__/__/202_` | Obrigatório (Gate G-04) |
| 6.2 | Forçamento de HTTPS em todas as rotas (HTTP &rarr; HTTPS) | `[ ] Pendente` | `DevOps` | `cURL redirect 301` | `__/__/202_` | Sem conteúdo misto |
| 6.3 | Cabeçalho `Strict-Transport-Security` (HSTS sem preload) | `[ ] Pendente` | `DevOps` | `Response header check` | `__/__/202_` | max-age inicial curto |
| 6.4 | Cabeçalho `X-Content-Type-Options: nosniff` | `[ ] Pendente` | `DevOps` | `Response header check` | `__/__/202_` | Prevenção MIME sniffing |
| 6.5 | Proteção contra Framing (`X-Frame-Options` e CSP `frame-ancestors`) | `[ ] Pendente` | `DevOps` | `Response header check` | `__/__/202_` | Proteção clickjacking |
| 6.6 | Cabeçalho `Referrer-Policy: strict-origin-when-cross-origin` | `[ ] Pendente` | `DevOps` | `Response header check` | `__/__/202_` | Privacidade no tráfego |
| 6.7 | Cabeçalho `Permissions-Policy` configurado | `[ ] Pendente` | `DevOps` | `Response header check` | `__/__/202_` | Recursos sensíveis off |
| 6.8 | Content Security Policy (CSP) validado no console | `[ ] Pendente` | `DevOps / QA` | `Console sem violações` | `__/__/202_` | Obrigatório (Gate G-05) |

---

## 7. Privacidade, Proteção de Dados e LGPD

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 7.1 | Política de Privacidade publicada e atualizada | `[ ] Pendente` | `A definir` | `URL /politica-de-privacidade` | `__/__/202_` | Dados societários reais |
| 7.2 | Canal de contato do titular / DPO especificado | `[ ] Pendente` | `A definir` | `E-mail de privacidade visível` | `__/__/202_` | Conforme LGPD Art. 41 |
| 7.3 | Princípio da necessidade e coleta mínima | `[ ] Concluído` | `Desenvolvimento` | `Revisão de fluxos` | `13/09/2026` | Sem campos desnecessários |
| 7.4 | Termos de uso e avisos legais em conformidade | `[ ] Pendente` | `A definir` | `Revisão jurídica` | `__/__/202_` | CDC e LGPD |

---

## 8. SEO Técnico e Metadados

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 8.1 | Tags `<title>` e `<meta description>` únicas | `[ ] Pendente` | `Desenvolvimento` | `Auditoria de metadados` | `__/__/202_` | Textos específicos por página |
| 8.2 | Tag `canonical` com domínio oficial absoluto | `[ ] Pendente` | `Desenvolvimento` | `Inspecionar head HTML` | `__/__/202_` | Somente após domínio oficial |
| 8.3 | Open Graph e Twitter Cards configurados | `[ ] Pendente` | `Desenvolvimento` | `Facebook/Twitter debugger` | `__/__/202_` | Imagem `og:image` com URL absoluta |
| 8.4 | Arquivo `robots.txt` configurado para produção | `[ ] Pendente` | `Desenvolvimento` | `Acesso /robots.txt` | `__/__/202_` | Liberação somente pós-aprovação |
| 8.5 | Arquivo `sitemap.xml` gerado com URLs absolutas | `[ ] Pendente` | `Desenvolvimento` | `Validação de sitemap` | `__/__/202_` | Somente após domínio oficial |
| 8.6 | Dados Estruturados Schema.org (`LocalBusiness`) | `[ ] Pendente` | `Desenvolvimento` | `Google Rich Results Test` | `__/__/202_` | JSON-LD com endereço e CNPJ |
| 8.7 | Favicons e Web App Manifest em conformidade | `[ ] Concluído` | `Desenvolvimento` | `Inspeção de assets` | `13/09/2026` | SVG, PNG 192/512, ICO |

---

## 9. Analytics e Gestão de Consentimento

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 9.1 | Ferramenta de analytics autorizada formalmente | `[ ] Pendente` | `A definir` | `Formulário homologado` | `__/__/202_` | Não carregar rastreadores sem aval |
| 9.2 | Carregamento condicional ao consentimento (se houver cookies) | `[ ] Pendente` | `Desenvolvimento` | `Inspecionar cookies no navegador` | `__/__/202_` | Bloqueio prévio de scripts |
| 9.3 | Rastreamento de conversões (quando canais existirem) | `[ ] Pendente` | `Desenvolvimento` | `Disparo de eventos no teste` | `__/__/202_` | Apenas se houver rastreadores autorizados |

---

## 10. Testes Funcionais

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 10.1 | Todos os links internos e de menu funcionais | `[ ] Pendente` | `QA` | `Varredura de links (crawler)` | `__/__/202_` | Zero links quebrados (404) |
| 10.2 | Links de WhatsApp e canais de contato funcionais | `[ ] Pendente` | `QA` | `Teste de acionamento` | `__/__/202_` | Testar quando recursos forem confirmados |
| 10.3 | Página 404 personalizada e funcional | `[ ] Pendente` | `Desenvolvimento / QA` | `Acesso a rota inexistente` | `__/__/202_` | A implementar quando definida no escopo |
| 10.4 | Comportamento de navegação mobile (menu drawer/hamburger) | `[ ] Concluído` | `QA` | `Teste interativo touch` | `13/09/2026` | Abertura/fechamento fluido |

---

## 11. Testes Visuais e Cross-Browser

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 11.1 | Layout responsivo em Mobile (320px, 375px, 414px) | `[ ] Concluído` | `Design / QA` | `Emulação e aparelhos reais` | `13/09/2026` | Sem overflow horizontal |
| 11.2 | Layout em Tablets (768px, 1024px) | `[ ] Concluído` | `Design / QA` | `Emulação e aparelhos reais` | `13/09/2026` | Grid estável |
| 11.3 | Layout em Desktop (1280px, 1440px, 1920px) | `[ ] Concluído` | `Design / QA` | `Navegadores desktop` | `13/09/2026` | Tipografia e respiro corretos |
| 11.4 | Compatibilidade Chrome, Safari, Firefox, Edge | `[ ] Pendente` | `QA` | `Cross-browser screenshots` | `__/__/202_` | Renderização consistente |

---

## 12. Acessibilidade (a11y)

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 12.1 | Contraste de cores em conformidade WCAG AA (>= 4.5:1) | `[ ] Concluído` | `Desenvolvimento` | `Lighthouse / axe DevTools` | `13/09/2026` | Textos sobre azul/laranja |
| 12.2 | Navegação completa por teclado (Tab, Enter, Space) | `[ ] Concluído` | `QA` | `Teste de foco visual` | `13/09/2026` | Indicadores de foco visíveis |
| 12.3 | Textos alternativos (`alt`) em todas as imagens informativas | `[ ] Concluído` | `Desenvolvimento` | `Inspeção HTML` | `13/09/2026` | Descrições contextuais |
| 12.4 | Hierarquia semântica de cabeçalhos (`h1` -> `h6`) | `[ ] Concluído` | `Desenvolvimento` | `Validação de estrutura` | `13/09/2026` | 1 h1 por página |
| 12.5 | Atributos ARIA corretos em elementos interativos | `[ ] Concluído` | `Desenvolvimento` | `Inspeção de componentes` | `13/09/2026` | `aria-expanded`, `aria-label` |

---

## 13. Performance e Core Web Vitals

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 13.1 | Formatos modernos de imagem (WebP / AVIF) | `[ ] Concluído` | `Desenvolvimento` | `Astro Image pipeline` | `13/09/2026` | Otimização automática |
| 13.2 | Dimensões explícitas `width`/`height` nas imagens | `[ ] Concluído` | `Desenvolvimento` | `Inspeção HTML` | `13/09/2026` | Prevenção de CLS |
| 13.3 | Largest Contentful Paint (LCP) < 2.5s | `[ ] Concluído` | `Desenvolvimento` | `Lighthouse audit` | `13/09/2026` | Imagem de hero priorizada |
| 13.4 | Cumulative Layout Shift (CLS) < 0.1 | `[ ] Concluído` | `Desenvolvimento` | `Lighthouse audit` | `13/09/2026` | Layout estável |
| 13.5 | First Input Delay / Interaction to Next Paint (INP) < 200ms | `[ ] Concluído` | `Desenvolvimento` | `Lighthouse audit` | `13/09/2026` | JavaScript mínimo |

---

## 14. Backup, Versionamento e Recuperação

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 14.1 | Repositório Git com histórico limpo e branch estável | `[ ] Concluído` | `Desenvolvimento` | `git status / log` | `13/09/2026` | Main travada e testada |
| 14.2 | Backup local de acervo histórico íntegro | `[ ] Concluído` | `Desenvolvimento` | `Verificação de integridade` | `13/09/2026` | `.git-bloated-backup` |
| 14.3 | Procedimento de build reprodutível em ambiente limpo | `[ ] Concluído` | `Desenvolvimento` | `npm run build` | `13/09/2026` | Zero erros |

---

## 15. Publicação em Produção
*Procedimento detalhado:* [Plano de Implantação Segura (Seção 2)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md#2-processo-de-build-e-publicação)

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 15.1 | Formulário de Homologação assinado pelo cliente | `[ ] Pendente` | `A definir` | `Documento assinado` | `__/__/202_` | Bloqueador (Gate G-07) |
| 15.2 | Autorização expressa para desativar noindex | `[ ] Pendente` | `Gestão / Cliente` | `Termo assinado` | `__/__/202_` | Bloqueador (Gate G-08) |
| 15.3 | Publicação final para o ambiente de produção | `[ ] Pendente` | `DevOps` | `Deploy log com sucesso` | `__/__/202_` | Deploy atômico ou esteira estática |
| 15.4 | Teste de fumaça (Smoke Test) pós-deploy | `[ ] Pendente` | `QA` | `Navegação completa em prod` | `__/__/202_` | Obrigatório (Gate G-09) |
| 15.5 | Verificação de certificado SSL ativo em produção | `[ ] Pendente` | `DevOps` | `Cadeado verde no navegador` | `__/__/202_` | HTTPS sem avisos |

---

## 16. Monitoramento Pós-Lançamento
*Procedimento detalhado:* [Plano de Implantação Segura (Seção 5)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md#5-monitoramento-observabilidade-e-recuperação)

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 16.1 | Monitoramento de uptime configurado (HTTP ping sintético) | `[ ] Pendente` | `DevOps` | `Painel de monitoramento` | `__/__/202_` | Alerta de indisponibilidade |
| 16.2 | Monitoramento de erros de tráfego e status 4xx/5xx | `[ ] Pendente` | `DevOps` | `Log de acessos da CDN` | `__/__/202_` | Acompanhamento 48h |
| 16.3 | Envio de sitemap no Google Search Console | `[ ] Pendente` | `SEO` | `Painel GSC` | `__/__/202_` | Apenas após domínio e homologação |

---

## 17. Plano de Rollback e Contingência
*Procedimento detalhado:* [Plano de Implantação Segura (Seção 5.4)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-Implantacao-Segura.md#54-procedimento-operacional-de-rollback-e-metas-de-recuperação) e [Plano de DNS (Passo 10)](file:///c:/PROJETOS/CineticaME/Projeto/Plano-DNS-Email.md#passo-10-procedimento-de-rollback-de-dns-se-necessário)

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 17.1 | Tag Git anotada criada e protegida | `[ ] Pendente` | `Desenvolvimento` | `git tag v1.0.0` | `__/__/202_` | Proteção em remote compatível |
| 17.2 | Procedimento de contingência e rollback testado | `[ ] Pendente` | `DevOps` | `Plano de contingência` | `__/__/202_` | Alinhado a RTO/RPO definidos |
| 17.3 | Matriz de escalonamento e contatos de emergência atualizada | `[ ] Pendente` | `Gestão` | `Matriz de escalonamento` | `__/__/202_` | Acionamento imediato |
