import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerName, customerEmail, deliveryAddress, items } = createOrderDto;

    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.productRepo.findOne({ where: { id: item.productId } });
      if (!product) {
        throw new NotFoundException(`Produto com ID ${item.productId} não encontrado.`);
      }

      const orderItem = this.orderItemRepo.create({
        product,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      orderItems.push(orderItem);
    }

    const order = this.orderRepo.create({
      customerName,
      customerEmail,
      deliveryAddress,
      items: orderItems,
      status: OrderStatus.PENDING,
    });

    return this.orderRepo.save(order);
  }


  async findAll(filters: { startDate?: string, endDate?: string }): Promise<Order[]> {
    let where: any = {};

    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(
        new Date(filters.startDate),
        new Date(filters.endDate)
      );
    } else if (filters.startDate) {
      where.createdAt = MoreThanOrEqual(new Date(filters.startDate));
    } else if (filters.endDate) {
      where.createdAt = LessThanOrEqual(new Date(filters.endDate));
    }

    return this.orderRepo.find({
      relations: [
        'items',        // relação com OrderItem
        'items.product' // relação com Product através de OrderItem
      ],
      where: where,
      order: { createdAt: 'DESC' }
    });
  }

  // Busca pedidos de um usuário específico
  async findById(id: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      relations: [
        'items',
        'items.product'
      ],
      where: { id }
    })
  }
}
