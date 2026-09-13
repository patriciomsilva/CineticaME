import type { APIRoute } from 'astro';

// Desindexação ativa durante etapa de aprovação e desenvolvimento
const robotsTxt = `User-agent: *
Disallow: /
`;

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};

