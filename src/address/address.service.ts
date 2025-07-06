import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) { }

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create(createAddressDto);
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
