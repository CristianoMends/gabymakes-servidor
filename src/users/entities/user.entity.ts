import { Address } from 'src/address/entities/address.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    firstName?: string;

    @Column({ nullable: true })
    lastName?: string;

    @Column({ nullable: true })
    whatsapp?: string;

    @Column({ nullable: true })
    gender?: string;

    @Column({ nullable: true, unique: true })
    googleId?: string;

    @Column({ nullable: false })
    role: string

    @OneToMany(() => Address, address => address.user)
    addresses: Address[];
}