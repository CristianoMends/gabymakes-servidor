import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItem } from './entities/cart-item.entity';
import { AddItemDto } from './dto/add-item-dto';
import { ViewCartDto } from './dto/view-cart-dto';
import { UpdateQuantityDto } from './dto/update-item.dto';
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
  @Patch('update-quantity')
  async updateQuantity(@Body() dto: UpdateQuantityDto): Promise<ViewCartDto> {
    const { userId, itemId, quantity } = dto;

    const updatedItem = await this.cartItemService.updateQuantity(userId, itemId, quantity);
    return new ViewCartDto(updatedItem);
  }
}
