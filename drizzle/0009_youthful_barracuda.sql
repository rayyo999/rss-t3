ALTER TABLE "rss-t3_feed" ADD COLUMN "prev_feed_published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rss-t3_feed" ADD COLUMN "prev_feed_title" varchar(255);--> statement-breakpoint
ALTER TABLE "rss-t3_feed" ADD COLUMN "prev_feed_link" varchar(255);