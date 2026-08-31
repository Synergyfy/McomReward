import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { StampCardStatus } from "../enums/stamp-card-status.enum";
import { BusinessStampReward } from "./business-stamp-reward.entity";
import { Participant } from "../../participant/entities/participant.entity";
import { StampEvent } from "./stamp-event.entity";

@Entity("stamp_cards")
export class StampCard extends AbstractBaseEntity {
  @ApiProperty({ description: "Current number of stamps collected" })
  @Column({ type: "int", default: 0 })
  current_stamps: number;

  @ApiProperty({ enum: StampCardStatus })
  @Column({
    type: "enum",
    enum: StampCardStatus,
    default: StampCardStatus.IN_PROGRESS,
  })
  status: StampCardStatus;

  @ApiProperty({ description: "When the card was completed", required: false })
  @Column({ type: "timestamp", nullable: true })
  completed_at: Date;

  @ApiProperty({ description: "When the reward was redeemed", required: false })
  @Column({ type: "timestamp", nullable: true })
  redeemed_at: Date;

  @ManyToOne(
    () => BusinessStampReward,
    (businessStampReward) => businessStampReward.stampCards,
  )
  @JoinColumn({ name: "businessStampRewardId" })
  businessStampReward: BusinessStampReward;

  @ManyToOne(() => Participant)
  @JoinColumn({ name: "participantId" })
  participant: Participant;

  @OneToMany(() => StampEvent, (stampEvent) => stampEvent.stampCard)
  stampEvents: StampEvent[];
}
