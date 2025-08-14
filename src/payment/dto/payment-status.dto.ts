import { IsString } from "class-validator";


export class PaymentStatusDto {
    @IsString()
    paymentId: string;
}