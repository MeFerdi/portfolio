import { execSync } from 'node:child_process';

/** CI provides the sha; locally fall back to git; never fail the run over it. */
export function resolveGitSha(env: NodeJS.ProcessEnv = process.env): string {
  const fromEnv = env.GIT_SHA ?? env.GITHUB_SHA;
  if (fromEnv) return fromEnv;
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}
