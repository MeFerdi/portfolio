import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RawDocument } from './parser';

/** Reads every markdown file in a directory (non-recursive), sorted for determinism. */
export async function loadCorpusDir(dir: string): Promise<RawDocument[]> {
  const names = (await readdir(dir)).filter((n) => /\.(md|markdown)$/i.test(n)).sort();
  return Promise.all(
    names.map(async (name) => {
      const source = path.join(dir, name);
      return { source, content: await readFile(source, 'utf8') };
    }),
  );
}
