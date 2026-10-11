import { stackIcons } from '../../components/portfolio/stackIcons';

// One cached SVG sprite for the stack logos, so their outlines are not repeated in
// every page's HTML. Rendered once at build time.
export const dynamic = 'force-static';

export function GET() {
  const symbols = Object.entries(stackIcons)
    .map(([key, icon]) => `<symbol id="${key}" viewBox="0 0 24 24"><path d="${icon.path}"/></symbol>`)
    .join('');
  return new Response(`<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  });
}
