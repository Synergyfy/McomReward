import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PlaqueSalesService } from "./plaque-sales.service";
import {
  CreatePlaqueSaleDto,
  UpdatePayoutStatusDto,
  FilterPlaqueSaleDto,
} from "./dto/plaque-sale.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { PlaqueSale } from "./entities/plaque-sale.entity";

@ApiTags("Admin Sales")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/sales")
export class PlaqueSalesController {
  constructor(private readonly plaqueSalesService: PlaqueSalesService) {}

  @Get("analytics")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Get sales KPIs (Admin only)" })
  getAnalytics() {
    return this.plaqueSalesService.getAnalytics();
  }

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List plaque sales (Admin only)" })
  findAll(@Query() filterDto: FilterPlaqueSaleDto) {
    return this.plaqueSalesService.findAll(filterDto);
  }

  @Get(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Get a sale by ID (Admin only)" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.plaqueSalesService.findOne(id);
  }

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({
    summary: "Record a plaque sale and transfer ownership (Admin only)",
  })
  create(@Body() createDto: CreatePlaqueSaleDto) {
    return this.plaqueSalesService.create(createDto);
  }

  @Patch(":id/payout")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Update a sale's payout status (Admin only)" })
  updatePayout(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePayoutStatusDto,
  ) {
    return this.plaqueSalesService.updatePayoutStatus(id, updateDto);
  }
}