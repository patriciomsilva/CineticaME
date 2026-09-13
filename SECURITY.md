# Cinética Materiais Elétricos — Matriz de Segurança e Conformidade Técnica

Este documento consolida a auditoria e as diretrizes de segurança aplicadas à base institucional do projeto Cinética Materiais Elétricos.

---

## 1. Status Geral de Segurança

| Categoria | Status | Observação |
| :--- | :--- | :--- |
| **Geração Estática (SSG)** | ✅ Implementado & Verificado | Saída 100% estática em HTML, CSS, JS e WebP/AVIF sem dependência de servidor Node em tempo de execução |
| **Ausência de Rotas de API** | ✅ Implementado & Verificado | Nenhuma rota de API dinâmica presente no build de produção |
| **Ausência de Formulários / Coleta de Dados** | ✅ Implementado & Verificado | Nenhum campo de entrada de dados pessoais ativo nesta etapa |
| **Gestão de Segredos & Variáveis de Ambiente** | ✅ Implementado & Verificado | Nenhuma chave de API, credencial ou arquivo `.env` versionado no repositório |
| **Fontes & Recursos 100% Locais** | ✅ Implementado & Verificado | Fontes empacotadas localmente via `@fontsource` (sem chamadas a Google Fonts ou CDNs externas) |
| **Ausência de Scripts de Terceiros / Iframes** | ✅ Implementado & Verificado | Nenhum script de rastreamento de terceiros, iframe ou mapa externo carregado |
| **Isolamento de Arquivos Originais** | ✅ Implementado & Verificado | A pasta de arquivos brutos `Imagens/` e a pasta `artifacts/` não são publicadas dentro de `dist` |
| **Higiene de Recursos Públicos** | ✅ Implementado & Verificado | Somente imagens e favicon estritamente utilizados no código residem em `public/assets/images` |

---

## 2. Itens Implementados e Verificados no Código

- **Arquitetura Static-First:** Build gerado com Astro em modo estático (`output: 'static'`).
- **Nenhum endpoint de backend em execução:** Ausência total de SSR ou Server Islands.
- **Ausência de campos de coleta de dados pessoais:** Em total conformidade com o princípio de minimização de dados da LGPD para sites institucionais informativos.
- **Recursos e Tipografia Locais:** Barlow Condensed e Inter servidos diretamente da infraestrutura local via `@fontsource`.
- **Links Externos Seguros:** Links para redes sociais oficiais utilizam `target="_blank"` e `rel="noopener noreferrer"`.
- **Prevenção de Indexação Indesejada na Fase Preliminar:** Metatag `noindex, nofollow` ativa no layout base e `robots.txt` com bloqueio para fase de homologação.

---

## 3. Itens Planejados para Produção (Hospedagem & Infraestrutura)

Os seguintes controles de segurança são recomendados para configuração direta na plataforma de hospedagem selecionada (Cloudflare Pages, Vercel, Netlify, AWS S3/CloudFront ou Nginx):

> [!NOTE]
> Os cabeçalhos abaixo **não estão ativos localmente** e serão declarados ativos apenas após configuração e verificação no servidor de hospedagem definitivo.

```http
# Cabeçalhos HTTP Recomendados para o Provedor de Hospedagem:
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
```

- **HTTPS Obrigatório:** Redirecionamento 100% automático de HTTP para HTTPS com certificado TLS 1.3.
- **Proteção DDoS / WAF:** Camada de proteção na borda via CDN/DNS.

---

## 4. Itens Dependentes de Informações e Confirmação do Cliente

1. **Definição de Domínio Próprio:** Registro e apontamento DNS do domínio definitivo da Cinética Materiais Elétricos.
2. **Canais de Contato Adicionais:** Confirmação de número oficial de WhatsApp comercial e e-mail com domínio corporativo antes de disponibilização pública.
3. **Dados Cadastrais Oficiais:** Razão Social, CNPJ e endereço formal para inclusão na Política de Privacidade e rodapé institucional.
4. **Futura Expansão de Catálogo / Orçamento:** Caso seja solicitado formulário de orçamento, implementar validação server-side via Zod, rate-limiting e Turnstile.

