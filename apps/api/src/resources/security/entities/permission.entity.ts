import { Entity, Column } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("permissions")
export class Permission extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty()
  @Column()
  description: string;
}