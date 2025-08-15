import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { SectionsModule } from './sections/sections.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { BannersModule } from './banners/banners.module';
import { PaymentModule } from './payment/payment.module';
import { EmailModule } from './email/email.module';
import { OrderModule } from './order/order.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { TrackingEventsModule } from './tracking-events/tracking-events.module';
import * as dotenv from 'dotenv';

dotenv.config();
const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: configService.get<boolean>('SMTP_SECURE'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('EMAIL_FROM'),
        },
        template: {
          dir: join(__dirname, '..', 'src/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    ProductsModule,
    UploadModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      ...(isProd && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      synchronize: true,
    }),
    SectionsModule,
    UsersModule,
    AuthModule,
    AddressModule,
    CartItemModule,
    BannersModule,
    PaymentModule,
    EmailModule,
    OrderModule,
    TrackingEventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
