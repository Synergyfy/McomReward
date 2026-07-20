import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class SystemApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-mcom-solution-api-key"];

    if (!apiKey) {
      throw new UnauthorizedException("Missing x-mcom-solution-api-key header");
    }

    const validApiKey = this.configService.get<string>("MCOM_SOLUTION_API_KEY");

    if (!validApiKey) {
      throw new UnauthorizedException("System API key not configured");
    }

    const a = Buffer.from(apiKey);
    const b = Buffer.from(validApiKey);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new UnauthorizedException("Invalid API key");
    }

    return true;
  }
}
