import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

import { Role } from "../common/role.enum";

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
    const rawRole = (payload.role || "").toString().trim().toUpperCase();
    let normalizedRole = payload.role;

    if (rawRole === "BUSINESS" || rawRole === "OWNER") {
      normalizedRole = Role.Business;
    } else if (
      rawRole === "CUSTOMER" ||
      rawRole === "PARTICIPANT" ||
      rawRole === "USER"
    ) {
      normalizedRole = Role.Participant;
    } else if (rawRole === "ADMIN") {
      normalizedRole = Role.Admin;
    } else if (rawRole === "STAFF") {
      normalizedRole = Role.Staff;
    } else if (rawRole === "PARTNER") {
      normalizedRole = Role.Partner;
    } else if (rawRole === "NETWORK") {
      normalizedRole = Role.Network;
    }

    return {
      id: payload.sub,
      email: payload.username,
      role: normalizedRole,
      isEmailVerified: payload.isEmailVerified ?? true,
      hasActiveSubscription: payload.hasActiveSubscription,
      isSuperBusiness: payload.isSuperBusiness,
    };
  }
}
