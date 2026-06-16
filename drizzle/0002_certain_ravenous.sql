CREATE TYPE "public"."friend_request_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"status" "friend_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friend_requests_requester_recipient_unique" UNIQUE("requester_id","recipient_id")
);
--> statement-breakpoint
CREATE TABLE "settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" uuid NOT NULL,
	"to_user_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared_expense_splits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shared_expense_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"share_cents" integer NOT NULL,
	"paid_cents" integer NOT NULL,
	"personal_expense_id" uuid,
	CONSTRAINT "shared_expense_splits_expense_user_unique" UNIQUE("shared_expense_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "shared_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"total_cents" integer NOT NULL,
	"expense_date" date DEFAULT CURRENT_DATE NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_expense_splits" ADD CONSTRAINT "shared_expense_splits_shared_expense_id_shared_expenses_id_fk" FOREIGN KEY ("shared_expense_id") REFERENCES "public"."shared_expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_expense_splits" ADD CONSTRAINT "shared_expense_splits_personal_expense_id_expenses_id_fk" FOREIGN KEY ("personal_expense_id") REFERENCES "public"."expenses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friend_requests_requester_id_idx" ON "friend_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "friend_requests_recipient_id_idx" ON "friend_requests" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "settlements_from_user_id_idx" ON "settlements" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "settlements_to_user_id_idx" ON "settlements" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "shared_expense_splits_shared_expense_id_idx" ON "shared_expense_splits" USING btree ("shared_expense_id");--> statement-breakpoint
CREATE INDEX "shared_expense_splits_user_id_idx" ON "shared_expense_splits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shared_expenses_created_by_user_id_idx" ON "shared_expenses" USING btree ("created_by_user_id");