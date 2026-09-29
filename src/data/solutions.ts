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
    description: 'Materiais e componentes para instalações, reformas, iluminação e os detalhes que tornam cada ambiente mais funcional.',
  },
  {
    id: 'comerciais',
    categoryNumber: '02',
    title: 'Materiais elétricos comerciais',
    description: 'Soluções para estabelecimentos comerciais, escritórios e espaços que dependem de uma infraestrutura elétrica bem planejada.',
  },
  {
    id: 'industriais',
    categoryNumber: '03',
    title: 'Materiais elétricos industriais',
    description: 'Suprimentos para manutenção, adequações e demandas de infraestrutura em ambientes industriais.',
  },
  {
    id: 'iluminacao-infraestrutura',
    categoryNumber: '04',
    title: 'Iluminação e infraestrutura elétrica',
    description: 'Iluminação, acabamentos e materiais de passagem para criar ambientes internos e externos mais eficientes e bem resolvidos.',
  },
  {
    id: 'atendimento-balcao',
    categoryNumber: '05',
    title: 'Atendimento presencial no balcão',
    description: 'Um espaço para apresentar listas, comparar alternativas e conferir materiais com o apoio da equipe.',
  },
];
