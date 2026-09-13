export interface Solution {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  audience: string[];
  image: string;
  imageAlt: string;
  highlights: string[];
  itemsSample: string[];
}

export const solutionsData: Solution[] = [
  {
    id: 'iluminacao-design',
    slug: 'iluminacao-design',
    title: 'Iluminação & Acabamentos',
    shortDesc: 'Luminárias, painéis LED, pendentes, spots, fitas de LED, interruptores e tomadas para sua obra ou reforma.',
    fullDesc: 'Opções em iluminação decorativa e funcional, além de linhas de interruptores e tomadas para diferentes ambientes.',
    audience: ['Residências', 'Comércios', 'Profissionais'],
    image: '/assets/images/showroom-iluminacao.webp',
    imageAlt: 'Showroom de iluminação da loja Cinética Materiais Elétricos',
    highlights: ['Showroom físico em Morro da Fumaça', 'Modelos decorativos e iluminação', 'Linhas de acabamento'],
    itemsSample: ['Painéis e Plafons LED', 'Lustres e Pendentes', 'Interruptores e Tomadas', 'Spots e Trilhos', 'Fitas LED e Fontes']
  },
  {
    id: 'eletrica-geral',
    slug: 'eletrica-geral',
    title: 'Materiais Elétricos & Instalação',
    shortDesc: 'Cabos, condutores, disjuntores, quadros de distribuição, eletrodutos e acessórios de instalação.',
    fullDesc: 'Linha para instalações elétricas residenciais, comerciais e industriais em Morro da Fumaça.',
    audience: ['Eletricistas', 'Construtores', 'Instaladores'],
    image: '/assets/images/estoque-estrutura.webp',
    imageAlt: 'Estrutura e materiais elétricos da Cinética',
    highlights: ['Materiais para diferentes fases da obra', 'Linhas residenciais e industriais', 'Estrutura física em Morro da Fumaça'],
    itemsSample: ['Cabos e Fios', 'Disjuntores e Dispositivos DR', 'Quadros de Distribuição', 'Eletrodutos e Conexões', 'Acessórios de Fixação']
  },
  {
    id: 'atendimento-presencial',
    slug: 'atendimento-presencial',
    title: 'Atendimento e Balcão',
    shortDesc: 'Atendimento presencial no balcão da loja em Morro da Fumaça — SC.',
    fullDesc: 'Atendimento presencial para residências, profissionais e empresas, auxiliando na conferência de materiais para o seu pedido.',
    audience: ['Profissionais', 'Empresas', 'Consumidores'],
    image: '/assets/images/atendimento-balcao.webp',
    imageAlt: 'Atendimento no balcão da Cinética Materiais Elétricos',
    highlights: ['Atendimento presencial em loja', 'Conferência de itens de materiais', 'Loja física em Morro da Fumaça — SC'],
    itemsSample: ['Atendimento de Balcão', 'Conferência de Listas de Compra', 'Apresentação de Produtos']
  }
];

