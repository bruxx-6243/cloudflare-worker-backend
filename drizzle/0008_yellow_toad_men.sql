ALTER TABLE "api_keys" ADD COLUMN "environment" varchar(255) DEFAULT 'development' NOT NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "expires_at" timestamp NOT NULL;