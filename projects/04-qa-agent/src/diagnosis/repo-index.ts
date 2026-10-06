import { readdir } from 'node:fs/promises';
import path from 'node:path';

export interface RepoIndexOptions {
  /** Top-level directories to index, relative to the repo root. */
  include: string[];
  extensions: string[];
  maxFiles: number;
}

export const DEFAULT_INDEX_OPTIONS: RepoIndexOptions = {
  include: ['storefront', 'e2e', 'src'],
  extensions: ['.ts', '.tsx', '.js', '.sql'],
  maxFiles: 500,
};

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'test-results', 'playwright-report', 'coverage']);

/**
 * Lists source files as repo-relative POSIX paths. This list is both context for
 * the model and the allow-list that suspected file paths are validated against.
 */
export async function buildRepoIndex(repoRoot: string, options: RepoIndexOptions = DEFAULT_INDEX_OPTIONS): Promise<string[]> {
  const found: string[] = [];

  async function walk(relDir: string): Promise<void> {
    if (found.length >= options.maxFiles) return;
    let entries;
    try {
      entries = await readdir(path.join(repoRoot, relDir), { withFileTypes: true });
    } catch {
      return; // A missing include dir is not an error; the index is best-effort.
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (found.length >= options.maxFiles) return;
      const rel = path.posix.join(relDir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(rel);
      } else if (options.extensions.includes(path.extname(entry.name))) {
        found.push(rel);
      }
    }
  }

  for (const dir of options.include) await walk(dir);
  return found;
}
