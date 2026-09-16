import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AwardStampsDto {
  @ApiProperty({
    description: "The ID of the staff member awarding the stamps",
    example: "d290f1ee-6c54-4b01-90e6-d701748f0851",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  staffId?: string;

  @ApiProperty({
    description: "The ID of the participant receiving the stamps",
    example: "d290f1ee-6c54-4b01-90e6-d701748f0852",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  participantId?: string;

  @ApiProperty({
    description: "The ID of the campaign the stamps are being awarded for",
    example: "d290f1ee-6c54-4b01-90e6-d701748f0853",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  campaignId?: string;

  @ApiProperty({
    description: "The number of stamps to award",
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  stamps?: number;

  @ApiProperty({
    description:
      "The unique code of the participant being awarded a stamp (used by the stamp-card flow)",
    example: "PART-1234",
    required: false,
  })
  @IsOptional()
  @IsString()
  participantUniqueCode?: string;

  @ApiProperty({
    description:
      "The ID of the stamp card to award a stamp to (used by the stamp-card flow)",
    example: "d290f1ee-6c54-4b01-90e6-d701748f0854",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  stampCardId?: string;

  @ApiProperty({
    description:
      "The ID of the business stamp reward being awarded (used by the stamp-card flow)",
    example: "d290f1ee-6c54-4b01-90e6-d701748f0855",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  businessStampRewardId?: string;

  @ApiProperty({
    description: "How the stamp was triggered",
    example: "qr_scan",
    required: false,
  })
  @IsOptional()
  @IsString()
  triggerMethod?: string;
}
