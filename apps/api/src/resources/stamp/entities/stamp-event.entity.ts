import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { StampTriggerMethod } from "../enums/stamp-trigger-method.enum";
import { StampCard } from "./stamp-card.entity";

@Entity("stamp_events")
export class StampEvent extends AbstractBaseEntity {
  @ApiProperty({ enum: StampTriggerMethod })
  @Column({ type: "enum", enum: StampTriggerMethod })
  trigger_method: StampTriggerMethod;

  @ApiProperty({ description: "Hybrid points added for this stamp" })
  @Column({ type: "int", default: 0 })
  points_added: number;

  @ApiProperty({ description: "Optional metadata string", required: false })
  @Column({ nullable: true })
  metadata: string;

  @ManyToOne(() => StampCard, (stampCard) => stampCard.stampEvents, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "stampCardId" })
  stampCard: StampCard;
}
