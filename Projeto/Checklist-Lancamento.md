# Checklist Interno de Lançamento — Cinética Materiais Elétricos

Este documento estabelece o roteiro técnico e operacional rigoroso para a validação, implantação, publicação e pós-lançamento do site da **Cinética Materiais Elétricos**.

> **Regra Crítica de Indexação e Publicação:**  
> **A liberação da indexação por motores de busca (Google, Bing, etc.), a publicação em produção e a remoção de barreiras de acesso SÓ PODERÃO SER REALIZADAS após a confirmação integral do domínio oficial, preenchimento do formulário de homologação, validação dos dados jurídicos e autorização formal por escrito do cliente.**

---

## 1. Dados do Cliente e Identificação Institucional

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 1.1 | Razão Social e CNPJ validados | `[ ] Pendente` | `A definir` | `Formulário homologado` | `__/__/202_` | Exigido para rodapé e política |
| 1.2 | Endereço físico completo e CEP validados | `[ ] Pendente` | `A definir` | `Formulário homologado` | `__/__/202_` | Morro da Fumaça - SC |
| 1.3 | Horário oficial de atendimento validado | `[ ] Pendente` | `A definir` | `Formulário homologado` | `__/__/202_` | Balcão e suporte |
| 1.4 | WhatsApp comercial e mensagem inicial testados | `[ ] Pendente` | `A definir` | `Teste de clique e envio` | `__/__/202_` | Link wa.me com DDD correto |
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

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 3.1 | Domínio oficial registrado e ativo | `[ ] Pendente` | `A definir` | `Whois / Registro.br` | `__/__/202_` | Titularidade confirmada |
| 3.2 | Apontamentos DNS (A / AAAA / CNAME) configurados | `[ ] Pendente` | `A definir` | `Consulta dig / nslookup` | `__/__/202_` | TTL adequado |
| 3.3 | Redirecionamento canônico configurado (apex/www) | `[ ] Pendente` | `A definir` | `cURL HTTP 301` | `__/__/202_` | www -> non-www ou vice-versa |
| 3.4 | Propagação de DNS monitorada | `[ ] Pendente` | `A definir` | `DNS checker global` | `__/__/202_` | Estabilidade global |

---

## 4. E-mails e Entregabilidade

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 4.1 | Registros MX preservados e funcionais | `[ ] Pendente` | `A definir` | `Teste de envio/recebimento` | `__/__/202_` | Não impactar e-mails corporativos |
| 4.2 | Registros SPF, DKIM e DMARC validados | `[ ] Pendente` | `A definir` | `Validador DNS / Mail-tester` | `__/__/202_` | Proteção contra spoofing |
| 4.3 | Destinatários de formulários/orçamentos ativos | `[ ] Pendente` | `A definir` | `Teste de entrega` | `__/__/202_` | Caixa de entrada monitorada |

---

## 5. Hospedagem e Infraestrutura

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 5.1 | Ambiente de produção provisionado | `[ ] Pendente` | `A definir` | `URL de produção ativa` | `__/__/202_` | Edge / CDN / Servidor |
| 5.2 | Pipeline de build estático automatizado | `[ ] Pendente` | `A definir` | `Build log sem erros` | `__/__/202_` | Astro SSG build |
| 5.3 | Compressão de recursos (Gzip / Brotli) ativa | `[ ] Pendente` | `A definir` | `Response headers` | `__/__/202_` | Otimização de tráfego |
| 5.4 | Cache estático de assets configurado | `[ ] Pendente` | `A definir` | `Cache-Control headers` | `__/__/202_` | Imutabilidade para hashes |

---

## 6. HTTPS e Cabeçalhos de Segurança

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 6.1 | Certificado SSL/TLS válido e renovação auto | `[ ] Pendente` | `A definir` | `SSL Labs rating A/A+` | `__/__/202_` | Let's Encrypt / Cloudflare |
| 6.2 | Forçamento de HTTPS em todas as rotas | `[ ] Pendente` | `A definir` | `Redirecionamento HTTP->HTTPS` | `__/__/202_` | Sem conteúdo misto |
| 6.3 | Cabeçalho `Strict-Transport-Security` (HSTS) | `[ ] Pendente` | `A definir` | `Response header check` | `__/__/202_` | max-age=31536000 |
| 6.4 | Cabeçalho `X-Content-Type-Options: nosniff` | `[ ] Pendente` | `A definir` | `Response header check` | `__/__/202_` | Prevenção MIME sniffing |
| 6.5 | Cabeçalho `X-Frame-Options: SAMEORIGIN / DENY` | `[ ] Pendente` | `A definir` | `Response header check` | `__/__/202_` | Proteção clickjacking |
| 6.6 | Cabeçalho `Referrer-Policy: strict-origin-when-cross-origin` | `[ ] Pendente` | `A definir` | `Response header check` | `__/__/202_` | Privacidade no tráfego |
| 6.7 | Cabeçalho `Permissions-Policy` configurado | `[ ] Pendente` | `A definir` | `Response header check` | `__/__/202_` | Câmera/microfone desativados |
| 6.8 | Content Security Policy (CSP) compatível | `[ ] Pendente` | `A definir` | `Console sem violações` | `__/__/202_` | Script / Style restrict |

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
| 9.3 | Rastreamento de conversões (clique WhatsApp) | `[ ] Pendente` | `Desenvolvimento` | `Disparo de eventos no teste` | `__/__/202_` | Eventos de contato |

---

## 10. Testes Funcionais

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 10.1 | Todos os links internos e de menu funcionais | `[ ] Pendente` | `QA` | `Varredura de links (crawler)` | `__/__/202_` | Zero links quebrados (404) |
| 10.2 | Links de WhatsApp abrem com mensagem correta | `[ ] Pendente` | `QA` | `Teste em celular e desktop` | `__/__/202_` | wa.me com encode correto |
| 10.3 | Página 404 personalizada e funcional | `[ ] Concluído` | `QA` | `Acesso a rota inexistente` | `13/09/2026` | Retorno para Home |
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

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 15.1 | Formulário de Homologação assinado pelo cliente | `[ ] Pendente` | `A definir` | `Documento assinado` | `__/__/202_` | Bloqueador de lançamento |
| 15.2 | Deploy final para o ambiente de produção | `[ ] Pendente` | `A definir` | `Deploy log com sucesso` | `__/__/202_` | Executado após homologação |
| 15.3 | Teste de fumaça (Smoke Test) pós-deploy | `[ ] Pendente` | `QA` | `Navegação completa em prod` | `__/__/202_` | Todas as páginas ativas |
| 15.4 | Verificação de certificado SSL ativo em produção | `[ ] Pendente` | `DevOps` | `Cadeado verde no navegador` | `__/__/202_` | HTTPS sem avisos |

---

## 16. Monitoramento Pós-Lançamento

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 16.1 | Monitoramento de uptime configurado (HTTP ping) | `[ ] Pendente` | `DevOps` | `Painel de monitoramento` | `__/__/202_` | Alerta de indisponibilidade |
| 16.2 | Monitoramento de erros de console / status 4xx/5xx | `[ ] Pendente` | `DevOps` | `Log de acessos da CDN` | `__/__/202_` | Acompanhamento 48h |
| 16.3 | Envio de sitemap no Google Search Console | `[ ] Pendente` | `SEO` | `Painel GSC` | `__/__/202_` | Apenas após domínio e homologação |

---

## 17. Plano de Rollback e Contingência

| ID | Item de Verificação | Status | Responsável | Evidência | Data de Validação | Observações |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 17.1 | Tag/Release Git criada antes do deploy | `[ ] Pendente` | `Desenvolvimento` | `git tag v1.0.0` | `__/__/202_` | Ponto de restauração |
| 17.2 | Procedimento de re-apontamento instantâneo testado | `[ ] Pendente` | `DevOps` | `Plano de contingência` | `__/__/202_` | Reversão em < 5 minutos |
| 17.3 | Contatos de emergência do responsável técnico e cliente | `[ ] Pendente` | `Gestão` | `Matriz de escalonamento` | `__/__/202_` | Acionamento imediato |
