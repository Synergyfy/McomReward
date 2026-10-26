import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../database/entities/base.entity";

export enum EmailQueueStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SENT = "sent",
  FAILED = "failed",
}

/**
 * Durable outbox for transactional email. Rows are written in the same
 * transaction as the business change that triggered them and drained by a
 * scheduled worker, so a temporary SMTP outage never loses a notification.
 */
@Entity({ name: "email_queue" })
export class EmailQueue extends AbstractBaseEntity {
  @ApiProperty({ description: "Recipient email address" })
  @Column({ name: "to_email" })
  to: string;

  @ApiProperty({ description: "Email subject" })
  @Column()
  subject: string;

  @ApiProperty({ description: "Rendered HTML body", required: false })
  @Column({ type: "text", nullable: true })
  html: string | null;

  @ApiProperty({ description: "Plaintext fallback body", required: false })
  @Column({ type: "text", nullable: true })
  text: string | null;

  @ApiProperty({
    description: "Delivery lifecycle state",
    enum: EmailQueueStatus,
  })
  @Column({
    type: "enum",
    enum: EmailQueueStatus,
    default: EmailQueueStatus.PENDING,
  })
  status: EmailQueueStatus;

  @ApiProperty({ description: "Number of delivery attempts", default: 0 })
  @Column({ type: "int", default: 0 })
  attempts: number;

  @ApiProperty({ description: "Maximum delivery attempts", default: 5 })
  @Column({ name: "max_attempts", type: "int", default: 5 })
  maxAttempts: number;

  @ApiProperty({ description: "Last delivery error", required: false })
  @Column({ name: "last_error", type: "text", nullable: true })
  lastError: string | null;

  @ApiProperty({ description: "Earliest time the message may be sent" })
  @Column({
    name: "scheduled_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  scheduledAt: Date;

  @ApiProperty({
    description: "When delivery was last attempted",
    required: false,
  })
  @Column({ name: "processed_at", type: "timestamptz", nullable: true })
  processedAt: Date | null;

  @ApiProperty({
    description: "When the message was delivered",
    required: false,
  })
  @Column({ name: "sent_at", type: "timestamptz", nullable: true })
  sentAt: Date | null;

  @ApiProperty({ description: "Related domain metadata", required: false })
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown> | null;
}
