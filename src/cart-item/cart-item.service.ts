import { Injectable, NotFoundException } from '@nestjs/common';
import { CartItem } from './entities/cart-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async getCartItemsByUserId(userId: string): Promise<CartItem[]> {
    return this.cartItemRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'user'],
    });
  }

  async addItemToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const newItem = this.cartItemRepository.create({
      user,
      product,
      quantity,
    });

    return this.cartItemRepository.save(newItem);
  }

  async removeItemFromCart(itemId: number): Promise<void> {
    const result = await this.cartItemRepository.delete(itemId);
    if (result.affected === 0) throw new NotFoundException('Item do carrinho não encontrado');
  }

}
