CREATE TABLE "tasks" (
	"is_completed" boolean NOT NULL,
	"title" varchar(255) NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1)
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;