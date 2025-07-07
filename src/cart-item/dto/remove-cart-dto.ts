import { IsString } from 'class-validator';

export class RemoveCartItemDto {
    @IsString()
    userId: string;

    @IsString()
    productId: string;
}
