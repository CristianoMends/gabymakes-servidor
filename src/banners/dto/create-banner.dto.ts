import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBannerDto {
    @ApiProperty({ example: 'https://example.com/banner.jpg' })
    @IsString()
    imageUrl: string;

    @ApiProperty({ example: 'Banner promocional de inverno' })
    @IsString()
    description: string;
}
