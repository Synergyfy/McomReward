import { Entity, Column, Index } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("audit_logs")
@Index(["action"])
export class AuditLog extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ name: "user_id" })
  userId: string;

  @ApiProperty()
  @Column({ name: "user_name" })
  userName: string;

  @ApiProperty()
  @Column()
  action: string;

  @ApiProperty()
  @Column("text")
  details: string;
}
