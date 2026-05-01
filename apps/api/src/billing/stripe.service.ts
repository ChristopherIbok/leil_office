import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("STRIPE_SECRET_KEY");
    this.stripe = new Stripe(apiKey || "sk_test_placeholder", {
      apiVersion: "2023-10-16"
    });
  }

  async createCustomer(email: string, name: string) {
    return this.stripe.customers.create({ email, name });
  }

  async createCheckoutSession(customerId: string, amount: number, description: string) {
    return this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: description },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${this.config.get("WEB_ORIGIN")}/billing?success=true`,
      cancel_url: `${this.config.get("WEB_ORIGIN")}/billing?canceled=true`
    });
  }

  async createPaymentIntent(amount: number, currency = "usd") {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency
    });
  }

  async getPaymentMethods(customerId: string) {
    return this.stripe.paymentMethods.list({
      customer: customerId,
      type: "card"
    });
  }

  constructWebhookEvent(payload: string, signature: string) {
    const endpointSecret = this.config.get("STRIPE_WEBHOOK_SECRET");
    return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret || "");
  }
}