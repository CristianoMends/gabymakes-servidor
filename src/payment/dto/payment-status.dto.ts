import { IsNumber, IsString } from "class-validator";


export class PaymentStatusDto {
    @IsString()
    paymentId: string;

    @IsString()
    userId: string;

    @IsNumber()
    addressId: number;
}