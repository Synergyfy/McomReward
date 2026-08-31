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
import { SecurityService } from "./security.service";
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  CreateRoleDto,
  UpdateRoleDto,
  FilterAuditLogDto,
} from "./dto/security.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";

@ApiTags("Admin Security")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin")
export class AdminSecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get("permissions")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List permissions (Admin only)" })
  findAllPermissions() {
    return this.securityService.findAllPermissions();
  }

  @Post("permissions")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Create a permission (Admin only)" })
  createPermission(@Body() createDto: CreatePermissionDto) {
    return this.securityService.createPermission(createDto);
  }

  @Patch("permissions/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Update a permission (Admin only)" })
  updatePermission(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePermissionDto,
  ) {
    return this.securityService.updatePermission(id, updateDto);
  }

  @Delete("permissions/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Delete a permission (Admin only)" })
  removePermission(@Param("id", ParseUUIDPipe) id: string) {
    return this.securityService.removePermission(id);
  }

  @Get("roles")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List roles (Admin only)" })
  findAllRoles() {
    return this.securityService.findAllRoles();
  }

  @Post("roles")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Create a role (Admin only)" })
  createRole(@Body() createDto: CreateRoleDto) {
    return this.securityService.createRole(createDto);
  }

  @Patch("roles/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Update a role (Admin only)" })
  updateRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRoleDto,
  ) {
    return this.securityService.updateRole(id, updateDto);
  }

  @Delete("roles/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Delete a role (Admin only)" })
  removeRole(@Param("id", ParseUUIDPipe) id: string) {
    return this.securityService.removeRole(id);
  }

  @Get("audit-logs")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List audit logs (Admin only)" })
  findAllAuditLogs(@Query() filterDto: FilterAuditLogDto) {
    return this.securityService.findAllAuditLogs(filterDto);
  }
}