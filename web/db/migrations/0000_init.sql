CREATE TABLE "belief_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"belief_id" uuid,
	"raw_text" text NOT NULL,
	"submitted_by_wallet" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beliefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author" text,
	"statement" text NOT NULL,
	"source_url" text,
	"source_platform" text DEFAULT 'manual',
	"source_timestamp" timestamp with time zone,
	"ai_confidence" numeric,
	"status" text DEFAULT 'DETECTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "beliefs_status_check" CHECK ("beliefs"."status" IN ('DETECTED', 'OPEN', 'CONFIRMED', 'CLOSED', 'RESOLVED', 'SETTLED'))
);
--> statement-breakpoint
CREATE TABLE "creator_confirmations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"belief_id" uuid NOT NULL,
	"creator_wallet" text NOT NULL,
	"confirmed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"signature" text NOT NULL,
	"tx_hash" text
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text NOT NULL,
	"handle" text,
	"confirmed_beliefs_count" integer DEFAULT 0 NOT NULL,
	"resolved_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profiles_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "market_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid,
	"event_type" text NOT NULL,
	"wallet_address" text,
	"amount" numeric,
	"tx_hash" text NOT NULL,
	"block_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_events_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "market_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"side" text NOT NULL,
	"amount" numeric NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"tx_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_positions_tx_hash_unique" UNIQUE("tx_hash"),
	CONSTRAINT "market_positions_side_check" CHECK ("market_positions"."side" IN ('AGREE', 'DISAGREE'))
);
--> statement-breakpoint
CREATE TABLE "market_resolutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"oracle_source" text DEFAULT 'chainlink',
	"start_price" numeric,
	"end_price" numeric,
	"resolved_outcome" text NOT NULL,
	"resolution_tx_hash" text,
	"resolved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_resolutions_resolved_outcome_check" CHECK ("market_resolutions"."resolved_outcome" IN ('AGREE', 'DISAGREE', 'VOID'))
);
--> statement-breakpoint
CREATE TABLE "market_settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"total_pool" numeric,
	"distributable_pool" numeric,
	"protocol_fee" numeric DEFAULT 0,
	"settled_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"belief_id" uuid,
	"contract_address" text,
	"chain_id" integer DEFAULT 11155111 NOT NULL,
	"contract_market_id" integer,
	"title" text,
	"description" text,
	"category" text DEFAULT 'crypto',
	"agree_pool" numeric DEFAULT 0 NOT NULL,
	"disagree_pool" numeric DEFAULT 0 NOT NULL,
	"open_time" timestamp with time zone DEFAULT now() NOT NULL,
	"close_time" timestamp with time zone DEFAULT (now() + interval '7 days') NOT NULL,
	"deadline" timestamp with time zone,
	"resolution_type" text,
	"resolution_config" jsonb,
	"resolution_source" text,
	"metadata_hash" text,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"winner" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "markets_resolution_type_check" CHECK ("markets"."resolution_type" IN ('PRICE_ABOVE', 'PRICE_BELOW', 'RELATIVE_PERFORMANCE')),
	CONSTRAINT "markets_winner_check" CHECK ("markets"."winner" IN ('AGREE', 'DISAGREE', 'VOID'))
);
--> statement-breakpoint
CREATE TABLE "oracle_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid,
	"source" text,
	"asset" text NOT NULL,
	"price" numeric NOT NULL,
	"snapshot_type" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oracle_snapshots_source_check" CHECK ("oracle_snapshots"."source" IN ('chainlink', 'robinhood_market_data')),
	CONSTRAINT "oracle_snapshots_snapshot_type_check" CHECK ("oracle_snapshots"."snapshot_type" IN ('START', 'END', 'DISPLAY', 'RESOLUTION', 'BASELINE'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "belief_sources" ADD CONSTRAINT "belief_sources_belief_id_beliefs_id_fk" FOREIGN KEY ("belief_id") REFERENCES "public"."beliefs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_confirmations" ADD CONSTRAINT "creator_confirmations_belief_id_beliefs_id_fk" FOREIGN KEY ("belief_id") REFERENCES "public"."beliefs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_events" ADD CONSTRAINT "market_events_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_positions" ADD CONSTRAINT "market_positions_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_resolutions" ADD CONSTRAINT "market_resolutions_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_settlements" ADD CONSTRAINT "market_settlements_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "markets" ADD CONSTRAINT "markets_belief_id_beliefs_id_fk" FOREIGN KEY ("belief_id") REFERENCES "public"."beliefs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oracle_snapshots" ADD CONSTRAINT "oracle_snapshots_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_belief_sources_belief_id" ON "belief_sources" USING btree ("belief_id");--> statement-breakpoint
CREATE INDEX "idx_beliefs_status" ON "beliefs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_beliefs_author" ON "beliefs" USING btree ("author");--> statement-breakpoint
CREATE INDEX "idx_creator_confirmations_belief_id" ON "creator_confirmations" USING btree ("belief_id");--> statement-breakpoint
CREATE INDEX "idx_creator_profiles_wallet_address" ON "creator_profiles" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "idx_market_events_market_id" ON "market_events" USING btree ("market_id");--> statement-breakpoint
CREATE INDEX "idx_market_events_tx_hash" ON "market_events" USING btree ("tx_hash");--> statement-breakpoint
CREATE INDEX "idx_market_positions_market_id" ON "market_positions" USING btree ("market_id");--> statement-breakpoint
CREATE INDEX "idx_market_positions_wallet_address" ON "market_positions" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "idx_market_positions_tx_hash" ON "market_positions" USING btree ("tx_hash");--> statement-breakpoint
CREATE INDEX "idx_market_resolutions_market_id" ON "market_resolutions" USING btree ("market_id");--> statement-breakpoint
CREATE INDEX "idx_market_settlements_market_id" ON "market_settlements" USING btree ("market_id");--> statement-breakpoint
CREATE INDEX "idx_markets_belief_id" ON "markets" USING btree ("belief_id");--> statement-breakpoint
CREATE INDEX "idx_markets_chain_id" ON "markets" USING btree ("chain_id");--> statement-breakpoint
CREATE INDEX "idx_markets_contract_address" ON "markets" USING btree ("contract_address");--> statement-breakpoint
CREATE INDEX "idx_markets_contract_market_id" ON "markets" USING btree ("contract_market_id");--> statement-breakpoint
CREATE INDEX "idx_markets_status" ON "markets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_markets_category" ON "markets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_oracle_snapshots_market_id" ON "oracle_snapshots" USING btree ("market_id");--> statement-breakpoint
CREATE INDEX "idx_users_wallet_address" ON "users" USING btree ("wallet_address");