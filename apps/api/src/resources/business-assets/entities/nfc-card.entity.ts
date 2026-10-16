import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Business } from "../../business/entities/business.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum NfcCardType {
  BUSINESS = "Business",
  STAFF = "Staff",
  PREMIUM = "Premium",
}

export enum NfcCardStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  PENDING = "Pending",
}

@Entity("nfc_cards")
export class NfcCard extends AbstractBaseEntity {
  @ApiProperty({ description: "Card type" })
  @Column({ type: "enum", enum: NfcCardType, default: NfcCardType.BUSINESS })
  type: NfcCardType;

  @ApiProperty({ description: "Card status" })
  @Column({ type: "enum", enum: NfcCardStatus, default: NfcCardStatus.PENDING })
  status: NfcCardStatus;

  @ApiProperty({ description: "Tap count", default: 0 })
  @Column({ type: "int", default: 0 })
  tapCount: number;

  @ApiProperty({ description: "Linked page", required: false })
  @Column({ nullable: true })
  linkedPage: string;

  @ManyToOne(() => Business, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business: Business;
}
