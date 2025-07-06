import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly httpService: HttpService,

  ) { }

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const { street, city, state, zipCode, userId } = createAddressDto;

    const viaCepUrl = `https://viacep.com.br/ws/${zipCode}/json/`;
    const response = await firstValueFrom(this.httpService.get(viaCepUrl));
    const data = response.data;

    if (data.erro) {
      throw new BadRequestException('CEP inválido.');
    }

    if (
      data.uf.toLowerCase() !== state.toLowerCase() ||
      data.localidade.toLowerCase() !== city.toLowerCase()
    ) {
      throw new BadRequestException(
        `CEP não corresponde ao estado ou cidade informados: esperado ${data.localidade}, ${data.uf}`,
      );
    }

    const address = this.addressRepository.create({
      street,
      city,
      state,
      zipCode,
      user: { id: userId },
    });

    return await this.addressRepository.save(address);
  }

  async findAll(): Promise<Address[]> {
    return await this.addressRepository.find();
  }

  async findOne(id: number): Promise<Address | null> {
    return await this.addressRepository.findOneBy({ id });
  }

  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<Address | null> {
    const address = await this.addressRepository.findOneBy({ id });
    if (!address) {
      return null;
    }
    Object.assign(address, updateAddressDto);
    return await this.addressRepository.save(address);
  }

  async remove(id: number): Promise<Address | null> {
    const address = await this.addressRepository.findOneBy({ id });
    if (!address) {
      return null;
    }
    await this.addressRepository.remove(address);
    return address;
  }

  async findByUserId(id: string): Promise<Address[]> {
    return await this.addressRepository.find({
      where: { user: { id: id } },
      relations: ['user'],
    });
  }

}
