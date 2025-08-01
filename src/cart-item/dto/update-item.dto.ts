import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class UpdateQuantityDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsNumber() 
    @IsNotEmpty() 
    itemId: number;

    @IsNumber() 
    @IsPositive() 
    @IsNotEmpty() 
    quantity: number;
}