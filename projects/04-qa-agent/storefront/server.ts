import { buildStorefront } from './app';
import { parseFault } from './faults';

async function main(): Promise<void> {
  const fault = parseFault(process.env.BUG);
  const port = Number(process.env.PORT ?? 3000);
  const app = buildStorefront({ fault, logger: true });
  await app.listen({ port, host: '127.0.0.1' });
  if (fault) app.log.warn({ fault }, 'Storefront started WITH an injected fault');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
