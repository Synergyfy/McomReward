import { Column, Entity, Index } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";

/**
 * Idempotency ledger for inbound Central webhooks.
 *
 * Central delivers at least once, so every handler claims the event id before
 * applying changes. The unique index makes concurrent duplicate deliveries
 * safe to replay.
 */
@Entity("processed_webhook_events")
export class ProcessedWebhookEvent extends AbstractBaseEntity {
  @Index({ unique: true })
  @Column({ name: "event_id" })
  eventId: string;

  @Column({ name: "event_type" })
  eventType: string;

  @Column({ type: "jsonb", nullable: true })
  payload?: Record<string, any>;

  @Column({
    name: "processed_at",
    type: "timestamptz",
    default: () => "now()",
  })
  processedAt: Date;
}
