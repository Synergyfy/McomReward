import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DataSource } from "typeorm";
import { Role } from "../role.enum";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { Staff } from "../../resources/staff/entities/staff.entity";

/**
 * TenantOwnershipGuard — BOLA/IDOR defense-in-depth.
 *
 * - Backwards compatible: old JWTs without `businessId` keep working.
 *   Business falls back to `user.id`; Staff is resolved via DB (cached).
 * - Runs AFTER ImpersonationGuard (admin impersonation sets role + id).
 * - Only enforces when a tenant id is explicitly present in params/query
 *   on business-scoped routes. Service-level ownership checks remain the
 *   primary enforcement (see CampaignService.findOne).
 */
@Injectable()
export class TenantOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(TenantOwnershipGuard.name);
  // Small in-memory cache for staff -> business lookups (60s TTL).
  private readonly staffCache = new Map<string, { businessId: string; exp: number }>();

  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request?.user;
    if (!user) return true; // JwtAuthGuard/RolesGuard handle unauthenticated
    if (user.impersonator) return true; // Admin impersonation — explicitly allowed

    if (user.role === Role.Business && !user.businessId) {
      user.businessId = user.id;
    }

    if (user.role === Role.Staff && !user.businessId) {
      const resolved = await this.resolveStaffBusiness(user.id);
      if (resolved) user.businessId = resolved;
    }

    // Only Business/Staff tenants are scoped. Admin/others bypass.
    if (user.role !== Role.Business && user.role !== Role.Staff) {
      return true;
    }
    if (!user.businessId) return true; // Fail-open (old token edge) — services still check

    const params = request.params ?? {};
    const query = request.query ?? {};
    const claimedTenant =
      params.businessId ?? params.business_id ?? query.businessId ?? query.business_id;

    if (
      typeof claimedTenant === "string" &&
      claimedTenant.length > 0 &&
      claimedTenant !== user.businessId
    ) {
      this.logger.warn(
        `BOLA blocked: user ${user.id} (tenant ${user.businessId}) -> ${request.method} ${request.url}`,
      );
      throw new ForbiddenException("Access to this resource is forbidden");
    }

    return true;
  }

  private async resolveStaffBusiness(staffId: string): Promise<string | null> {
    const now = Date.now();
    const cached = this.staffCache.get(staffId);
    if (cached && cached.exp > now) return cached.businessId;
    try {
      const repo = this.dataSource.getRepository(Staff);
      const staff = await repo.findOne({
        where: { id: staffId },
        relations: ["business"],
      });
      const businessId = staff?.business?.id ?? null;
      if (businessId) {
        this.staffCache.set(staffId, { businessId, exp: now + 60_000 });
        if (this.staffCache.size > 1000) {
          const first = this.staffCache.keys().next().value;
          if (first) this.staffCache.delete(first);
        }
      }
      return businessId;
    } catch (e) {
      this.logger.error(`Staff tenant lookup failed for ${staffId}`, e as any);
      return null;
    }
  }
}
