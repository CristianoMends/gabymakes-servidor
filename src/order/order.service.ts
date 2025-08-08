import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
