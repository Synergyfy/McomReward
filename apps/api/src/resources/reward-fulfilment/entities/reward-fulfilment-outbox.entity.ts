import { Column, Entity, Index } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import {
  FulfilmentOperation,
  FulfilmentOutboxStatus,
} from "../reward-fulfilment.enums";

/**
 * Durable retry queue for provider fulfilment/revocation calls.
 *
 * One row per (issuance, operation). A successful synchronous fulfilment never
 * creates a row; failures and revocation requests are queued here and drained
 * by the fulfilment cron.
 */
@Entity("reward_fulfilment_outbox")
@Index(["issuance_id", "operation"], { unique: true })
@Index(["status", "next_attempt_at"])
export class RewardFulfilmentOutbox extends AbstractBaseEntity {
  @Column({ type: "varchar" })
  issuance_id: string;

  @Column({ type: "varchar" })
  operation: FulfilmentOperation;

  @Column({
    type: "varchar",
    default: FulfilmentOutboxStatus.PENDING,
  })
  status: FulfilmentOutboxStatus;

  @Column({ type: "integer", default: 0 })
  attempts: number;

  @Column({ type: "integer", default: 8 })
  max_attempts: number;

  @Column({ type: "timestamp", default: () => "now()" })
  next_attempt_at: Date;

  @Column({ type: "text", nullable: true })
  last_error: string;

  @Column({ type: "jsonb", nullable: true })
  payload: Record<string, any>;
}
