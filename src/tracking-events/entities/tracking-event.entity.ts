import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('tracking_events')
export class TrackingEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string; // "search", "click", "whatsapp_click", "view"

    @Column({ nullable: true })
    term?: string; // usado para pesquisas

    @ManyToOne(() => Product, { nullable: true })
    product?: Product;

    @ManyToOne(() => User, { nullable: true })
    user?: User;

    @Column({ nullable: true })
    extra?: string; // JSON.stringify(...) para dados adicionais

    @CreateDateColumn()
    createdAt: Date;
}
