import { User } from "../entities/user.entity";

export class ViewUserDto {
    id: string;

    email: string;

    password?: string;

    firstName?: string;

    lastName?: string;

    whatsapp?: string;

    gender?: string;

    googleId?: string;

    role: string

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.password = user.password;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.whatsapp = user.whatsapp;
        this.gender = user.gender;
        this.googleId = user.googleId;
        this.role = user.role;
    }
}