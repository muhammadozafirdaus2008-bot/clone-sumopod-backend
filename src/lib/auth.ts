import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  trustedOrigins: [
  'https://app.ghozali.biz.id'
  ],

 emailAndPassword: {
  enabled: true,
  requireEmailVerification: false, // ← tambah ini
},

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'https://clone-sumopod-backend-production.up.railway.app',
});