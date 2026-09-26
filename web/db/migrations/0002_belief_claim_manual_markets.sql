ALTER TABLE "markets" DROP CONSTRAINT "markets_resolution_type_check";--> statement-breakpoint
ALTER TABLE "beliefs" ADD COLUMN "claim" jsonb;--> statement-breakpoint
ALTER TABLE "markets" ADD CONSTRAINT "markets_resolution_type_check" CHECK ("markets"."resolution_type" IN ('PRICE_ABOVE', 'PRICE_BELOW', 'RELATIVE_PERFORMANCE', 'MANUAL'));