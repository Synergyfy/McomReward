import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ProvisionService } from "./provision.service";
import { CreateProvisionDto } from "./dto/create-provision.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ProvisionKeyGuard } from "./provision-key.guard";

@ApiTags("Provision")
@ApiBearerAuth()
@Controller("provision")
@UseGuards(ProvisionKeyGuard)
export class ProvisionController {
  constructor(private readonly provisionService: ProvisionService) {}

  @Post()
  @ApiOperation({ summary: "Provision a new voucher code" })
  @ApiResponse({ status: 201, description: "Provision created." })
  async create(@Body() createProvisionDto: CreateProvisionDto) {
    return this.provisionService.create(createProvisionDto);
  }
}