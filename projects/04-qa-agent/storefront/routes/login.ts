import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { StorefrontDeps } from '../app';
import { setSessionCookie } from '../lib/session';
import { DEMO_USER } from '../store';
import { escapeHtml, page } from '../views/layout';

const LoginForm = z.object({ email: z.string(), password: z.string() });

function loginPage(error?: string): string {
  const errorHtml = error ? `<p role="alert" data-testid="login-error">${escapeHtml(error)}</p>` : '';
  return page(
    'Sign in',
    `${errorHtml}
<form method="post" action="/login">
  <label>Email <input name="email" type="email" data-testid="email"></label>
  <label>Password <input name="password" type="password" data-testid="password"></label>
  <button type="submit" data-testid="login-submit">Sign in</button>
</form>`,
    'page=login',
  );
}

export function registerLoginRoutes(app: FastifyInstance, { store, fault }: StorefrontDeps): void {
  app.get('/login', async (_request, reply) => reply.type('text/html').send(loginPage()));

  app.post('/login', async (request, reply) => {
    const form = LoginForm.safeParse(request.body);
    const valid =
      form.success && form.data.email === DEMO_USER.email && form.data.password === DEMO_USER.password;
    // Injected bug: valid credentials are treated as invalid.
    if (!valid || fault === 'login-rejects-valid') {
      return reply.code(401).type('text/html').send(loginPage('Invalid email or password'));
    }
    setSessionCookie(reply, store.createSession(form.data.email));
    return reply.redirect('/products');
  });
}
