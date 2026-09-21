import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Permission } from "./entities/permission.entity";
import { Role } from "./entities/role.entity";
import { AuditLog } from "./entities/audit-log.entity";
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  CreateRoleDto,
  UpdateRoleDto,
  FilterAuditLogDto,
} from "./dto/security.dto";

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  // --- Permissions ---

  async createPermission(createDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create(createDto);
    return this.permissionRepository.save(permission);
  }

  async findAllPermissions() {
    return this.permissionRepository.find({ order: { name: "ASC" } });
  }

  async updatePermission(id: string, updateDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    Object.assign(permission, updateDto);
    return this.permissionRepository.save(permission);
  }

  async removePermission(id: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    await this.permissionRepository.remove(permission);
  }

  // --- Roles ---

  async createRole(createDto: CreateRoleDto) {
    const permissions = createDto.permissionIds?.length
      ? await this.permissionRepository.findBy({
          id: In(createDto.permissionIds),
        })
      : [];
    const role = this.roleRepository.create({
      name: createDto.name,
      description: createDto.description,
      permissions,
    });
    return this.roleRepository.save(role);
  }

  async findAllRoles() {
    return this.roleRepository.find({ order: { name: "ASC" } });
  }

  async findRole(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async updateRole(id: string, updateDto: UpdateRoleDto) {
    const role = await this.findRole(id);
    if (updateDto.permissionIds) {
      role.permissions = await this.permissionRepository.findBy({
        id: In(updateDto.permissionIds),
      });
    }
    Object.assign(role, {
      name: updateDto.name ?? role.name,
      description: updateDto.description ?? role.description,
    });
    return this.roleRepository.save(role);
  }

  async removeRole(id: string) {
    const role = await this.findRole(id);
    await this.roleRepository.remove(role);
  }

  // --- Audit Logs ---

  async findAllAuditLogs(filterDto: FilterAuditLogDto) {
    const { page = 1, limit = 10, search, action } = filterDto;
    const queryBuilder = this.auditLogRepository.createQueryBuilder("log");

    if (search) {
      queryBuilder.andWhere(
        "(log.user_name ILIKE :search OR log.action ILIKE :search OR log.details ILIKE :search)",
        { search: `%${search}%` },
      );
    }
    if (action) {
      queryBuilder.andWhere("log.action = :action", { action });
    }

    queryBuilder.orderBy("log.created_at", "DESC");

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      next: page < totalPages ? Number(page) + 1 : null,
      previous: page > 1 ? Number(page) - 1 : null,
    };
  }

  async createAuditLog(
    userId: string,
    userName: string,
    action: string,
    details: string,
  ) {
    const log = this.auditLogRepository.create({
      userId,
      userName,
      action,
      details,
    });
    return this.auditLogRepository.save(log);
  }
}
