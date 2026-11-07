import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  identity_id: uuid('identity_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  user_type: text('user_type').notNull().default('individual'),
  phone: text('phone'),
  company_name: text('company_name'),
  trade_license: text('trade_license'),
  trade_license_file: text('trade_license_file'),
  trade_license_url: text('trade_license_url'),
  country: text('country').notNull().default('United Arab Emirates'),
  status: text('status').notNull().default('approved'),
  is_verified_seller: boolean('is_verified_seller').notNull().default(false),
  verified_at: timestamp('verified_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  slug: text('slug'),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  category: text('category').notNull().default('SUV'),
  fuel: text('fuel').notNull().default('Petrol'),
  mileage: text('mileage').notNull().default('0 km'),
  transmission: text('transmission').notNull().default('Automatic'),
  condition_type: text('condition_type').notNull().default('used'),
  listing_type: text('listing_type').notNull().default('sale'),
  price: numeric('price', { precision: 14, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('AED'),
  price_label: text('price_label').notNull(),
  country: text('country').notNull(),
  city: text('city').notNull(),
  seller_name: text('seller_name').notNull(),
  seller_email: text('seller_email'),
  contact_preference: text('contact_preference').notNull().default('WhatsApp'),
  contact_phone: text('contact_phone'),
  whatsapp_number: text('whatsapp_number'),
  description: text('description').notNull().default(''),
  images: jsonb('images').$type<string[]>().notNull().default([]),
  status: text('status').notNull().default('pending'),
  sale_status: text('sale_status').notNull().default('available'),
  sold_at: timestamp('sold_at', { withTimezone: true }),
  disabled: boolean('disabled').notNull().default(false),
  document_name: text('document_name'),
  document_file: text('document_file'),
  document_url: text('document_url'),
  rejection_reason: text('rejection_reason'),
  approved_at: timestamp('approved_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  recipient: text('recipient'),
  action_tab: text('action_tab'),
  type: text('type'),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
