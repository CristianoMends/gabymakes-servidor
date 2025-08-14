import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Payments {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    paymentId?: string;

    @Column()
    userId: string;

    @Column()
    addressId: number;
}
