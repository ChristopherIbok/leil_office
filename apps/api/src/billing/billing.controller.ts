import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthUser, CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { BillingService } from "./billing.service";
import { CreateInvoiceDto } from "./dto";

@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post("invoices")
  @Roles("ADMIN")
  create(@Body() dto: CreateInvoiceDto) {
    return this.billing.create(dto);
  }

  @Get("invoices")
  findAll(@CurrentUser() user: AuthUser) {
    if (user.role === "CLIENT") {
      return this.billing.findByClient(user.sub);
    }
    return this.billing.findAll();
  }
}
