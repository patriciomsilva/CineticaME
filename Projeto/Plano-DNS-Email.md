# Plano de Gestão de DNS e Proteção de E-mail — Cinética Materiais Elétricos

Este documento estabelece o protocolo operacional seguro e neutro para o gerenciamento de apontamentos DNS, proteção incondicional do fluxo de e-mails corporativos e canonicalização de domínio para o site da **Cinética Materiais Elétricos**.

> **Diretriz Fundamental de Segurança:**  
> A alteração de apontamentos web **JAMAIS deve interromper ou degradar o serviço de e-mails corporativos** da empresa. Nenhuma modificação em zona DNS pode ser realizada sem inventário prévio, redução preventiva de TTL e plano de contingência validado. Não utilize dados ou registros fictícios.

---

## 1. Inventário Obrigatório Pré-Mudança

Antes de realizar qualquer intervenção na zona DNS, o responsável técnico deve executar o mapeamento completo e exportar o estado atual.

### 1.1. Exportação da Zona DNS
* Exportar a zona DNS no formato suportado pelo provedor atual (ex.: arquivo BIND, exportação estruturada ou registros detalhados via painel).
* Caso o provedor não disponibilize exportação direta em arquivo, documentar em planilha ou texto estruturado **todos** os registros ativos e seus respectivos TTLs (*Time To Live*).

### 1.2. Mapeamento de Registros e Provedores

| Tipo de Registro | Nome / Host | Conteúdo / Destino Atual | TTL Atual | Categoria de Serviço | Impacto na Mudança do Site |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **SOA** | `@` | `[PREENCHER: Servidor Primário]` | `[PREENCHER]` | Autoridade DNS | Manter inalterado |
| **NS** | `@` | `[PREENCHER: Servidores DNS]` | `[PREENCHER]` | Delegação DNS | Manter inalterado |
| **A / AAAA** | `@` (Raiz) | `[PREENCHER: IP legado/atual]` | `[PREENCHER]` | **Site Web** | **Alvo da alteração do site** |
| **CNAME** | `www` | `[PREENCHER: Destino atual]` | `[PREENCHER]` | **Site Web** | **Alvo da alteração do site** |
| **MX** | `@` | `[PREENCHER: Servidores de E-mail]` | `[PREENCHER]` | **E-mail Corporativo** | **PRESERVAR INTACTO (NÃO TOCAR)** |
| **TXT** | `@` | `v=spf1 ...` (Registro SPF) | `[PREENCHER]` | **Autenticação E-mail** | **PRESERVAR INTACTO (NÃO TOCAR)** |
| **TXT / CNAME** | `[seletor]._domainkey` | Chave pública DKIM | `[PREENCHER]` | **Autenticação E-mail** | **PRESERVAR INTACTO (NÃO TOCAR)** |
| **TXT** | `_dmarc` | `v=DMARC1; ...` | `[PREENCHER]` | **Autenticação E-mail** | **PRESERVAR INTACTO (NÃO TOCAR)** |
| **TXT** | `@` / subdomínios | Verificações de Provedor | `[PREENCHER]` | Validação de Propriedade | **PRESERVAR INTACTO (NÃO TOCAR)** |
| **CAA** | `@` | Autoridades Certificadoras (CAs) | `[PREENCHER]` | Emissão de Certificados | Ajustar se necessário para emissão SSL |

### 1.3. Confirmação dos Provedores Envolvidos
Preencher os dados reais fornecidos pelo cliente/administrador no momento da execução:
* **Entidade Registradora do Domínio:** `[PREENCHER: ex. Registro.br / Provedor Nacional ou Internacional]`
* **Provedor de DNS Autoritativo:** `[PREENCHER: ex. Registro.br / Cloudflare / DNS do Provedor]`
* **Provedor de Hospedagem Web:** `[PREENCHER: Host / Edge CDN selecionada]`
* **Provedor de E-mail Corporativo:** `[PREENCHER: ex. Google Workspace / Microsoft 365 / Provedor cPanel / Titan / etc.]`

---

## 2. Proteção Absoluta do Serviço de E-mail

O serviço de e-mail é a espinha dorsal de comunicação e fechamento de negócios da empresa. Qualquer indisponibilidade ou desconfiguração pode acarretar perda de cotações e rejeição de mensagens por filtros antispam globais.

### 2.1. Regras Críticas de Operação
1. **Intocabilidade dos Registros `MX`:**  
   Em hipótese alguma remover, sobrescrever ou alterar a prioridade dos registros `MX` durante intervenções destinadas à publicação do site web.
2. **Preservação de Registros de Verificação:**  
   Registros do tipo `TXT` ou `CNAME` utilizados para validação de propriedade de serviços externos (Google Site Verification, Microsoft Domains, Zoho, RD Station, gateways de pagamento) devem ser mantidos integralmente.
3. **Regra de Unicidade do Registro SPF (RFC 7208):**  
   Um domínio pode possuir **exatamente UM** registro TXT de SPF iniciando com `v=spf1`. Se o novo serviço de hospedagem ou formulário exigir autorização de envio por e-mail, os mecanismos correspondentes (`include:...` ou `ip4:...`) devem ser mesclados no registro SPF existente. **Nunca crie um segundo registro TXT de SPF**, pois a existência de múltiplos registros invalida o SPF perante os servidores de destino.
4. **Preservação do DKIM e DMARC:**  
   As entradas de chave pública DKIM (`_domainkey`) e políticas DMARC (`_dmarc`) não devem ser removidas nem alteradas sem autorização explícita do administrador do serviço de e-mail.

### 2.2. Protocolo de Testes Bidirecionais de E-mail

Os testes abaixo devem ser executados em dois momentos: **(A) Imediatamente antes da mudança de DNS** e **(B) Imediatamente após a mudança de DNS**:

1. **Envio Externo &rarr; Caixa Interna:**  
   Enviar um e-mail a partir de uma conta externa (ex.: Gmail/Outlook pessoal) para a caixa comercial oficial da Cinética ME (`[PREENCHER: email_comercial]`). Verificar recebimento na caixa de entrada dentro da janela de entrega esperada.
2. **Envio Interno &rarr; Caixa Externa:**  
   Enviar um e-mail a partir da caixa corporativa para um endereço externo. Inspecionar o cabeçalho técnico da mensagem recebida para confirmar aprovação nos testes `spf=pass`, `dkim=pass` e `dmarc=pass`.
3. **Resposta de Mensagem (Reply Flow):**  
   Responder ao e-mail recebido e confirmar o encadeamento correto da conversa.
4. **Monitoramento de Bounces / Rejeições:**  
   Acompanhar a caixa de entrada por 24 horas para garantir que nenhum e-mail retornou com erro de entrega (`Mailer-Daemon` / `NDR - Non-Delivery Report`).

---

## 3. Fundamentos e Diretrizes de SPF, DKIM e DMARC

A tríade de autenticação de e-mail deve ser configurada estritamente com base nos dados fornecidos pelo provedor de e-mail corporativo contratado pela empresa.

```
       [ E-mail Enviado ]
              |
     +--------+--------+
     |                 |
     v                 v
[ Validação SPF ]  [ Validação DKIM ]
(IP do Servidor)   (Assinatura Criptográfica)
     |                 |
     +--------+--------+
              |
              v
       [ Política DMARC ]
   (Avaliação e Relatórios)
              |
   +----------+----------+
   |          |          |
   v          v          v
[p=none] [p=quarantine] [p=reject]
(Monitor)  (Quarentena)  (Descarte)
```

### 3.1. Função de Cada Mecanismo
* **SPF (*Sender Policy Framework* - RFC 7208):**  
  Especifica quais servidores e endereços IP estão formalmente autorizados a enviar mensagens em nome do domínio da empresa.  
  *Origem dos dados:* Provedor de e-mail oficial (ex.: `include:_spf.provedor.com`).
* **DKIM (*DomainKeys Identified Mail* - RFC 6376):**  
  Anexa uma assinatura digital criptográfica ao cabeçalho de cada mensagem enviada, validada através de uma chave pública publicada na zona DNS sob um seletor específico (`[seletor]._domainkey.[dominio]`). Garante que a mensagem não foi adulterada em trânsito.  
  *Origem dos dados:* Gerado dentro do painel do provedor de e-mail.
* **DMARC (*Domain-based Message Authentication, Reporting, and Conformance* - RFC 7489):**  
  Define como os servidores de destino devem agir caso uma mensagem falhe nas checagens de SPF e/ou DKIM, além de fornecer um canal de relatórios agregados (`rua`) sobre o uso do domínio por remetentes em todo o mundo.

### 3.2. Política Inicial e Evolução Gradual do DMARC
> [!IMPORTANT]
> **Risco de Ativação Prematura de `p=reject` ou `p=quarantine`:**  
> A ativação imediata de políticas restritivas sem análise prévia de relatórios agregados pode fazer com que e-mails legítimos de filiais, sistemas de ERP, sistemas emissores de NF-e ou softwares de cobrança sejam descartados silenciosamente pelos servidores de destino.

A política `p=none` constitui a estratégia inicial recomendada para coleta diagnóstica:

**Roteiro Seguro de Evolução:**
1. **Fase 1 — Monitoramento Inicial (Estratégia Recomendada no Lançamento):**
   * Configurar a política em modo de observação neutra:
     `v=DMARC1; p=none; rua=mailto:[PREENCHER: email_para_relatorios_dmarc]; sp=none; fo=1;`
   * *Objetivo:* Coletar relatórios de todas as fontes que enviam e-mails em nome do domínio sem impactar nenhuma entrega legítima.
2. **Fase 2 — Quarentena Gradual (Após análise consistente de relatórios):**
   * Configurar quarentena parcial apenas após garantir que todas as fontes legítimas estão autenticadas com SPF e DKIM:
     `v=DMARC1; p=quarantine; pct=25; rua=mailto:[PREENCHER];` (elevando gradualmente `pct` para 50, 75 e 100%).
3. **Fase 3 — Rejeição Definitiva (Endurecimento Máximo):**
   * Aplicar somente após conformidade total e comprovada de todas as mensagens legítimas:
     `v=DMARC1; p=reject; rua=mailto:[PREENCHER]; aspf=r; adkim=r;`

### 3.3. Validação Sintática
Toda alteração em registros SPF, DKIM e DMARC deve ser checada antes e após a publicação com validadores sintáticos oficiais (ex.: ferramentas de linha de comando `dig`, ou analisadores como MXToolbox / dmarcian / mail-tester).

---

## 4. Sequência Operacional para Troca de Apontamentos DNS

Para garantir risco zero de parada do site ou e-mails, a equipe técnica deve seguir estritamente as 10 etapas sequenciais:

```
[1. Inventário & Exportação] ---> [2. Aprovação Formal] ---> [3. Redução Prévia de TTL]
                                                                     |
[6. Validação de E-mails] <--- [5. Validação do Site Web] <--- [4. Aplicação da Mudança Mínima]
        |
        v
[7. Monitoramento 24-48h] ---> [8. Restauração do TTL] ---> [9. Registro de Evidências]
        |
        +---> [Em caso de falha crítica: 10. Execução de Rollback Imediato]
```

### Passo 1: Inventário e Exportação Completa
* Exportar o arquivo de zona DNS atual no formato suportado e registrar todos os valores e TTLs existentes em local seguro.

### Passo 2: Aprovação Técnica e Definição da Janela
* Agendar a janela de publicação em horário de baixo tráfego comercial (ex.: após as 19h ou em final de semana).
* Obter aprovação formal dos responsáveis técnicos e do cliente.

### Passo 3: Redução Planejada de TTL (*TTL Lowering*)
* Com antecedência correspondente ao TTL vigente (geralmente **24 a 48 horas antes da janela de mudança**), alterar o TTL dos registros `A`, `AAAA` e `CNAME` do site para um valor curto suportado pelo provedor (ex.: **300 segundos**, conforme viabilidade da plataforma).
* *Objetivo:* Diminuir a retenção em cache nos resolvedores DNS para agilizar eventuais correções, ressaltando que a propagação global ainda dependerá do cumprimento dos TTLs anteriores e políticas de cache dos resolvedores recursivos e ISPs.

### Passo 4: Aplicação da Mudança Mínima Estrita
* Na janela agendada, alterar **apenas e exclusivamente** os apontamentos do site web (`A`, `AAAA` e `CNAME` do `@` e `www`).
* Não tocar em registros `MX`, `TXT` de e-mail ou `NS`.

### Passo 5: Validação do Site Web
* Verificar resolução DNS em múltiplos resolvers públicos (`1.1.1.1`, `8.8.8.8`).
* Testar emissão e validade do certificado SSL/HTTPS.
* Executar testes de fumaça e validar carregamento completo de páginas e assets.

### Passo 6: Validação Completa do Fluxo de E-mails
* Executar o [Protocolo de Testes Bidirecionais de E-mail (Seção 2.2)](#22-protocolo-de-testes-bidirecionais-de-e-mail).
* Confirmar ausência de impacto no recebimento e envio de mensagens.

### Passo 7: Janela de Monitoramento
* Acompanhar logs de tráfego, erros HTTP e estabilidade DNS pelas próximas **24 a 48 horas**.

### Passo 8: Restauração dos TTLs Operacionais
* Após confirmação de estabilidade, restaurar o TTL dos registros do site para o padrão operacional planejado (**3600 segundos / 1 hora** ou conforme política do provedor de DNS).

### Passo 9: Registro das Evidências e Encerramento
* Salvar capturas de tela, saídas de comandos `dig`/`nslookup` e logs de teste no relatório de implantação.

### Passo 10: Procedimento de Rollback de DNS (Se Necessário)
* Se houver falha crítica durante a janela:
  1. Reverter imediatamente os registros `A`/`AAAA`/`CNAME` para os IPs/destinos documentados no Passo 1.
  2. A propagação da reversão ocorrerá progressivamente conforme o TTL reduzido e os caches dos resolvedores DNS.
  3. Revalidar os testes de site e e-mail no estado anterior.

---

## 5. Canonicalização e Estratégia de Domínio

A padronização da URL canônica é indispensável para consolidação de autoridade em SEO, prevenção de conteúdo duplicado e consistência de certificados de segurança.

### 5.1. Decisão Arquitetural: Domínio Raiz vs. `www`
A equipe deve formalizar a escolha da variante primária com o cliente:
* **Opção A (Recomendada para empresas locais / institucionais):** Domínio Raiz (`https://cineticame.com.br`) como canônico, com `www` redirecionando para a raiz.
* **Opção B:** Subdomínio `www` (`https://www.cineticame.com.br`) como canônico, com domínio raiz redirecionando para `www`.

### 5.2. Requisitos Mandatórios de Canonicalização
1. **Redirecionamento Permanente HTTP 301:**  
   A variante secundária deve redirecionar compulsoriamente para a variante canônica primária através de resposta `301 Moved Permanently` (nunca 302 temporário).
2. **Cobertura HTTPS para Ambas as Variantes:**  
   O certificado TLS/SSL deve obrigatoriamente cobrir tanto o domínio apex (`[dominio]`) quanto o subdomínio `www` via nomes alternativos do sujeito (*Subject Alternative Name - SAN*).
3. **Tags Canônicas (`link rel="canonical"`):**  
   Todas as páginas HTML geradas pelo Astro devem incluir no `<head>` a tag canônica com a URL absoluta apontando para a variante primária homologada:
   ```html
   <link rel="canonical" href="https://[DOMINIO_CANONICO_HOMOLOGADO]/" />
   ```
4. **Sitemap XML e Metatags:**  
   O arquivo `sitemap.xml` e as tags `og:url` (Open Graph) e `twitter:url` devem utilizar estritamente as URLs absolutas canônicas.
5. **Google Search Console:**  
   Cadastrar a propriedade do tipo *Domínio* (abrangendo todos os protocolos e subdomínios) ou ambas as propriedades de prefixo de URL (`https://...` e `https://www...`) após a autorização formal do cliente.
6. **Controle de Indexação:**  
   Manter a diretiva `noindex` ativa em todas as páginas até a validação final da canonicalização e homologação escrita do cliente.
