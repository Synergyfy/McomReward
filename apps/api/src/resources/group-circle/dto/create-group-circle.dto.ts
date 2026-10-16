import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { GroupCircleType, InteractionLevel } from "../enums/group-circle.enums";

export class CreateGroupCircleDto {
  @ApiProperty({ description: "Name of the group circle" })
  @IsString()
  name: string;

  @ApiProperty({ enum: GroupCircleType, description: "Type of the circle" })
  @IsEnum(GroupCircleType)
  type: GroupCircleType;

  @ApiProperty({
    enum: InteractionLevel,
    description: "Interaction level of the circle",
    required: false,
    default: InteractionLevel.COLLABORATE,
  })
  @IsOptional()
  @IsEnum(InteractionLevel)
  interactionLevel?: InteractionLevel;

  @ApiProperty({
    description: "List of network contact IDs to add as initial members",
  })
  @IsArray()
  @IsString({ each: true })
  networkIds: string[];

  @ApiProperty({
    description:
      "List of referred business IDs to add as initial members (will be auto-added to network if missing)",
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referredBusinessIds?: string[];

  @ApiProperty({
    description: "Duration of the circle in days",
    required: false,
    example: 90,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      const seasonMap: Record<string, number> = {
        spring: 90,
        summer: 180,
        autumn: 270,
        winter: 360,
      };
      const lower = value.toLowerCase().trim();
      if (seasonMap[lower] !== undefined) {
        return seasonMap[lower];
      }
      const num = Number(value);
      return isNaN(num) ? 90 : num;
    }
    return typeof value === "number" ? value : 90;
  })
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: "Contribution amount per round (for Smart Money)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  contributionAmount?: number;
}
