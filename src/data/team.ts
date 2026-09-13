export interface TeamHighlight {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const teamHighlights: TeamHighlight[] = [
  {
    id: 'equipe',
    title: 'Nossa equipe',
    description: 'Cinética Materiais Elétricos em Morro da Fumaça — SC.',
    image: '/assets/images/equipe-institucional.webp',
    imageAlt: 'Nossa equipe na Cinética Materiais Elétricos em Morro da Fumaça'
  },
  {
    id: 'atendimento',
    title: 'Atendimento',
    description: 'Atendimento no balcão da loja.',
    image: '/assets/images/atendimento-balcao.webp',
    imageAlt: 'Atendimento no balcão da Cinética Materiais Elétricos'
  },
  {
    id: 'estrutura',
    title: 'Estrutura física',
    description: 'Cinética Materiais Elétricos em Morro da Fumaça — SC.',
    image: '/assets/images/loja-fachada.webp',
    imageAlt: 'Estrutura física da Cinética Materiais Elétricos em Morro da Fumaça'
  }
];

