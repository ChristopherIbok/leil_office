import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './auth.controller';
import { projectsRouter } from './projects.controller';
import { tasksRouter } from './tasks.controller';
import { usersRouter } from './users.controller';
import { filesRouter } from './files.controller';
import { messagesRouter } from './messages.controller';
import { ChatRoom } from './tasks.gateway';
import type { Env, Variables } from './types';

// Re-export Durable Object so Wrangler can bind it
export { ChatRoom };

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS — allow Vercel frontend and local dev
app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'https://leilportal.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ];
    return allowed.includes(origin) ? origin : allowed[0];
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check — no auth required
app.get('/api/health', (c) => c.json({ status: 'ok', runtime: 'cloudflare-workers' }));

// API routes
app.route('/api/auth', authRouter);
app.route('/api/projects', projectsRouter);
app.route('/api/tasks', tasksRouter);
app.route('/api/users', usersRouter);
app.route('/api/files', filesRouter);
app.route('/api/messages', messagesRouter);

// ── Stub routes (return empty data so frontend doesn't crash) ────────────────
app.get('/api/billing/invoices', (c) => c.json([]));
app.post('/api/billing/invoices', (c) => c.json({ id: 'stub', status: 'DRAFT', amount: '0' }, 201));
app.get('/api/billing/create-checkout-session', (c) => c.json({ url: '#' }));
app.post('/api/billing/create-checkout-session', (c) => c.json({ url: '#' }));

app.get('/api/time-logs/me', (c) => c.json([]));
app.get('/api/time-logs', (c) => c.json([]));
app.post('/api/time-logs', (c) => c.json({ id: 'stub', duration: 0 }, 201));
app.patch('/api/time-logs/:id', (c) => c.json({ id: c.req.param('id'), duration: 0 }));

app.get('/api/channels/:id/messages', (c) => c.json([]));

app.post('/api/auth/password', (c) => c.json({ success: true }));

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Global error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
