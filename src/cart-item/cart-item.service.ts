import { Injectable, NotFoundException } from '@nestjs/common';
import { CartItem } from './entities/cart-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { ViewCartDto } from './dto/view-cart-dto';

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

  async getCartItemsByUserId(userId: string): Promise<ViewCartDto[]> {

    const rawCartItems = await this.cartItemRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'user'],
    });
    const consolidatedCartMap: { [productId: string]: { id: number; quantity: number; product: Product } } = {};

    for (const item of rawCartItems) {
      const productId = item.product.id;

      if (consolidatedCartMap[productId]) {
        consolidatedCartMap[productId].quantity += item.quantity;
      } else {
        consolidatedCartMap[productId] = {
          id: item.id,
          product: item.product,
          quantity: item.quantity,
        };
      }
    }

    return Object.values(consolidatedCartMap).map((consolidatedData) => {
      const tempCartItem: CartItem = {
        id: consolidatedData.id,
        quantity: consolidatedData.quantity,
        product: consolidatedData.product,
      } as CartItem;

      return new ViewCartDto(tempCartItem);
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


  async removeItemFromCart(userId: string, productId: string): Promise<void> {

    const result = await this.cartItemRepository.delete({
      user: { id: userId },
      product: { id: productId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        'Nenhum item encontrado para este usuário e produto.',
      );
    }
  }

  async updateQuantity(userId: string, itemId: number, quantity: number): Promise<CartItem> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, user: { id: userId } },
      relations: ['product', 'user'],
    });

    if (!item) {
      throw new Error('Item do carrinho não encontrado');
    }

    if (quantity <= 0) {
      await this.cartItemRepository.delete(itemId);
      return new CartItem();
    }

    item.quantity = quantity;
    return await this.cartItemRepository.save(item);
  }


}
