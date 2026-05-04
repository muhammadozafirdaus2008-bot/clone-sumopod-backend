import { pgTable, text, timestamp, uuid, numeric } from 'drizzle-orm/pg-core';

export const instances = pgTable('instances', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  serviceName: text('service_name').notNull(),
  package: text('package'),
  status: text('status').default('deploying'),
  url: text('url'),
  username: text('username'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const balances = pgTable('balances', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique(),
  balance: numeric('balance').default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  amount: numeric('amount').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  status: text('status').default('completed'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  amount: numeric('amount').notNull(),
  credits: numeric('credits'),
  currency: text('currency').default('IDR'),
  status: text('status').default('pending'),
  invoiceUrl: text('invoice_url'),
  createdAt: timestamp('created_at').defaultNow(),
   externalId: text('external_id').notNull(),
});