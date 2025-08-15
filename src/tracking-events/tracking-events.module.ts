import { Module } from '@nestjs/common';
import { TrackingEventService } from './tracking-events.service';
import { TrackingEventController } from './tracking-events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingEvent } from './entities/tracking-event.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackingEvent, Product, User]),
  ],
  controllers: [TrackingEventController],
  providers: [TrackingEventService],
})
export class TrackingEventsModule { }
