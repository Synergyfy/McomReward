import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Business } from "../../business/entities/business.entity";
import { AccessPassPlan } from "./access-pass-plan.entity";

export enum AccessPassCodeStatus {
  ACTIVE = "active",
  EXHAUSTED = "exhausted",
  REVOKED = "revoked",
  EXPIRED = "expired",
}

/**
 * A single redemption code for an access pass. Codes may be generated as
 * generic gifts or bound to a specific email address. When bound, the admin
 * decides whether the code is locked to that account or transferable.
 */
@Entity({ name: "access_pass_codes" })
export class AccessPassCode extends AbstractBaseEntity {
  @ApiProperty({ description: "Human-readable redemption code" })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ description: "Access pass plan the code unlocks" })
  @Column({ name: "plan_id", type: "uuid" })
  planId: string;

  @ManyToOne(() => AccessPassPlan, (plan) => plan.codes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "plan_id" })
  plan: AccessPassPlan;

  @ApiProperty({
    description: "Email the code was sent to, if assigned",
    required: false,
  })
  @Column({ name: "assigned_email", nullable: true })
  assignedEmail: string | null;

  @ApiProperty({
    description: "Business account the code is bound to, if it exists",
    required: false,
  })
  @Column({ name: "assigned_business_id", type: "uuid", nullable: true })
  assignedBusinessId: string | null;

  @ManyToOne(() => Business, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "assigned_business_id" })
  assignedBusiness: Business | null;

  @ApiProperty({
    description:
      "When true only the assigned email may redeem; when false the code is transferable",
    default: false,
  })
  @Column({ name: "restrict_to_assigned_user", default: false })
  restrictToAssignedUser: boolean;

  @ApiProperty({
    description: "Lifecycle state of the code",
    enum: AccessPassCodeStatus,
  })
  @Column({
    type: "enum",
    enum: AccessPassCodeStatus,
    default: AccessPassCodeStatus.ACTIVE,
  })
  status: AccessPassCodeStatus;

  @ApiProperty({
    description: "How many redemptions the code allows",
    default: 1,
  })
  @Column({ name: "max_uses", type: "int", default: 1 })
  maxUses: number;

  @ApiProperty({
    description: "How many times the code has been redeemed",
    default: 0,
  })
  @Column({ name: "times_used", type: "int", default: 0 })
  timesUsed: number;

  @ApiProperty({ description: "Optional code expiry", required: false })
  @Column({ name: "expires_at", type: "timestamptz", nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ description: "Internal admin note", required: false })
  @Column({ type: "text", nullable: true })
  note: string | null;

  @ApiProperty({ description: "Admin who generated the code", required: false })
  @Column({ name: "created_by_admin_id", type: "uuid", nullable: true })
  createdByAdminId: string | null;

  @ApiProperty({
    description: "When the code was last redeemed",
    required: false,
  })
  @Column({ name: "last_used_at", type: "timestamptz", nullable: true })
  lastUsedAt: Date | null;

  @ApiProperty({
    description: "When the code email was last sent",
    required: false,
  })
  @Column({ name: "email_sent_at", type: "timestamptz", nullable: true })
  emailSentAt: Date | null;
}
