import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreateInvoiceDto } from "./dto";

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: { clientId: dto.clientId, amount: dto.amount, dueDate: new Date(dto.dueDate) }
    });
  }

  findAll() {
    return this.prisma.invoice.findMany({
      include: { client: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  findByClient(clientId: string) {
    return this.prisma.invoice.findMany({
      where: { clientId },
      include: { client: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async uploadPaymentProof(invoiceId: string, clientId: string, dto: { paymentProofUrl: string; paymentProofKey: string }) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { paymentProofUrl: dto.paymentProofUrl, paymentProofKey: dto.paymentProofKey, status: "PAID" } as any
    });
  }
}
