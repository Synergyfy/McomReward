import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServiceMeshModule } from "../service-mesh/service-mesh.module";
import { CentralIntegrationService } from "./central-integration.service";

@Module({
  imports: [ConfigModule, ServiceMeshModule],
  providers: [CentralIntegrationService],
  exports: [CentralIntegrationService],
})
export class CentralIntegrationModule {}
