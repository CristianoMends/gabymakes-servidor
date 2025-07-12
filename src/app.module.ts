import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { SectionsModule } from './sections/sections.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { BannersModule } from './banners/banners.module';
import * as dotenv from 'dotenv';

dotenv.config();
const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
