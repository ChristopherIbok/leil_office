import { Controller, Post, Req, Headers, RawBodyRequest } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { Request } from "express";
import { StripeService } from "../billing/stripe.service";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("webhooks")
export class WebhooksController {
  constructor(
    private readonly stripe: StripeService,
    private readonly prisma: PrismaService
  ) {}

  @Public()
  @Post("stripe")
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string
  ) {
    const payload = req.rawBody?.toString() || "";
    
    try {
      const event = this.stripe.constructWebhookEvent(payload, signature);
      
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const invoiceId = session.metadata?.invoiceId;
          
          if (invoiceId) {
            await this.prisma.invoice.update({
              where: { id: invoiceId },
              data: { status: "PAID" }
            });
          }
          break;
        }
        
        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          await this.prisma.invoice.updateMany({
            where: { clientId: invoice.customer as string },
            data: { status: "PAID" }
          });
          break;
        }
        
        case "invoice.payment_failed": {
          const invoice = event.data.object;
          await this.prisma.invoice.updateMany({
            where: { clientId: invoice.customer as string },
            data: { status: "OVERDUE" }
          });
          break;
        }
      }
      
      return { received: true };
    } catch (err) {
      console.error("Webhook error:", err);
      return { error: "Webhook signature verification failed" };
    }
  }
}