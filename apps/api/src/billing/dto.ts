import { IsDateString, IsNumber, IsString, Min } from "class-validator";

export class CreateInvoiceDto {
  @IsString()
  clientId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  dueDate: string;
}
