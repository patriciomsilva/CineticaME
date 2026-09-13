export interface Solution {
  id: string;
  slug: string;
  title: string;
  categoryNumber: string;
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
    id: 'residenciais',
    slug: 'residenciais',
    categoryNumber: '01',
    title: 'Materiais Elétricos Residenciais',
    shortDesc: 'Fios, cabos, interruptores, tomadas, disjuntores e componentes para obras e reformas residenciais.',
    fullDesc: 'Linhas completas de materiais elétricos para novas construções, reformas e manutenção de imóveis residenciais em Morro da Fumaça e região.',
    audience: ['Residências', 'Eletricistas', 'Reformas'],
    image: '/assets/images/balcao-detalhe.webp',
    imageAlt: 'Mostruário e componentes elétricos no balcão da Cinética Materiais Elétricos',
    highlights: [
      'Materiais para todas as etapas da obra residencial',
      'Interruptores, tomadas e linhas de acabamento',
      'Quadros, disjuntores e condutores para sua obra'
    ],
    itemsSample: ['Fios e Cabos Flexíveis', 'Interruptores e Tomadas', 'Disjuntores Termomagnéticos e DRs', 'Caixas de Passagem e Caixas 4x2 / 4x4', 'Eletrodutos Corrugados e Conexões']
  },
  {
    id: 'comerciais',
    slug: 'comerciais',
    categoryNumber: '02',
    title: 'Materiais Elétricos Comerciais',
    shortDesc: 'Materiais e infraestrutura elétrica para estabelecimentos comerciais, escritórios e consultórios.',
    fullDesc: 'Soluções em distribuição elétrica, proteção e infraestrutura para lojas, comércios e ambientes corporativos que demandam segurança e organização.',
    audience: ['Comércios', 'Profissionais', 'Escritórios'],
    image: '/assets/images/loja-fachada.webp',
    imageAlt: 'Estrutura da loja física Cinética Materiais Elétricos em Morro da Fumaça',
    highlights: [
      'Infraestrutura para distribuição e proteção comercial',
      'Canaletas, eletrodutos e organização de cabos',
      'Atendimento no balcão para reposição e compras'
    ],
    itemsSample: ['Quadros de Distribuição Comercial', 'Canaletas Aparentes e Eletrodutos Rígidos', 'Cabos e Barramentos', 'Iluminação Comercial', 'Dispositivos de Proteção contra Surtos (DPS)']
  },
  {
    id: 'industriais',
    slug: 'industriais',
    categoryNumber: '03',
    title: 'Materiais Elétricos Industriais',
    shortDesc: 'Componentes elétricos robustos e suprimentos para manutenção e infraestrutura industrial.',
    fullDesc: 'Fornecimento de cabos de potência, comandos, barramentos, chaves e componentes para demandas elétricas industriais em Morro da Fumaça e região.',
    audience: ['Indústrias', 'Profissionais', 'Manutenção'],
    image: '/assets/images/estoque-estrutura.webp',
    imageAlt: 'Estrutura física de estoque e materiais da Cinética Materiais Elétricos',
    highlights: [
      'Materiais robustos para manutenção e painéis',
      'Condutores e conexões para alta capacidade',
      'Estrutura física local com atendimento direto'
    ],
    itemsSample: ['Cabos de Potência e Controle', 'Disjuntores em Caixa Moldada', 'Barramentos e Conectores de Alta Pressão', 'Eletrocalhas e Acessórios de Sustentação', 'Sistemas e Hastes de Aterramento']
  },
  {
    id: 'iluminacao-infraestrutura',
    slug: 'iluminacao-infraestrutura',
    categoryNumber: '04',
    title: 'Iluminação e Infraestrutura Elétrica',
    shortDesc: 'Iluminação decorativa, técnica e infraestrutura completa para passagem e fixação.',
    fullDesc: 'Variedade em luminárias LED, painéis, pendentes, spots, refletores e itens de infraestrutura para ambientes residenciais e comerciais.',
    audience: ['Residências', 'Comércios', 'Profissionais'],
    image: '/assets/images/showroom-iluminacao.webp',
    imageAlt: 'Showroom de iluminação da Cinética Materiais Elétricos',
    highlights: [
      'Showroom físico para visualização dos modelos',
      'Opções decorativas, funcionais e externas',
      'Luminárias LED, fitas e perfis de iluminação'
    ],
    itemsSample: ['Painéis e Plafons LED', 'Lustres e Pendentes Decorativos', 'Spots, Trilhos e Lâmpadas Especiais', 'Fitas LED, Fontes e Perfis', 'Refletores LED e Sensores de Presença']
  },
  {
    id: 'apoio-escolha',
    slug: 'apoio-escolha',
    categoryNumber: '05',
    title: 'Apoio ao Cliente na Escolha de Materiais',
    shortDesc: 'Atendimento presencial no balcão para conferência e esclarecimento sobre itens e quantidades.',
    fullDesc: 'Auxílio direto no balcão da loja para conferência de listas de materiais, suporte na identificação de modelos correspondentes e montagem correta de pedidos.',
    audience: ['Consumidores', 'Profissionais', 'Empresas'],
    image: '/assets/images/atendimento-balcao.webp',
    imageAlt: 'Atendimento presencial no balcão da Cinética Materiais Elétricos',
    highlights: [
      'Conferência detalhada de listas de compras',
      'Esclarecimento presencial sobre especificações de produtos',
      'Atendimento dedicado no espaço físico da loja'
    ],
    itemsSample: ['Conferência de Listas para Compra', 'Verificação de Quantitativos e Metragens', 'Demonstração de Modelos e Acabamentos', 'Organização de Pedidos para Balcão']
  }
];


