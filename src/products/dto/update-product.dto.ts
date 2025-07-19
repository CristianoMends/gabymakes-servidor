import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    price?: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;
}