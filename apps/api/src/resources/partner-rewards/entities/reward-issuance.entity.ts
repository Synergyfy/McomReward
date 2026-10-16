import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Reward } from "../../rewards/entities/reward.entity";
import { RewardIssuanceStatus } from "../enums/partner-reward.enums";

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

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: "timestamp", nullable: true })
  expires_at: Date;

  @Column({ type: "timestamp", nullable: true })
  redeemed_at: Date;

  @Column({ type: "timestamp", nullable: true })
  revoked_at: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;
}
