import { Injectable, UnauthorizedException, Logger, Inject, forwardRef } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../user/user.service";
import {
  McomCentralService,
  CentralPackage,
} from "./mcom-central.service";
import { PlanSubscriptionService } from "../plans/services/plan-subscription.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Business } from "../business/entities/business.entity";
import { Participant } from "../participant/entities/participant.entity";
import { Repository } from "typeorm";
import { Role } from "../../common/role.enum";
import * as crypto from "crypto";
import { nanoid } from "nanoid";
import { ConfigService } from "@nestjs/config";
import { encrypt, decrypt } from "../../common/utils/crypto.util";

export interface SsoCallbackResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
  name: string;
  role: string;
}

export interface SsoLoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    name: string;
    role: string;
  };
}

interface CentralUser {
  sub?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  membershipLevel?: string;
  membershipTier?: string;
  membershipStatus?: string;
}

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);
  private readonly mallFrontendUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mcomCentralService: McomCentralService,
    @Inject(forwardRef(() => PlanSubscriptionService))
    private readonly planSubscriptionService: PlanSubscriptionService,
    private readonly configService: ConfigService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {
    this.mallFrontendUrl = this.configService.get<string>(
      "LOYALTY_FRONTEND_URL",
      "http://localhost:3005",
    );
  }

  getAuthorizeUrl(
    state?: string,
    redirectUri?: string,
  ): { authorizeUrl: string; state: string } {
    const currentState = state || crypto.randomBytes(16).toString("hex");
    const authorizeUrl = this.mcomCentralService.getAuthorizeUrl(
      currentState,
      redirectUri,
    );
    return { authorizeUrl, state: currentState };
  }

  async exchangeCode(
    code: string,
    customRedirectUri?: string,
  ): Promise<SsoCallbackResult> {
    const redirectUri =
      customRedirectUri || `${this.mallFrontendUrl}/auth/callback`;

    const tokenResponse = await this.mcomCentralService.exchangeCodeForToken(
      code,
      redirectUri,
    );

    const centralUser: CentralUser | undefined = tokenResponse?.user;
    if (!centralUser?.email) {
      throw new UnauthorizedException("No user data from MCOM Central");
    }

    const rawAccessToken =
      tokenResponse.access_token || tokenResponse.accessToken;
    const rawRefreshToken =
      tokenResponse.refresh_token || tokenResponse.refreshToken;
    const expiresIn =
      tokenResponse.expires_in || tokenResponse.expiresIn || 3600;

    let user = await this.jitProvisionUser(centralUser);

    // Persist encrypted tokens and Central user details
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const centralSub = centralUser.sub || (centralUser as any).id;
    if (user instanceof Business) {
      if (centralSub) user.mcomUserId = centralSub;
      if (rawAccessToken) user.mcomAccessToken = encrypt(rawAccessToken);
      if (rawRefreshToken) user.mcomRefreshToken = encrypt(rawRefreshToken);
      user.mcomTokenExpiresAt = expiresAt;
      if (centralUser.membershipLevel)
        user.membershipLevel = centralUser.membershipLevel;
      if (centralUser.membershipTier)
        user.membershipTier = centralUser.membershipTier;
      if (centralUser.membershipStatus)
        user.membershipStatus = centralUser.membershipStatus;
      user = await this.businessRepository.save(user);
    } else if (user instanceof Participant) {
      if (centralSub) user.mcomUserId = centralSub;
      if (rawAccessToken) user.mcomAccessToken = encrypt(rawAccessToken);
      if (rawRefreshToken) user.mcomRefreshToken = encrypt(rawRefreshToken);
      user.mcomTokenExpiresAt = expiresAt;
      user = await this.participantRepository.save(user);
    }

    let rewardsPackage: CentralPackage | null = null;
    if (user.role === Role.Business) {
      const anyUser = centralUser as any;
      const businessProfile = anyUser?.businessProfile;
      const appPlan = businessProfile?.appPlan || anyUser?.appPlan;
      const permissions =
        anyUser?.permissions || (tokenResponse as any)?.permissions;
      const hasAccess =
        permissions?.canAccess_rewards_prod ??
        permissions?.canAccess_rewards ??
        true;

      if (hasAccess && appPlan && appPlan.status === "active") {
        const source = appPlan.source || "membership";
        const membershipTier = appPlan.membershipPlanName;
        this.logger.log(
          `User ${user.email} entitled to "${appPlan.planName}" via ${source}${membershipTier ? ` (bundle: ${membershipTier})` : ""}`,
        );
        if (this.planSubscriptionService.syncFromAppPlan) {
          await this.planSubscriptionService.syncFromAppPlan(user.id, appPlan);
        }
      } else if (!hasAccess) {
        this.logger.warn(
          `User ${user.email} does not have access permission for rewards (canAccess_rewards_prod: false)`,
        );
      } else {
        if (rawAccessToken) {
          await this.syncSubscriptionFromCentral(
            user.id,
            rawAccessToken,
          );
        }
        if (this.planSubscriptionService.syncFromCentralProfile) {
          await this.planSubscriptionService.syncFromCentralProfile(
            user.id,
            user.email,
          );
        }
      }
    }

    const hasActiveSubscription =
      user.role === Role.Business &&
      this.planSubscriptionService.hasActiveSubscription
        ? await this.planSubscriptionService.hasActiveSubscription(user.id)
        : true;

    const payload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      isEmailVerified: true,
      hasActiveSubscription,
      mcomUserId: user.mcomUserId,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: "1h" });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      name: user.name,
      role: user.role,
    };
  }

  async refreshCentralToken(userId: string): Promise<string> {
    const business = await this.businessRepository.findOne({
      where: { id: userId },
    });
    if (!business || !business.mcomRefreshToken) {
      throw new UnauthorizedException(
        "No MCOM Central refresh token found for this account",
      );
    }

    const plainRefreshToken = decrypt(business.mcomRefreshToken);
    const newTokens =
      await this.mcomCentralService.refreshToken(plainRefreshToken);

    business.mcomAccessToken = encrypt(newTokens.accessToken);
    if (newTokens.refreshToken) {
      business.mcomRefreshToken = encrypt(newTokens.refreshToken);
    }
    business.mcomTokenExpiresAt = new Date(
      Date.now() + (newTokens.expiresIn || 3600) * 1000,
    );
    await this.businessRepository.save(business);

    return newTokens.accessToken;
  }

  private async jitProvisionUser(
    centralUser: CentralUser,
  ): Promise<Business | Participant> {
    const email = centralUser.email.toLowerCase().trim();

    const rawRole = (centralUser.role || "").toUpperCase();
    const isBusiness = rawRole === "BUSINESS" || rawRole === "OWNER";
    const isCustomer =
      rawRole === "CUSTOMER" ||
      rawRole === "PARTICIPANT" ||
      rawRole === "USER";

    if (!isBusiness && !isCustomer) {
      throw new UnauthorizedException(
        `Role "${centralUser.role}" is not permitted to access MCOM Rewards. Only Business Owners and Customers are supported.`,
      );
    }

    let user = await this.userService.findOne(email);

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");

      if (isBusiness) {
        const newBusiness = this.businessRepository.create({
          email,
          name:
            centralUser.name ||
            `${centralUser.firstName || ""} ${centralUser.lastName || ""}`.trim() ||
            email.split("@")[0],
          firstName: centralUser.firstName || "",
          lastName: centralUser.lastName || "",
          password: randomPassword,
          role: Role.Business,
          isEmailVerified: true,
          uniqueCode: nanoid(9),
          mcomUserId: centralUser.sub || (centralUser as any).id,
          membershipLevel: centralUser.membershipLevel,
          membershipTier: centralUser.membershipTier,
          membershipStatus: centralUser.membershipStatus,
        });
        user = await this.businessRepository.save(newBusiness);
        this.logger.log(`JIT provisioned business user: ${email}`);
      } else {
        const newParticipant = this.participantRepository.create({
          email,
          name:
            centralUser.name ||
            `${centralUser.firstName || ""} ${centralUser.lastName || ""}`.trim() ||
            email.split("@")[0],
          password: randomPassword,
          role: Role.Participant,
          isEmailVerified: true,
          uniqueCode: nanoid(9),
          mcomUserId: centralUser.sub || (centralUser as any).id,
        });
        user = await this.participantRepository.save(newParticipant);
        this.logger.log(`JIT provisioned participant user: ${email}`);
      }
    } else {
      let changed = false;
      if (centralUser.name && user.name !== centralUser.name) {
        user.name = centralUser.name;
        changed = true;
      }
      if (centralUser.sub && !user.mcomUserId) {
        user.mcomUserId = centralUser.sub;
        changed = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        changed = true;
      }
      if (changed) {
        if (user instanceof Business) {
          await this.businessRepository.save(user);
        } else if (user instanceof Participant) {
          await this.participantRepository.save(user);
        }
      }
    }

    return user;
  }

  private async syncSubscriptionFromCentral(
    businessId: string,
    centralAccessToken: string,
  ): Promise<CentralPackage | null> {
    try {
      const centralUser =
        await this.mcomCentralService.getUserInfo(centralAccessToken);

      const anyUser = centralUser as any;
      const appPlan = anyUser?.businessProfile?.appPlan || anyUser?.appPlan;
      if (appPlan && appPlan.status === "active") {
        await this.planSubscriptionService.syncFromAppPlan(businessId, appPlan);
        this.logger.log(
          `Synced MCOM Central appPlan "${appPlan.planName}" for business ${businessId}`,
        );
        return {
          platform: appPlan.platform || "MCOM Rewards",
          packageName: appPlan.planName || "Standard Plan",
          planName: appPlan.planName || "Standard Plan",
          status: appPlan.status,
          limits: appPlan.limits || appPlan.quotas || {},
          expiresAt:
            appPlan.expiresAt ||
            new Date(Date.now() + 365 * 86400000).toISOString(),
          provider: "mcom_central",
          providerSubscriptionId: appPlan.planId || "appplan",
        };
      }

      if (!centralUser?.packages) {
        this.logger.log(
          `No packages or appPlan found in MCOM Central for business ${businessId}`,
        );
        return null;
      }

      const rewardsPackage = centralUser.packages.find(
        (p) =>
          (p.platform === "MCOM Rewards" ||
            p.platform === "rewards" ||
            p.platform === "loyalty") &&
          p.status === "active" &&
          new Date(p.expiresAt) > new Date(),
      );

      if (rewardsPackage) {
        await this.planSubscriptionService.syncFromCentralPackage(
          businessId,
          rewardsPackage,
        );
        this.logger.log(
          `Synced MCOM Central package "${rewardsPackage.packageName}" for business ${businessId}`,
        );
        return rewardsPackage;
      } else {
        this.logger.log(
          `No active MCOM Rewards package found for business ${businessId}`,
        );
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Failed to sync subscription from MCOM Central: ${error?.message}`,
        error?.stack,
      );
      return null;
    }
  }

  async loginWithSsoToken(token: string): Promise<SsoLoginResult> {
    const configuredSecret = this.configService.get<string>("SSO_SECRET");
    if (!configuredSecret && process.env.NODE_ENV === "production") {
      throw new UnauthorizedException("SSO is not configured on the server");
    }
    const secret = configuredSecret || "dev-sso-secret";

    let payload: any;
    try {
      payload = this.jwtService.verify(token, { secret });
    } catch (error) {
      this.logger.warn(`SSO token verification failed: ${error?.message}`);
      throw new UnauthorizedException("SSO token verification failed");
    }

    if (
      payload.iss &&
      payload.iss !== "mcom-loyalty" &&
      payload.iss !== "mcom-central" &&
      payload.iss !== "mcom-rewards"
    ) {
      throw new UnauthorizedException("Invalid SSO token issuer");
    }

    if (
      payload.aud &&
      payload.aud !== "mcom-mall" &&
      payload.aud !== "mcom-loyalty" &&
      payload.aud !== "mcom-rewards" &&
      payload.aud !== "mcom-ecosystem"
    ) {
      throw new UnauthorizedException("Invalid SSO token audience");
    }

    const user = await this.jitProvisionUser({
      sub: payload.userId || payload.sub,
      email: payload.email,
      name:
        payload.name ||
        `${payload.firstName || ""} ${payload.lastName || ""}`.trim(),
      role: payload.role,
      membershipLevel: payload.membershipLevel,
      membershipTier: payload.membershipTier,
      membershipStatus: payload.membershipStatus,
    });

    // Update mcomUserId if present
    const mcomSub = payload.userId || payload.sub;
    if (mcomSub && user.mcomUserId !== mcomSub) {
      user.mcomUserId = mcomSub;
      if (user instanceof Business) {
        await this.businessRepository.save(user);
      } else if (user instanceof Participant) {
        await this.participantRepository.save(user);
      }
    }

    // Sync subscription from MCOM Central if packages are present in token
    let rewardsPackage: any = null;
    if (user.role === Role.Business) {
      if (payload.packages) {
        rewardsPackage = payload.packages.find(
          (p: any) =>
            (p.platform === "MCOM Rewards" ||
              p.platform === "rewards" ||
              p.platform === "loyalty") &&
            p.status === "active" &&
            new Date(p.expiresAt) > new Date(),
        );
      } else if (
        payload.platforms?.["MCOM Rewards"] ||
        payload.platforms?.["rewards"] ||
        payload.platforms?.["loyalty"]
      ) {
        const platform =
          payload.platforms["MCOM Rewards"] ||
          payload.platforms["rewards"] ||
          payload.platforms["loyalty"];
        if (platform.expiresAt && new Date(platform.expiresAt) > new Date()) {
          rewardsPackage = {
            platform: "MCOM Rewards",
            packageName: platform.planId || platform.packageName,
            status: "active",
            expiresAt: platform.expiresAt,
          };
        }
      }

      if (rewardsPackage) {
        try {
          await this.planSubscriptionService.syncFromCentralPackage(
            user.id,
            rewardsPackage,
          );
          this.logger.log(
            `Synced MCOM Central package for business ${user.id} via SSO token`,
          );
        } catch (error) {
          this.logger.warn(`Failed to sync subscription: ${error?.message}`);
        }
      }

      await this.planSubscriptionService.syncFromCentralProfile(
        user.id,
        user.email,
      );
    }

    const hasActiveSubscription =
      user.role === Role.Business
        ? await this.planSubscriptionService.hasActiveSubscription(user.id)
        : true;

    const jwtPayload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      isEmailVerified: true,
      hasActiveSubscription,
      mcomUserId: user.mcomUserId,
    };

    return {
      accessToken: this.jwtService.sign(jwtPayload, { expiresIn: "1h" }),
      refreshToken: this.jwtService.sign(jwtPayload, { expiresIn: "7d" }),
      user: {
        name: user.name,
        role: user.role,
      },
    };
  }
}
