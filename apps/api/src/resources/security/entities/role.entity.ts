import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Permission } from "./permission.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("roles")
export class Role extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty({ type: () => Permission, isArray: true })
  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({ name: "role_permissions" })
  permissions: Permission[];
}
