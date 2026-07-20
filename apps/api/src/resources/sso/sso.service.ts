import {
  Injectable,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../user/user.service";
import { McomCentralService, CentralPackage } from "./mcom-central.service";
import { MembershipService } from "../membership/membership.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Business } from "../business/entities/business.entity";
import { Participant } from "../participant/entities/participant.entity";
import { Repository } from "typeorm";
import { Role } from "../../common/role.enum";
import * as crypto from "crypto";
import { nanoid } from "nanoid";
import { ConfigService } from "@nestjs/config";

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
  email: string;
  name?: string;
  role?: string;
}

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);
  private readonly mallFrontendUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mcomCentralService: McomCentralService,
    private readonly membershipService: MembershipService,
    private readonly configService: ConfigService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>
  ) {
    this.mallFrontendUrl = this.configService.get<string>(
      "LOYALTY_FRONTEND_URL",
      "http://localhost:3005"
    );
  }

  async exchangeCode(code: string): Promise<SsoCallbackResult> {
    const redirectUri = `${this.mallFrontendUrl}/auth/callback`;

    const tokenResponse = await this.mcomCentralService.exchangeCodeForToken(
      code,
      redirectUri
    );

    const centralUser: CentralUser | undefined = tokenResponse?.user;
    if (!centralUser?.email) {
      throw new UnauthorizedException("No user data from MCOM Central");
    }

    const user = await this.jitProvisionUser(centralUser);

    let rewardsPackage: CentralPackage | null = null;
    if (tokenResponse?.access_token && user.role === Role.Business) {
      rewardsPackage = await this.syncSubscriptionFromCentral(
        user.id,
        tokenResponse.access_token
      );
    }

    const payload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      isEmailVerified: true,
      hasActiveSubscription: rewardsPackage?.status === "active"
        && new Date(rewardsPackage.expiresAt) > new Date(),
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

  private async jitProvisionUser(centralUser: CentralUser): Promise<Business | Participant> {
    const email = centralUser.email.toLowerCase().trim();

    let user = await this.userService.findOne(email);

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const role = centralUser.role?.toLowerCase();

      if (role === "owner" || role === "business") {
        const newBusiness = this.businessRepository.create({
          email,
          name: centralUser.name || email.split("@")[0],
          password: randomPassword,
          role: Role.Business,
          isEmailVerified: true,
          uniqueCode: nanoid(9),
        });
        user = await this.businessRepository.save(newBusiness);
        this.logger.log(`JIT provisioned business user: ${email}`);
      } else {
        const newParticipant = this.participantRepository.create({
          email,
          name: centralUser.name || email.split("@")[0],
          password: randomPassword,
          role: Role.Participant,
          isEmailVerified: true,
        });
        user = await this.participantRepository.save(newParticipant);
        this.logger.log(`JIT provisioned participant user: ${email}`);
      }
    } else if (centralUser.name && user.name !== centralUser.name) {
      user.name = centralUser.name;
      if (user instanceof Business) {
        await this.businessRepository.save(user);
      } else if (user instanceof Participant) {
        await this.participantRepository.save(user);
      }
    }

    return user;
  }

  private async syncSubscriptionFromCentral(
    businessId: string,
    centralAccessToken: string
  ): Promise<CentralPackage | null> {
    try {
      const centralUser =
        await this.mcomCentralService.getUserInfo(centralAccessToken);

      if (!centralUser?.packages) {
        this.logger.log(
          `No packages found in MCOM Central for business ${businessId}`
        );
        return null;
      }

      const rewardsPackage = centralUser.packages.find(
        (p) =>
          p.platform === "MCOM Rewards" &&
          p.status === "active" &&
          new Date(p.expiresAt) > new Date()
      );

      if (rewardsPackage) {
        await this.membershipService.syncFromCentralPackage(
          businessId,
          rewardsPackage
        );
        this.logger.log(
          `Synced MCOM Central package "${rewardsPackage.packageName}" for business ${businessId}`
        );
        return rewardsPackage;
      } else {
        this.logger.log(
          `No active MCOM Rewards package found for business ${businessId}`
        );
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Failed to sync subscription from MCOM Central: ${error?.message}`,
        error?.stack
      );
      return null;
    }
  }

  async loginWithSsoToken(token: string): Promise<SsoLoginResult> {
    const secret = this.configService.get<string>(
      "SSO_SECRET",
      "shared-sso-secret"
    );

    let payload: any;
    try {
      payload = this.jwtService.verify(token, { secret });
    } catch (error) {
      this.logger.warn(`SSO token verification failed: ${error?.message}`);
      throw new UnauthorizedException("SSO token verification failed");
    }

    if (
      !["mcom-loyalty", "mcom-central"].includes(payload.iss) ||
      !["mcom-mall", "mcom-ecosystem", "mcom-loyalty"].includes(payload.aud)
    ) {
      throw new UnauthorizedException("Invalid SSO Token Issuer/Audience");
    }

    const user = await this.jitProvisionUser({
      email: payload.email,
      name: payload.name,
      role: payload.role,
    });

    // Sync subscription from MCOM Central if packages are present in token
    let rewardsPackage: any = null;
    if (user.role === Role.Business) {
      // Handle both formats: packages (array) and platforms (object)
      if (payload.packages) {
        rewardsPackage = payload.packages.find(
          (p: any) =>
            p.platform === "MCOM Rewards" &&
            p.status === "active" &&
            new Date(p.expiresAt) > new Date()
        );
      } else if (payload.platforms?.["MCOM Rewards"]) {
        const platform = payload.platforms["MCOM Rewards"];
        if (platform.expiresAt && new Date(platform.expiresAt) > new Date()) {
          rewardsPackage = {
            platform: "MCOM Rewards",
            packageName: platform.planId,
            status: "active",
            expiresAt: platform.expiresAt,
          };
        }
      }

      if (rewardsPackage) {
        try {
          await this.membershipService.syncFromCentralPackage(
            user.id,
            rewardsPackage
          );
          this.logger.log(
            `Synced MCOM Central package for business ${user.id} via SSO token`
          );
        } catch (error) {
          this.logger.warn(
            `Failed to sync subscription: ${error?.message}`
          );
        }
      }
    }

    const jwtPayload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      isEmailVerified: true,
      hasActiveSubscription: rewardsPackage?.status === "active"
        && new Date(rewardsPackage.expiresAt) > new Date(),
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
