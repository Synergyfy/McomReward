import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("jwt.secret"),
    });
  }

  async validate(payload: any) {
    // Backwards compatible: tokens issued before businessId existed keep working.
    // Business users fall back to sub as their tenant id; Staff is enriched
    // lazily by TenantOwnershipGuard via DB lookup (cached).
    const role = payload.role;
    let businessId: string | undefined = payload.businessId;
    if (!businessId && role === "Business") {
      businessId = payload.sub;
    }
    return {
      id: payload.sub,
      email: payload.username,
      role: payload.role,
      isEmailVerified: payload.isEmailVerified,
      hasActiveSubscription: payload.hasActiveSubscription,
      isSuperBusiness: payload.isSuperBusiness,
      ...(businessId ? { businessId } : {}),
    };
  }
}
