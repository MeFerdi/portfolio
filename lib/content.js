// Build-time loader for the JSON files in /content. Server components only: it reads
// the files with Node fs, so pass what a client component needs down as props.
//
// Every file is checked against a small schema when it is first read. A malformed file
// throws, which fails `next build` with the file name and the field at fault.
//
// In production the files are read once per process; in development they are read on
// every call so edits appear on refresh.

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const isProduction = process.env.NODE_ENV === 'production';
const cache = new Map();

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

class ContentError extends Error {
  constructor(file, problems) {
    super(
      `Invalid content in content/${file}:\n` +
        problems.map((p) => `  - ${p}`).join('\n') +
        '\nSee content/README.md for the expected fields.'
    );
    this.name = 'ContentError';
  }
}

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const URL = /^(https?:\/\/|mailto:|\/|#)/;

// Each rule returns a problem string, or null when the value is valid.
const is = {
  string: (v) => (typeof v === 'string' && v.trim() !== '' ? null : 'must be a non-empty string'),
  stringOrNull: (v) => (v === null || (typeof v === 'string' && v.trim() !== '') ? null : 'must be a non-empty string or null'),
  number: (v) => (typeof v === 'number' && Number.isFinite(v) ? null : 'must be a number'),
  boolean: (v) => (typeof v === 'boolean' ? null : 'must be true or false'),
  url: (v) => (typeof v === 'string' && URL.test(v) ? null : 'must be a URL (https://..., mailto:, / or #)'),
  urlOrNull: (v) => (v === null ? null : is.url(v)),
  yearMonth: (v) => (typeof v === 'string' && YEAR_MONTH.test(v) ? null : 'must be a "YYYY-MM" string'),
  yearMonthOrNull: (v) => (v === null ? null : is.yearMonth(v) && 'must be a "YYYY-MM" string or null'),
  oneOf: (...options) => (v) => (options.includes(v) ? null : `must be one of ${options.map((o) => JSON.stringify(o)).join(', ')}`),
  arrayOf: (rule) => (v, at, problems) => {
    if (!Array.isArray(v)) return 'must be an array (use [] for none)';
    v.forEach((item, i) => check(item, rule, `${at}[${i}]`, problems));
    return null;
  },
  object: (shape) => (v, at, problems) => {
    if (v === null || typeof v !== 'object' || Array.isArray(v)) return 'must be an object';
    for (const [key, rule] of Object.entries(shape)) {
      const optional = key.endsWith('?');
      const name = optional ? key.slice(0, -1) : key;
      if (!(name in v)) {
        if (!optional) problems.push(`${at ? `${at}.` : ''}${name} is required`);
        continue;
      }
      check(v[name], rule, at ? `${at}.${name}` : name, problems);
    }
    return null;
  },
};

function check(value, rule, at, problems) {
  const problem = rule(value, at, problems);
  if (problem) problems.push(`${at || 'file'} ${problem}`);
}

function validate(file, data, rule, extra) {
  const problems = [];
  check(data, rule, '', problems);
  if (problems.length === 0 && extra) extra(data, problems);
  if (problems.length) throw new ContentError(file, problems);
  return data;
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const strings = is.arrayOf(is.string);
const action = is.object({ label: is.string, href: is.url, 'primary?': is.boolean });
const navLink = is.object({ label: is.string, mobileLabel: is.string, href: is.url });
const meta = is.object({ title: is.string, description: is.string });

const schemas = {
  caseStudy: is.object({
    slug: is.string,
    order: is.number,
    status: is.oneOf('draft', 'published'),
    title: is.string,
    client: is.string,
    role: is.string,
    period: is.object({ start: is.yearMonth, end: is.yearMonthOrNull }),
    summary: is.string,
    problem: is.string,
    approach: strings,
    outcomes: is.arrayOf(is.object({ label: is.string, value: is.string, evidence: is.urlOrNull })),
    security_and_data: strings,
    stack: strings,
    links: is.object({
      repo: is.urlOrNull,
      live: is.urlOrNull,
      commits: is.arrayOf(is.object({ label: is.string, url: is.url })),
    }),
    confidential: is.boolean,
    tags: strings,
  }),
  research: is.object({
    id: is.string,
    slug: is.string,
    title: is.string,
    type: is.string,
    status: is.string,
    date: is.string,
    abstract: is.string,
    sections: is.arrayOf(is.object({ heading: is.string, 'body?': strings, 'list?': strings })),
    tags: strings,
    github: is.urlOrNull,
  }),
  profile: is.object({
    name: is.string,
    nameLines: strings,
    location: is.string,
    copyrightYear: is.string,
    site: meta,
    meta,
    hero: is.object({ role: is.string, bio: is.string, actions: is.arrayOf(action) }),
    about: is.object({
      paragraphs: strings,
      skills: is.arrayOf(is.object({ title: is.string, display: is.oneOf('list', 'icons'), items: strings })),
    }),
    contact: is.object({
      heading: is.string,
      body: is.string,
      links: is.arrayOf(is.object({ label: is.string, text: is.string, href: is.url })),
    }),
  }),
  experience: is.arrayOf(
    is.object({ period: is.string, company: is.string, location: is.string, role: is.string, description: is.string, tags: strings })
  ),
  training: is.arrayOf(
    is.object({ period: is.string, institution: is.string, location: is.string, programme: is.string, description: is.string, tags: strings })
  ),
  approach: is.arrayOf(is.object({ title: is.string, body: is.string })),
  articles: is.arrayOf(is.object({ href: is.url, title: is.string, meta: is.string })),
  openSource: is.arrayOf(is.object({ title: is.string, project: is.string, status: is.string, link: is.url })),
  sections: is.object({
    sections: is.arrayOf(
      is.object({ id: is.string, nav: is.stringOrNull, heading: is.string, 'intro?': is.string, 'articlesHeading?': is.string })
    ),
    paper: is.object({ statusHeading: is.string, statusBody: is.string, repositoryPending: is.stringOrNull }),
  }),
  webdev: is.object({
    meta,
    nav: is.arrayOf(navLink),
    hero: is.object({ eyebrow: is.string, title: is.string, role: is.string, bio: is.string }),
    projectsHeading: is.string,
    projects: is.arrayOf(
      is.object({
        title: is.string,
        url: is.url,
        displayUrl: is.string,
        logoSrc: is.stringOrNull,
        fallbackLabel: is.string,
        description: is.string,
        tags: strings,
      })
    ),
  }),
  brand: is.object({
    meta,
    nav: is.arrayOf(navLink),
    hero: is.object({ eyebrow: is.string, title: is.string, role: is.string, bio: is.string, actions: is.arrayOf(action) }),
  }),
};

// The slug must match the file name, so the URL and the file always agree.
const slugMatchesFile = (file) => (data, problems) => {
  const expected = path.basename(file, '.json');
  if (data.slug !== expected) problems.push(`slug is "${data.slug}" but the file is named ${expected}.json; they must match`);
};

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

function cached(key, read) {
  if (isProduction && cache.has(key)) return cache.get(key);
  const value = read();
  if (isProduction) cache.set(key, value);
  return value;
}

function readJson(file) {
  const full = path.join(CONTENT_DIR, file);
  let text;
  try {
    text = fs.readFileSync(full, 'utf8');
  } catch (error) {
    throw new Error(`Could not read content/${file}: ${error.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`content/${file} is not valid JSON: ${error.message}`);
  }
}

function loadFile(file, schema, extra) {
  return cached(file, () => validate(file, readJson(file), schema, extra));
}

function loadDirectory(dir, schema) {
  return cached(dir, () =>
    fs
      .readdirSync(path.join(CONTENT_DIR, dir))
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map((name) => {
        const file = `${dir}/${name}`;
        return validate(file, readJson(file), schema, slugMatchesFile(file));
      })
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const getProfile = () => loadFile('profile.json', schemas.profile);
export const getExperience = () => loadFile('experience.json', schemas.experience);
export const getTraining = () => loadFile('training.json', schemas.training);
export const getApproach = () => loadFile('approach.json', schemas.approach);
export const getArticles = () => loadFile('articles.json', schemas.articles);
export const getOpenSource = () => loadFile('open-source.json', schemas.openSource);
export const getWebDev = () => loadFile('webdev.json', schemas.webdev);
export const getBrand = () => loadFile('brand.json', schemas.brand);

// Research papers, in the order of their `id` ("01", "02", ...).
export function getResearch() {
  return [...loadDirectory('research', schemas.research)].sort((a, b) => a.id.localeCompare(b.id));
}

export function getPaper(slug) {
  return getResearch().find((paper) => paper.slug === slug);
}

// Case studies sorted by `order` (then slug). Drafts are shown in development and
// hidden in production builds.
export function getCaseStudies({ includeDrafts = !isProduction } = {}) {
  return loadDirectory('case-studies', schemas.caseStudy)
    .filter((study) => includeDrafts || study.status === 'published')
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

// Section headings by id, plus the paper status text.
export function getSections() {
  const { sections, paper } = loadFile('sections.json', schemas.sections);
  return { byId: Object.fromEntries(sections.map((s) => [s.id, s])), list: sections, paper };
}

// Navigation entries for the home page. A pillar's link appears only when it has an
// entry, so nothing is linked before it exists.
export function getNavSections() {
  const counts = {
    research: getResearch().length,
    'case-studies': getCaseStudies().length,
    'open-source': getOpenSource().length,
  };
  return getSections()
    .list.filter((s) => s.nav && (counts[s.id] === undefined || counts[s.id] > 0))
    .map((s) => ({ id: s.id, label: s.nav }));
}
