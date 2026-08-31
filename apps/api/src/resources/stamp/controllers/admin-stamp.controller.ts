import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { StampService } from "../services/stamp.service";
import { CreateStampTemplateDto } from "../dto/create-stamp-template.dto";
import { UpdateStampTemplateDto } from "../dto/update-stamp-template.dto";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/role.enum";

@ApiTags("Admin Stamp Rewards")
@ApiBearerAuth()
@Roles(Role.Admin)
@Controller("admin/stamps")
export class AdminStampController {
  constructor(private readonly stampService: StampService) {}

  @Get("templates")
  @ApiOperation({ summary: "Admin: Get all stamp reward templates" })
  findAll() {
    return this.stampService.findAllTemplates();
  }

  @Post("templates")
  @ApiOperation({ summary: "Admin: Create a stamp reward template" })
  create(@Body() dto: CreateStampTemplateDto) {
    return this.stampService.createTemplate(dto);
  }

  @Get("templates/:id")
  @ApiOperation({ summary: "Admin: Get a stamp reward template" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.stampService.findTemplateById(id);
  }

  @Patch("templates/:id")
  @ApiOperation({ summary: "Admin: Update a stamp reward template" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateStampTemplateDto,
  ) {
    return this.stampService.updateTemplate(id, dto);
  }

  @Delete("templates/:id")
  @ApiOperation({ summary: "Admin: Delete a stamp reward template" })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.stampService.deleteTemplate(id);
  }

  @Post("templates/:id/publish")
  @ApiOperation({ summary: "Admin: Publish a stamp reward template" })
  publish(@Param("id", ParseUUIDPipe) id: string) {
    return this.stampService.publishTemplate(id);
  }

  @Post("templates/:id/archive")
  @ApiOperation({ summary: "Admin: Archive a stamp reward template" })
  archive(@Param("id", ParseUUIDPipe) id: string) {
    return this.stampService.archiveTemplate(id);
  }

  @Post("templates/:id/duplicate")
  @ApiOperation({ summary: "Admin: Duplicate a stamp reward template" })
  duplicate(@Param("id", ParseUUIDPipe) id: string) {
    return this.stampService.duplicateTemplate(id);
  }
}
