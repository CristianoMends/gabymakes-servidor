import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItem } from './entities/cart-item.entity';
import { AddItemDto } from './dto/add-item-dto';
@Controller('cart-item')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) { }


  @Get(':userId')
  async getUserCart(@Param('userId') userId: string): Promise<CartItem[]> {
    return this.cartItemService.getCartItemsByUserId(userId);
  }

  @Post('add')
  async addItem(@Body() addItemDto: AddItemDto): Promise<CartItem> {
    const { userId, productId, quantity } = addItemDto;
    return this.cartItemService.addItemToCart(userId, productId, quantity);
  }

  @Delete('remove/:itemId')
  async removeItem(@Param('itemId', ParseIntPipe) itemId: number): Promise<{ message: string }> {
    await this.cartItemService.removeItemFromCart(itemId);
    return { message: 'Item removido com sucesso' };
  }
}
