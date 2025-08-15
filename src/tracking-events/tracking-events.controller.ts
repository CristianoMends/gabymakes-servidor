import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { TrackingEventService } from './tracking-events.service';

@Controller('tracking')
export class TrackingEventController {
  constructor(private service: TrackingEventService) { }

  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  async findByType(@Query('type') type?: string) {
    return this.service.findByType(type);
  }
}
