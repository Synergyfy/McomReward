import {
  Controller,
  UnauthorizedException,
  BadRequestException,
  Body,
  Post,
  Logger,
} from "@nestjs/common";
import { SsoService } from "./sso.service";
import { Public } from "../../common/decorators/public.decorator";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";

@ApiTags("sso")
@Controller("sso")
export class SsoController {
  private readonly logger = new Logger(SsoController.name);

  constructor(private readonly ssoService: SsoService) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login via shared-secret SSO token" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        token: { type: "string", description: "SSO JWT token" },
      },
      required: ["token"],
    },
  })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "SSO login failed" })
  async ssoLogin(@Body("token") token: string) {
    if (!token) {
      throw new UnauthorizedException("Token is required");
    }

    try {
      return await this.ssoService.loginWithSsoToken(token);
    } catch (error) {
      this.logger.error(
        `SSO login failed: ${error?.message || error}`,
        error?.stack
      );
      throw new UnauthorizedException("SSO login failed");
    }
  }

  @Public()
  @Post("exchange")
  @ApiOperation({ summary: "Exchange OAuth2 auth code for tokens" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Authorization code from MCOM Central" },
      },
      required: ["code"],
    },
  })
  @ApiResponse({ status: 200, description: "Exchange successful" })
  @ApiResponse({ status: 400, description: "Missing authorization code" })
  @ApiResponse({ status: 401, description: "Exchange failed" })
  async exchangeCode(@Body("code") code: string) {
    if (!code) {
      throw new BadRequestException("Authorization code is required");
    }

    try {
      return await this.ssoService.exchangeCode(code);
    } catch (error) {
      this.logger.error(
        `SSO code exchange failed: ${error?.message || error}`,
        error?.stack
      );
      throw new UnauthorizedException("SSO code exchange failed");
    }
  }
}
