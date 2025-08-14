import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { EmailModule } from '../email/email.module';
import { OrderModule } from '../order/order.module';
import { User } from '../users/entities/user.entity';
import { Address } from '../address/entities/address.entity';

@Module({
  imports: [EmailModule, OrderModule,
    TypeOrmModule.forFeature([Product, User, Address]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule { }
