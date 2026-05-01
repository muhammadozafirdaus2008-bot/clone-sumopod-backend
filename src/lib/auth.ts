import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  trustedOrigins: [
  'http://localhost:5173',
  'http://localhost:8080',
  ],

 emailAndPassword: {
  enabled: true,
  requireEmailVerification: false, // ← tambah ini
},

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
});