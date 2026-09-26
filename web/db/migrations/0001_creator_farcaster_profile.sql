ALTER TABLE "creator_profiles" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD COLUMN "farcaster_fid" integer;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_farcaster_fid_unique" UNIQUE("farcaster_fid");