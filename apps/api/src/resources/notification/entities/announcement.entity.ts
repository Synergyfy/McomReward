import { Entity, Column } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum AnnouncementStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  SCHEDULED = "scheduled",
  EXPIRED = "expired",
}

@Entity("announcements")
export class Announcement extends AbstractBaseEntity {
  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column("text")
  content: string;

  @ApiProperty()
  @Column()
  target_audience: string;

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  start_date: Date;

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  end_date: Date;

  @ApiProperty({ enum: AnnouncementStatus })
  @Column({
    type: "enum",
    enum: AnnouncementStatus,
    default: AnnouncementStatus.DRAFT,
  })
  status: AnnouncementStatus;
}
