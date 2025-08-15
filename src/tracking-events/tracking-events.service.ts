import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TrackingEvent } from './entities/tracking-event.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import TrackingEventView from './dto/view-tracking-event.dto';

@Injectable()
export class TrackingEventService {
  constructor(
    @InjectRepository(TrackingEvent)
    private repo: Repository<TrackingEvent>,

    @InjectRepository(Product)
    private produtoRepo: Repository<Product>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { }

  create(data: Partial<TrackingEvent>) {
    const event = this.repo.create(data);
    return this.repo.save(event);
  }

  async findByType(type?: string) {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    const res = this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['product', 'user'],
    });

    return (await res).map(t => new TrackingEventView(t))
  }

}
