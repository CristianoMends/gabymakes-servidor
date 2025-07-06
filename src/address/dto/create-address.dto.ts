import { IsString, IsNotEmpty, IsNumber, Length, Matches } from 'class-validator';

export class CreateAddressDto {
    @IsString()
    @IsNotEmpty({ message: 'A rua é obrigatória' })
    @Length(3, 100, { message: 'A rua deve ter entre 3 e 100 caracteres' })
    @Matches(/.*\d+.*/, { message: 'A rua deve conter o número da residência' })
    street: string;

    @IsString()
    @IsNotEmpty({ message: 'A cidade é obrigatória' })
    @Length(2, 50, { message: 'A cidade deve ter entre 2 e 50 caracteres' })
    city: string;

    @IsString()
    @IsNotEmpty({ message: 'O estado é obrigatório' })
    @Matches(/^[A-Z]{2}$/, { message: 'O estado deve conter 2 letras maiúsculas (ex: CE)' })
    state: string;

    @IsString()
    @IsNotEmpty({ message: 'O CEP é obrigatório' })
    @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido (ex: 60000-000)' })
    zipCode: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
}
