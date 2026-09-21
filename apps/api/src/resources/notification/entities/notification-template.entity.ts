import { Entity, Column } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum NotificationTemplateType {
  EMAIL = "email",
  PUSH = "push",
  IN_APP = "in-app",
}

export enum NotificationTemplateStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

@Entity("notification_templates")
export class NotificationTemplate extends AbstractBaseEntity {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ enum: NotificationTemplateType })
  @Column({ type: "enum", enum: NotificationTemplateType })
  type: NotificationTemplateType;

  @ApiProperty()
  @Column()
  subject: string;

  @ApiProperty()
  @Column("text")
  body: string;

  @ApiProperty()
  @Column()
  target_audience: string;

  @ApiProperty({ enum: NotificationTemplateStatus })
  @Column({
    type: "enum",
    enum: NotificationTemplateStatus,
    default: NotificationTemplateStatus.DRAFT,
  })
  status: NotificationTemplateStatus;
}
