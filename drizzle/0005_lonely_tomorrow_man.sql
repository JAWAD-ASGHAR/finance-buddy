CREATE TABLE "saving_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saving_goal_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"contributed_at" date DEFAULT CURRENT_DATE NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saving_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"target_cents" integer NOT NULL,
	"target_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "saving_contributions" ADD CONSTRAINT "saving_contributions_saving_goal_id_saving_goals_id_fk" FOREIGN KEY ("saving_goal_id") REFERENCES "public"."saving_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saving_contributions_saving_goal_id_idx" ON "saving_contributions" USING btree ("saving_goal_id");--> statement-breakpoint
CREATE INDEX "saving_contributions_user_id_idx" ON "saving_contributions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saving_goals_user_id_idx" ON "saving_goals" USING btree ("user_id");