import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './lib/auth';

const app = new Hono();


app.use('*', cors({
  origin: [
    'https://app.ghozali.biz.id'
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: '🚀 SumoPod API running' }));

// Better Auth — handle semua route /api/auth/*
app.on(['GET', 'POST'], '/api/auth/**', (c) => auth.handler(c.req.raw));

const PORT = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});