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
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { NotificationAdminService } from "../services/notification-admin.service";
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  FilterNotificationTemplateDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  FilterAnnouncementDto,
} from "../dto/notification-admin.dto";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/role.enum";

@ApiTags("Admin Notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/notification-templates")
export class AdminNotificationTemplateController {
  constructor(
    private readonly notificationAdminService: NotificationAdminService,
  ) {}

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List notification templates (Admin only)" })
  findAll(@Query() filterDto: FilterNotificationTemplateDto) {
    return this.notificationAdminService.findTemplates(filterDto);
  }

  @Get(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Get a notification template by ID (Admin only)" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.notificationAdminService.findTemplate(id);
  }

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Create a notification template (Admin only)" })
  create(@Body() createDto: CreateNotificationTemplateDto) {
    return this.notificationAdminService.createTemplate(createDto);
  }

  @Patch(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Update a notification template (Admin only)" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateNotificationTemplateDto,
  ) {
    return this.notificationAdminService.updateTemplate(id, updateDto);
  }

  @Delete(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Delete a notification template (Admin only)" })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.notificationAdminService.removeTemplate(id);
  }
}

@ApiTags("Admin Announcements")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/announcements")
export class AdminAnnouncementController {
  constructor(
    private readonly notificationAdminService: NotificationAdminService,
  ) {}

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List announcements (Admin only)" })
  findAll(@Query() filterDto: FilterAnnouncementDto) {
    return this.notificationAdminService.findAnnouncements(filterDto);
  }

  @Get(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Get an announcement by ID (Admin only)" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.notificationAdminService.findAnnouncement(id);
  }

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Create an announcement (Admin only)" })
  create(@Body() createDto: CreateAnnouncementDto) {
    return this.notificationAdminService.createAnnouncement(createDto);
  }

  @Patch(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Update an announcement (Admin only)" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAnnouncementDto,
  ) {
    return this.notificationAdminService.updateAnnouncement(id, updateDto);
  }

  @Delete(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Delete an announcement (Admin only)" })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.notificationAdminService.removeAnnouncement(id);
  }
}
