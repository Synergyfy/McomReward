import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { BrandingPartnerService } from "../services/branding-partner.service";
import {
  CreateBrandingPartnerDto,
  UpdateBrandingPartnerDto,
  FilterBrandingPartnerDto,
  UpdateBrandingPartnerStatusDto,
} from "../dto/branding-partner.dto";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/role.enum";
import { BrandingPartner } from "../entities/branding-partner.entity";

@ApiTags("Admin Partners")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/partners")
export class AdminPartnerController {
  constructor(
    private readonly brandingPartnerService: BrandingPartnerService,
  ) {}

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List branding partners (Admin only)" })
  @ApiResponse({ status: 200, type: [BrandingPartner] })
  findAll(@Query() filterDto: FilterBrandingPartnerDto) {
    return this.brandingPartnerService.findAll(filterDto);
  }

  @Get(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Get a branding partner by ID (Admin only)" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.brandingPartnerService.findOne(id);
  }

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Create a branding partner (Admin only)" })
  create(@Body() createDto: CreateBrandingPartnerDto) {
    return this.brandingPartnerService.create(createDto);
  }

  @Patch(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Update a branding partner (Admin only)" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBrandingPartnerDto,
  ) {
    return this.brandingPartnerService.update(id, updateDto);
  }

  @Patch(":id/status")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Toggle a branding partner's status (Admin only)" })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBrandingPartnerStatusDto,
  ) {
    return this.brandingPartnerService.updateStatus(id, updateDto.status);
  }

  @Delete(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Delete a branding partner (Admin only)" })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.brandingPartnerService.remove(id);
  }
}
