import { IsNotEmpty, IsString } from "class-validator";

export class AddItemDto {
    @IsString()
    @IsNotEmpty()
    userId: string;
    @IsString()
    @IsNotEmpty()
    productId: string;
    @IsString()
    @IsNotEmpty()
    quantity: number;
}