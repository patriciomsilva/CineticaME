# Cinética Materiais Elétricos — Resumo Executivo de Pendências

Este documento consolida o status executivo de pendências para a homologação e o lançamento do site institucional da **Cinética Materiais Elétricos** (Versão 1.0).

O instrumento principal para validação com o cliente é o:
* **[Pacote de Homologação Final do Cliente](file:///c:/PROJETOS/CineticaME/HOMOLOGACAO-FINAL-CLIENTE.md)** — Documento claro e não técnico para aprovação de conteúdo, confirmação cadastral, autorizações de imagem e assinatura formal.

Documentos técnicos complementares de apoio:
1. [Formulário de Homologação e Validação do Cliente](file:///c:/PROJETOS/CineticaME/Projeto/Formulario-Homologacao-Cliente.md) — Matriz detalhada de suporte.
2. [Checklist Interno de Lançamento](file:///c:/PROJETOS/CineticaME/Projeto/Checklist-Lancamento.md) — Roteiro técnico em 17 fases para implantação segura.

---

## 1. Bloqueadores de Lançamento (Fase 1 — Versão 1.0)

Os itens abaixo dependem do cliente para que a equipe técnica finalize os ajustes e publique o site:

- [ ] **Aprovação de Conteúdo e Visual:** Validação dos textos, títulos e estrutura das páginas via [HOMOLOGACAO-FINAL-CLIENTE.md](file:///c:/PROJETOS/CineticaME/HOMOLOGACAO-FINAL-CLIENTE.md).
- [ ] **Identificação Cadastral Oficial:** Razão Social, CNPJ e endereço completo para o rodapé e política de privacidade.
- [ ] **Canais de Contato Definitivos:** Número de WhatsApp comercial oficial (com DDD), telefone fixo (se houver) e e-mail institucional.
- [ ] **Horários de Atendimento:** Confirmação do horário de funcionamento do balcão da loja.
- [ ] **Autorizações Formais de Imagem:** Consentimento para uso das fotos da equipe, loja física, fachada e exposição de marcas de fornecedores presentes no ambiente.
- [ ] **Domínio Oficial e DNS:** Definição do domínio contratado no Registro.br ou provedor e responsável administrativo.
- [ ] **Assinatura da Homologação:** Assinatura do termo de aprovação contido no pacote de homologação.

---

## 2. Procedimentos Técnicos Pós-Homologação (Pré-Publicação)

Assim que os dados acima forem fornecidos, a equipe executará os passos finais:

- [ ] Inserção dos dados cadastrais e canais oficiais em `src/data/siteInfo.ts`.
- [ ] Configuração de URLs definitivas em tags `canonical`, Open Graph e `sitemap.xml`.
- [ ] Remoção das diretivas restritivas de indexação (`noindex, nofollow` e liberação no `robots.txt`).
- [ ] Teste de ponta a ponta dos links e botões de contato.
- [ ] Provisionamento da hospedagem estática com HTTPS/SSL ativo e cabeçalhos de segurança.

---

## 3. Escopo Futuro (Fase 2 — Pós-Lançamento)

Os itens a seguir estão **fora do escopo da Versão 1.0** e **não impedem** a publicação institucional:

- **Catálogo Individualizado de Produtos:** Listagem detalhada item a item, preços e estoque.
- **Logotipos Individuais de Fabricantes:** Inclusão de marcas parceiras mediante termo formal de autorização.
- **Portfólio de Obras Realizadas:** Galeria de projetos mediante autorização formal dos proprietários das obras.
- **Depoimentos e Avaliações de Clientes:** Depoimentos nominais autorizados.
- **Formulários Dinâmicos / CRM:** Formulários de captura integrados a sistemas de terceiros.
