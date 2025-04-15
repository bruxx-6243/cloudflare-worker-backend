CREATE TABLE "users" (
	"age" integer NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
