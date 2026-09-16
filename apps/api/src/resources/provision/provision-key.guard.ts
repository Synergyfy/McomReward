import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class ProvisionKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.PROVISION_API_KEY;
    if (!secret) {
      throw new ServiceUnavailableException(
        "Provision service is not configured",
      );
    }

    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers["x-api-key"] || request.headers.authorization;
    if (
      typeof header === "string" &&
      header.replace(/^Bearer\s+/i, "") === secret
    ) {
      return true;
    }

    throw new UnauthorizedException("Invalid provision key");
  }
}