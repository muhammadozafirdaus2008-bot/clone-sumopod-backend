console.log("🚀 VERSION 2 - FIX WEBHOOK");
import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './lib/auth';
import { db } from './db/index';
import { payments, balances, transactions } from './db/schema';
import { eq } from 'drizzle-orm';
import { number } from 'zod';

const app = new Hono();


app.use('*', cors({
  origin: [
    'https://app.ghozali.biz.id',
    'https://clone-sumopod-backend-production.up.railway.app',
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

app.post('/api/payment/create', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error : 'Unauthorized '}, 401);

  console.log('session:', session);
  console.log('Cookie header:', c.req.header('cookie'));

  const  { amount } = await c.req.json();
  const userId = session.user.id;
const externalId = `topup-${userId}-${Date.now()}`;

const xenditRes = await fetch ('https://api.xendit.co/v2/invoices', {
  method:  'POST',
  headers: {
    'Authorization' : 'Basic ' + btoa(process.env.XENDIT_SECRET_KEY + ':'),
    'Content-Type' : 'application/json',
  },
  body : JSON.stringify({
    external_id: externalId,
    amount: amount,
    currency : 'IDR',
    success_redirect_url: 'https://app.ghozali.biz.id/billing?status=success',
    failure_redirect_url :'https://app.ghozali.biz.id/billing?status=failed',
  }),
}).then(r => r.json());

await db.insert(payments).values({
  userId,
  externalId, // ✅ sekarang valid
  amount : amount.toString(),
  status : 'Pending',
  invoiceUrl:xenditRes.invoice_url,
});

  return c.json ({ invoice_url: xenditRes.invoice_url});
});

app.post('/api/payment/webhook', async (c) =>{
  const token = c.req.header('x-callback-token');
  if (token !== process.env.XENDIT_WEBHOOK_TOKEN){
    return c.json({ error: 'Unauthorized'}, 401);
  }

 const body = await c.req.json();

console.log('📩 Webhook body:', body); // DEBUG

if (body.status === 'PAID') {
  const parts = body.external_id.split('-');
  parts.shift();
  parts.pop();

  const userId = parts.join('-');

  
  if (!userId) {
    console.error('❌ Invalid external_id:', body.external_id);
    return c.json({ error: 'Invalid external_id' }, 400);
  }

  console.log('✅ Parsed userId:', userId);

  const amount = body.amount;

   const existing = await db.select().from(balances).where(eq(balances.userId, userId));

   if(existing.length === 0) {
    await db.insert(balances).values({userId, balance: amount.toString() });
   } else {
    const newBalance = Number(existing[0].balance) + Number(amount);
    await db.update(balances)
    .set({ balance: newBalance.toString(), updatedAt: new Date() })
    .where (eq(balances.userId, userId));
   }

   await db.insert(transactions).values({
    userId,
    amount: amount.toString(),
    type: 'topup',
    description: 'Top up via Xendit',
    status : 'completed',
   });

   await db.update(payments)
.set({ status: 'paid' })
.where(eq(payments.externalId, body.external_id));
  
  }
  return c.json({ success: true});
});

app.get('/api/balance', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  const userId = session.user.id;

  const data = await db.select().from(balances)
    .where(eq(balances.userId, userId));

  return c.json({
    balance: data[0]?.balance ?? 0
  });
});

app.get('/api/transactions', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  const userId = session.user.id;

  const data = await db.select().from(transactions)
    .where(eq(transactions.userId, userId));

  return c.json(data);
});

app.get('/api/payments', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  const userId = session.user.id;

  const data = await db.select().from(payments)
    .where(eq(payments.userId, userId));

  return c.json(data);
});

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});