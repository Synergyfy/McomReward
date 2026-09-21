import { Entity, Column } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum BrandingPartnerType {
  CO_BRAND = "Co-Brand",
  WHITE_LABEL = "White-Label",
}

export enum BrandingPartnerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("branding_partners")
export class BrandingPartner extends AbstractBaseEntity {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ enum: BrandingPartnerType })
  @Column({
    type: "enum",
    enum: BrandingPartnerType,
    default: BrandingPartnerType.CO_BRAND,
  })
  type: BrandingPartnerType;

  @ApiProperty({ enum: BrandingPartnerStatus })
  @Column({
    type: "enum",
    enum: BrandingPartnerStatus,
    default: BrandingPartnerStatus.ACTIVE,
  })
  status: BrandingPartnerStatus;

  @ApiProperty()
  @Column({ default: false })
  branding_logo: boolean;

  @ApiProperty()
  @Column({ default: false })
  branding_colors: boolean;

  @ApiProperty()
  @Column({ default: false })
  branding_text_lock: boolean;

  @ApiProperty()
  @Column({ unique: true })
  subdomain: string;

  @ApiProperty()
  @Column({ nullable: true })
  domain_routing: string;

  @ApiProperty()
  @Column()
  revenue_sharing: string;

  @ApiProperty()
  @Column({ type: "int", nullable: true })
  performance_total_users: number;

  @ApiProperty()
  @Column({ type: "int", nullable: true })
  performance_total_rewards_claimed: number;

  @ApiProperty()
  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  performance_revenue_generated: number;
}
