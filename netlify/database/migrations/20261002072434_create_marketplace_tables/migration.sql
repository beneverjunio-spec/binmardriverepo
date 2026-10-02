CREATE TABLE "listings" (
	"id" serial PRIMARY KEY,
	"user_id" integer,
	"title" text NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"category" text DEFAULT 'SUV' NOT NULL,
	"fuel" text DEFAULT 'Petrol' NOT NULL,
	"mileage" text DEFAULT '0 km' NOT NULL,
	"transmission" text DEFAULT 'Automatic' NOT NULL,
	"condition_type" text DEFAULT 'used' NOT NULL,
	"listing_type" text DEFAULT 'sale' NOT NULL,
	"price" numeric(14,2) NOT NULL,
	"currency" text DEFAULT 'AED' NOT NULL,
	"price_label" text NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"seller_name" text NOT NULL,
	"contact_preference" text DEFAULT 'WhatsApp' NOT NULL,
	"contact_phone" text,
	"description" text DEFAULT '' NOT NULL,
	"images" jsonb DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"identity_id" uuid NOT NULL UNIQUE,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"user_type" text DEFAULT 'individual' NOT NULL,
	"phone" text,
	"company_name" text,
	"trade_license" text,
	"country" text DEFAULT 'United Arab Emirates' NOT NULL,
	"status" text DEFAULT 'approved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");