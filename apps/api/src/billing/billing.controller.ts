import { Body, Controller, Get, Post } from "@nestjs/common";
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
  findAll() {
    return this.billing.findAll();
  }
}
