import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import type { FailureEvent } from '../contracts/failure-event';
import type { LlmImage } from '../llm/client';
import { extractStackFiles, normalizeRepoPath } from './stack-files';

export interface ContextLimits {
  maxSourceFiles: number;
  maxBytesPerFile: number;
  maxTotalSourceBytes: number;
  maxScreenshotBytes: number;
}

export const DEFAULT_LIMITS: ContextLimits = {
  maxSourceFiles: 6,
  maxBytesPerFile: 12_000,
  maxTotalSourceBytes: 40_000,
  // Well under the API's per-image limit; larger screenshots are skipped, not resized.
  maxScreenshotBytes: 3_000_000,
};

export interface SourceFile {
  path: string;
  content: string;
  truncated: boolean;
}

export interface DiagnosisContext {
  sourceFiles: SourceFile[];
  repoIndex: string[];
  screenshot: LlmImage | null;
  /** Human-readable notes on what was skipped, surfaced in logs. */
  notes: string[];
}

export interface FileReader {
  readFile(absPath: string): Promise<Buffer>;
  size(absPath: string): Promise<number>;
}

export const nodeFileReader: FileReader = {
  readFile: (p) => readFile(p),
  size: async (p) => (await stat(p)).size,
};

/**
 * Collects bounded context for one failure: the spec file and every repo file in
 * the stack trace, the repo index, and the screenshot if it is readable.
 * Every limit is enforced here so the prompt size is predictable.
 */
export async function gatherContext(
  event: FailureEvent,
  opts: { repoRoot: string; repoIndex: string[]; limits?: ContextLimits; reader?: FileReader },
): Promise<DiagnosisContext> {
  const limits = opts.limits ?? DEFAULT_LIMITS;
  const reader = opts.reader ?? nodeFileReader;
  const indexSet = new Set(opts.repoIndex);
  const notes: string[] = [];

  const candidates = [normalizeRepoPath(event.file)];
  for (const frame of extractStackFiles(event.error.stack ?? '', opts.repoRoot, indexSet)) {
    if (!candidates.includes(frame.path)) candidates.push(frame.path);
  }

  const sourceFiles: SourceFile[] = [];
  let totalBytes = 0;
  for (const rel of candidates.filter((p) => indexSet.has(p)).slice(0, limits.maxSourceFiles)) {
    const budget = Math.min(limits.maxBytesPerFile, limits.maxTotalSourceBytes - totalBytes);
    if (budget <= 0) {
      notes.push(`source budget exhausted before ${rel}`);
      break;
    }
    try {
      const text = (await reader.readFile(path.join(opts.repoRoot, rel))).toString('utf8');
      const truncated = text.length > budget;
      const content = truncated ? text.slice(0, budget) : text;
      totalBytes += content.length;
      sourceFiles.push({ path: rel, content, truncated });
    } catch (err) {
      notes.push(`could not read ${rel}: ${String(err)}`);
    }
  }

  return {
    sourceFiles,
    repoIndex: opts.repoIndex,
    screenshot: await loadScreenshot(event.screenshotPath, limits, reader, notes),
    notes,
  };
}

async function loadScreenshot(
  screenshotPath: string | null,
  limits: ContextLimits,
  reader: FileReader,
  notes: string[],
): Promise<LlmImage | null> {
  if (!screenshotPath) return null;
  const mediaType = imageMediaType(screenshotPath);
  if (!mediaType) {
    notes.push(`unsupported screenshot type: ${screenshotPath}`);
    return null;
  }
  try {
    const size = await reader.size(screenshotPath);
    if (size > limits.maxScreenshotBytes) {
      notes.push(`screenshot too large (${size} bytes), skipped`);
      return null;
    }
    return { mediaType, base64: (await reader.readFile(screenshotPath)).toString('base64') };
  } catch (err) {
    // Typical when the runner and the service do not share a filesystem (e.g. CI).
    notes.push(`screenshot unreadable: ${String(err)}`);
    return null;
  }
}

function imageMediaType(p: string): LlmImage['mediaType'] | null {
  switch (path.extname(p).toLowerCase()) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    default:
      return null;
  }
}
