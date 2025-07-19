import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  imageUrl: string;

  @Column()
  brand: string;

  @Column()
  category: string;

  @Column('int')
  quantity: number;

  @Column()
  isActive: boolean = true

  @OneToMany(() => CartItem, cartItem => cartItem.product)
  cartItems: CartItem[];
}