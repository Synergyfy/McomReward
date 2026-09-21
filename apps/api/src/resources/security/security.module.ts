import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./entities/permission.entity";
import { Role } from "./entities/role.entity";
import { AuditLog } from "./entities/audit-log.entity";
import { SecurityService } from "./security.service";
import { AdminSecurityController } from "./security.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role, AuditLog])],
  controllers: [AdminSecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
