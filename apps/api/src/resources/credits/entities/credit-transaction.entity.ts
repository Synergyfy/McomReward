import { Entity, Column, Index } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import {
  CreditsPlatform,
  CreditsTransactionType,
  CreditsUnit,
  CreditsUserType,
} from "./credits.enums";

@Entity("credit_transactions")
@Index(["userId", "created_at"])
export class CreditTransaction extends AbstractBaseEntity {
  @ApiProperty({ description: "ID of the user the transaction belongs to" })
  @Column({ name: "user_id" })
  userId: string;

  @ApiProperty({ description: "User type (participant or business)" })
  @Column({ type: "enum", enum: CreditsUserType, name: "user_type" })
  userType: CreditsUserType;

  @ApiProperty({ description: "Signed amount (negative for debits)" })
  @Column({ type: "float" })
  amount: number;

  @ApiProperty({ enum: CreditsTransactionType })
  @Column({ type: "enum", enum: CreditsTransactionType })
  type: CreditsTransactionType;

  @ApiProperty({ enum: CreditsUnit })
  @Column({ type: "enum", enum: CreditsUnit })
  unit: CreditsUnit;

  @ApiProperty({ required: false, enum: CreditsPlatform })
  @Column({
    type: "enum",
    enum: CreditsPlatform,
    nullable: true,
    name: "source_platform",
  })
  sourcePlatform: CreditsPlatform;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: "event_type" })
  eventType: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  status: string;
}
