import { Entity, Column, Index } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";

@Entity("credit_levels")
export class CreditLevel extends AbstractBaseEntity {
  @ApiProperty({ description: "The credit level number (1 = lowest)" })
  @Index({ unique: true })
  @Column({ type: "int" })
  level: number;

  @ApiProperty({ description: "Credits required to unlock this level" })
  @Column({ type: "int", name: "credits_needed" })
  creditsNeeded: number;

  @ApiProperty({
    description: "The participant's matching contribution required (GBP)",
  })
  @Column({ type: "float", name: "matching_contribution" })
  matchingContribution: number;

  @ApiProperty({ description: "Total cashback unlocked at this level (GBP)" })
  @Column({ type: "float", name: "total_cashback" })
  totalCashback: number;
}
