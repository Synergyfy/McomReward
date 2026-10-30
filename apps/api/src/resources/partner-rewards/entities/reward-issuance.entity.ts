import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Reward } from "../../rewards/entities/reward.entity";
import { RewardIssuanceStatus } from "../enums/partner-reward.enums";
import {
  FulfilmentKind,
  FulfilmentProvider,
  FulfilmentStatus,
} from "../../reward-fulfilment/reward-fulfilment.enums";

/**
 * A reward issued to an end recipient (donor) on behalf of a calling
 * ecosystem partner (e.g. "fundordonate"). This is the provider-side ledger
 * that powers the full partner reward lifecycle.
 */
@Entity("reward_issuance")
@Index(["issuer_client_id", "idempotency_key"], { unique: true })
@Index(["issuer_client_id", "external_ref"])
export class RewardIssuance extends AbstractBaseEntity {
  @ManyToOne(() => Reward, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "reward_id" })
  reward: Reward;

  /** Optional business-reward the issuance was derived from. */
  @Column({ nullable: true })
  business_reward_id: string;

  /** Calling app's clientId, e.g. "fundordonate". */
  @Column()
  issuer_client_id: string;

  /** Caller-side reference (campaign id, reward config id, …). */
  @Column({ nullable: true })
  external_ref: string;

  /** Always populated (generated when the caller omits it). */
  @Column()
  idempotency_key: string;

  @Column()
  recipient_email: string;

  @Column({ nullable: true })
  recipient_mcom_user_id: string;

  /** Resolved local user id (Business/Participant) when we could match one. */
  @Column({ nullable: true })
  recipient_user_id: string;

  /** "Business" | "Participant" — the resolved local user type. */
  @Column({ nullable: true })
  recipient_user_type: string;

  @Column({ nullable: true })
  recipient_name: string;

  @Column({ default: false })
  recipient_resolved: boolean;

  /** Redemption / voucher code, when the reward type is code-based. */
  @Column({ nullable: true })
  code: string;

  @Column({
    type: "enum",
    enum: RewardIssuanceStatus,
    default: RewardIssuanceStatus.ISSUED,
  })
  status: RewardIssuanceStatus;

  /** Snapshot of the reward type at issue time. */
  @Column({ nullable: true })
  reward_type: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  value: number;

  /** Points credited, for POINT_OFFER rewards. */
  @Column({ nullable: true })
  points_awarded: number;

  /** Reference returned by the external issuer (e.g. Mall), when applicable. */
  @Column({ nullable: true })
  mall_reference: string;

  // ─── Ecosystem fulfilment state ────────────────────────────────────────────
  // Independent of the redemption state machine: an issuance can be ISSUED
  // while fulfilment is PENDING/FAILED, and REDEEMED once the provider confirms.
  @Column({ type: "varchar", nullable: true })
  fulfilment_provider: FulfilmentProvider;

  @Column({ type: "varchar", nullable: true })
  fulfilment_kind: FulfilmentKind;

  @Column({ type: "varchar", default: FulfilmentStatus.NOT_REQUIRED })
  fulfilment_status: FulfilmentStatus;

  /** Provider id: Mall instrument id, Central grant id, coupon id, etc. */
  @Column({ type: "varchar", nullable: true })
  fulfilment_ref: string;

  /** Code shown to the recipient. */
  @Column({ type: "varchar", nullable: true })
  fulfilment_code: string;

  @Column({ type: "jsonb", nullable: true })
  fulfilment_payload: Record<string, any>;

  @Column({ type: "text", nullable: true })
  fulfilment_error: string;

  @Column({ type: "integer", default: 0 })
  fulfilment_attempts: number;

  @Column({ type: "timestamp", nullable: true })
  fulfilled_at: Date;

  /** Explicit Central reference (grant/coupon/code) for reconciliation. */
  @Column({ type: "varchar", nullable: true })
  central_reference: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: "timestamp", nullable: true })
  expires_at: Date;

  @Column({ type: "timestamp", nullable: true })
  redeemed_at: Date;

  @Column({ type: "timestamp", nullable: true })
  revoked_at: Date;

  /** orderRef the issuance is currently reserved against (RESERVED only). */
  @Column({ nullable: true })
  reservation_ref: string;

  @Column({ type: "timestamp", nullable: true })
  reserved_at: Date;

  @Column({ type: "timestamp", nullable: true })
  committed_at: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;
}
