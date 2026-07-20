import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SsoController } from "./sso.controller";
import { SsoService } from "./sso.service";
import { McomCentralService } from "./mcom-central.service";
import { UserModule } from "../../user/user.module";
import { BusinessModule } from "../business/business.module";
import { MembershipModule } from "../membership/membership.module";
import { Business } from "../business/entities/business.entity";
import { Participant } from "../participant/entities/participant.entity";

@Module({
  imports: [
    UserModule,
    BusinessModule,
    MembershipModule,
    TypeOrmModule.forFeature([Business, Participant]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SsoController],
  providers: [SsoService, McomCentralService],
  exports: [SsoService],
})
export class SsoModule {}
