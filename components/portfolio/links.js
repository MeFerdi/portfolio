// Links to other sites open in a new tab; in-page, site and mailto links do not.
export function externalProps(href) {
  return /^https?:\/\//.test(href) ? { target: '_blank', rel: 'noreferrer' } : {};
}
