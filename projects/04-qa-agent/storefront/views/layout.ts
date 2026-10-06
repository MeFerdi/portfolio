export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Minimal server-rendered page. The inline console.info line gives the E2E
 * fixture realistic browser console output to attach to failure events.
 */
export function page(title: string, body: string, consoleNote?: string): string {
  const script = consoleNote
    ? `<script>console.info(${JSON.stringify(`[storefront] ${consoleNote}`)})</script>`
    : '';
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(title)} · Demo Shop</title></head>
<body>
<nav><a href="/products">Products</a> · <a href="/cart" data-testid="nav-cart">Cart</a></nav>
<main>
<h1>${escapeHtml(title)}</h1>
${body}
</main>
${script}
</body>
</html>`;
}
