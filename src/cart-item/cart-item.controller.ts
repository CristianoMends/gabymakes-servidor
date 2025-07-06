import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItem } from './entities/cart-item.entity';
import { AddItemDto } from './dto/add-item-dto';
import { ViewCartDto } from './dto/view-cart-dto';
@Controller('cart-item')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) { }


  @Get(':userId')
  async getUserCart(
    @Param('userId') userId: string,
  ): Promise<ViewCartDto[]> {
    return await this.cartItemService.getCartItemsByUserId(userId);
  }

  @Post('add')
  async addItem(@Body() addItemDto: AddItemDto): Promise<ViewCartDto> {
    const { userId, productId, quantity } = addItemDto;
    const res = this.cartItemService.addItemToCart(userId, productId, quantity);
    return new ViewCartDto(await res);
  }

  @Delete('remove/:itemId')
  async removeItem(@Param('itemId', ParseIntPipe) itemId: number): Promise<{ message: string }> {
    await this.cartItemService.removeItemFromCart(itemId);
    return { message: 'Item removido com sucesso' };
  }
}
