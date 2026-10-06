import path from 'node:path';

export interface StackFrameFile {
  path: string;
  line: number;
}

// Matches "/abs/or/rel/file.ts:12:5" inside "at fn (...)" or bare frames.
const FRAME_FILE = /((?:[A-Za-z]:)?[^\s():]+\.(?:ts|tsx|js|mjs|cjs)):(\d+)(?::\d+)?/g;

/**
 * Repo files referenced by a stack trace, in order of first appearance.
 * Anything outside the repo index (node_modules, Playwright internals) is ignored.
 */
export function extractStackFiles(stack: string, repoRoot: string, repoIndex: ReadonlySet<string>): StackFrameFile[] {
  const seen = new Set<string>();
  const frames: StackFrameFile[] = [];
  for (const match of stack.matchAll(FRAME_FILE)) {
    const raw = match[1];
    const line = Number(match[2]);
    if (!raw) continue;
    const rel = normalizeRepoPath(path.isAbsolute(raw) ? path.relative(repoRoot, raw) : raw);
    if (!repoIndex.has(rel) || seen.has(rel)) continue;
    seen.add(rel);
    frames.push({ path: rel, line });
  }
  return frames;
}

export function normalizeRepoPath(p: string): string {
  return p.split(path.sep).join('/').replace(/^\.\//, '');
}
