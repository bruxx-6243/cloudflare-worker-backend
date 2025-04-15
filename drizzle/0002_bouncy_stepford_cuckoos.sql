CREATE TABLE "request_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp NOT NULL,
	"ip" varchar(45) NOT NULL,
	"user_agent" varchar(512) NOT NULL,
	"country" varchar(100) NOT NULL,
	"browser" varchar(50) NOT NULL,
	"os" varchar(50) NOT NULL,
	"device_type" varchar(50) NOT NULL,
	"device" varchar(50) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "id" DROP IDENTITY;