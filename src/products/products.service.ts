import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>
  ) { }

  async create(data: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(data);
    return await this.productRepo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find();
  }

  async findById(id: string): Promise<Product | null> {
    const p = this.productRepo.findOneBy({ id });

    if (!p) throw new NotFoundException('Produto não encontrado');

    return p;
  }
  async delete(id: string): Promise<void> {
    const product = await this.productRepo.findOneBy({ id });

    if (product) {

      product.isActive = false;
      await this.productRepo.save(product);
    } else {
      throw new NotFoundException('Produto não encontrado');
    }
  }


  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const updated = Object.assign(product, data);
    return this.productRepo.save(updated);
  }

  async findUniqueCategories(): Promise<string[]> {
    const categories = await this.productRepo
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL AND product.category != :emptyString', { emptyString: '' })
      .orderBy('product.category', 'ASC')
      .getRawMany();

    return categories.map(result => result.category);
  }

  async findUniqueBrands(): Promise<string[]> {
    const brands = await this.productRepo
      .createQueryBuilder('product')
      .select('DISTINCT product.brand', 'brand')
      .where('product.brand IS NOT NULL AND product.brand != :emptyString', { emptyString: '' })
      .orderBy('product.brand', 'ASC')
      .getRawMany();

    return brands.map(result => result.brand);
  }

  async findByFilters(filters: any): Promise<Product[]> {
    const commonSearchTerm = filters.description;

    const queryBuilder = this.productRepo.createQueryBuilder('product');

    let isFirstCondition = true;

    if (commonSearchTerm) {

      queryBuilder.where(
        `product.description ILIKE :searchTerm`,
        { searchTerm: `%${commonSearchTerm}%` }
      );

      queryBuilder.orWhere(
        `product.brand ILIKE :searchTerm`,
        { searchTerm: `%${commonSearchTerm}%` }
      );
      queryBuilder.orWhere(
        `product.category ILIKE :searchTerm`,
        { searchTerm: `%${commonSearchTerm}%` }
      );
      isFirstCondition = false;
    }

    if (filters.brand) {
      const condition = `product.brand ILIKE :brand`;
      if (isFirstCondition) {
        queryBuilder.where(condition, { brand: `%${filters.brand}%` });
        isFirstCondition = false;
      } else {
        queryBuilder.andWhere(condition, { brand: `%${filters.brand}%` });
      }
    }

    if (filters.category) {
      const condition = `product.category ILIKE :category`;
      if (isFirstCondition) {
        queryBuilder.where(condition, { category: `%${filters.category}%` });
        isFirstCondition = false;
      } else {
        queryBuilder.andWhere(condition, { category: `%${filters.category}%` });
      }
    }

    if (filters.isActive !== undefined) {
      const condition = `product.isActive = :isActive`;
      if (isFirstCondition) {
        queryBuilder.where(condition, { isActive: filters.isActive });
        isFirstCondition = false;
      } else {
        queryBuilder.andWhere(condition, { isActive: filters.isActive });
      }
    }

    if (filters.priceMin || filters.priceMax) {
      const min = parseFloat(filters.priceMin) || 0;
      const max = parseFloat(filters.priceMax) || Number.MAX_VALUE;
      const condition = `product.price BETWEEN :priceMin AND :priceMax`;
      if (isFirstCondition) {
        queryBuilder.where(condition, { priceMin: min, priceMax: max });
        isFirstCondition = false;
      } else {
        queryBuilder.andWhere(condition, { priceMin: min, priceMax: max });
      }
    }
    if (filters.quantityMin || filters.quantityMax) {
      const min = parseInt(filters.quantityMin) || 0;
      const max = parseInt(filters.quantityMax) || Number.MAX_SAFE_INTEGER;
      const condition = `product.quantity BETWEEN :quantityMin AND :quantityMax`;
      if (isFirstCondition) {
        queryBuilder.where(condition, { quantityMin: min, quantityMax: max });
        isFirstCondition = false;
      } else {
        queryBuilder.andWhere(condition, { quantityMin: min, quantityMax: max });
      }
    }

    const results = await queryBuilder.getMany();
    return results;
  }

}