ALTER TABLE "rss-t3_feed"
DROP COLUMN IF EXISTS "uuid",
-- Custom add to change existing id to uuid
ALTER COLUMN id DROP DEFAULT,
ALTER COLUMN id SET DATA TYPE varchar(255) USING gen_random_uuid()::text,
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Update existing rows with new UUIDs
UPDATE "rss-t3_feed" SET id = gen_random_uuid()::text WHERE id::text ~ '^[0-9]+$';