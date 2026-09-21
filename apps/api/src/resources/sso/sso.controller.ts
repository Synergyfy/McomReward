import {
  Controller,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  Body,
  Get,
  Post,
  Query,
  Logger,
} from "@nestjs/common";
import { SsoService } from "./sso.service";
import { Public } from "../../common/decorators/public.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("sso")
@Controller("sso")
export class SsoController {
  private readonly logger = new Logger(SsoController.name);

  constructor(private readonly ssoService: SsoService) {}

  @Public()
  @Get("authorize-url")
  @ApiOperation({
    summary: "Get MCOM Central OAuth authorize URL and CSRF state",
  })
  @ApiQuery({
    name: "state",
    required: false,
    description: "Optional custom CSRF state",
  })
  @ApiQuery({
    name: "redirectUri",
    required: false,
    description: "Optional custom redirect URI",
  })
  getAuthorizeUrl(
    @Query("state") state?: string,
    @Query("redirectUri") redirectUri?: string,
  ) {
    return this.ssoService.getAuthorizeUrl(state, redirectUri);
  }

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
      throw new BadRequestException("Token is required");
    }

    try {
      return await this.ssoService.loginWithSsoToken(token);
    } catch (error) {
      this.logger.error(
        `SSO login failed: ${error?.message || error}`,
        error?.stack,
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
        code: { type: "string", description: "Authorization code" },
        redirectUri: { type: "string", description: "Optional redirect URI" },
      },
      required: ["code"],
    },
  })
  @ApiResponse({ status: 200, description: "Exchange successful" })
  @ApiResponse({ status: 401, description: "Exchange failed" })
  async exchangeCode(
    @Body("code") code: string,
    @Body("redirectUri") redirectUri?: string,
  ) {
    if (!code) {
      throw new BadRequestException("Authorization code is required");
    }

    try {
      return await (redirectUri
        ? this.ssoService.exchangeCode(code, redirectUri)
        : this.ssoService.exchangeCode(code));
    } catch (error) {
      this.logger.error(
        `SSO code exchange failed: ${error?.message || error}`,
        error?.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException(
        error?.message || "SSO code exchange failed",
      );
    }
  }

  @Public()
  @Post("callback")
  @ApiOperation({ summary: "Alias for exchange code" })
  async callback(
    @Body("code") code: string,
    @Body("redirectUri") redirectUri?: string,
  ) {
    return this.exchangeCode(code, redirectUri);
  }
}
