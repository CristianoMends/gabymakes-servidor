import { Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    ValidateNested,
} from 'class-validator';

class PaymentItemDto {

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsString()
    @IsNotEmpty()
    id: string;
}

export class CreatePaymentDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PaymentItemDto)
    items: PaymentItemDto[];

    @IsNumber()
    addressId: number;

    @IsString()
    userId: string
}