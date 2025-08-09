import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrdersService) { }

    @Get()
    async findAll(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.orderService.findAll({ startDate, endDate });
    }


    @Get(':id')
    findById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.orderService.findById(id);
    }
}
