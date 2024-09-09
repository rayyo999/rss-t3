ALTER TABLE "rss-t3_feed" ADD COLUMN "last_notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rss-t3_feed" ADD COLUMN "total_notified" integer DEFAULT 0 NOT NULL;