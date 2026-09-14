export interface Solution {
  id: string;
  categoryNumber: string;
  title: string;
  description: string;
}

export const solutionsData: Solution[] = [
  {
    id: 'residenciais',
    categoryNumber: '01',
    title: 'Materiais elétricos residenciais',
    description: 'Materiais e componentes elétricos para ambientes e reformas residenciais.',
  },
  {
    id: 'comerciais',
    categoryNumber: '02',
    title: 'Materiais elétricos comerciais',
    description: 'Materiais e infraestrutura elétrica para estabelecimentos comerciais e escritórios.',
  },
  {
    id: 'industriais',
    categoryNumber: '03',
    title: 'Materiais elétricos industriais',
    description: 'Suprimentos e materiais elétricos para manutenção e infraestrutura industrial.',
  },
  {
    id: 'iluminacao-infraestrutura',
    categoryNumber: '04',
    title: 'Iluminação e infraestrutura elétrica',
    description: 'Luminárias, itens de iluminação e materiais de passagem para ambientes internos e externos.',
  },
  {
    id: 'atendimento-balcao',
    categoryNumber: '05',
    title: 'Atendimento presencial no balcão',
    description: 'Atendimento presencial no espaço físico da loja para recepção e conferência de pedidos.',
  },
];
