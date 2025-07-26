import { User } from "../entities/user.entity";

export class ViewUserDto {
    id: string;

    email: string;

    firstName?: string;

    lastName?: string;

    whatsapp?: string;

    gender?: string;

    googleId?: string;

    role: string

    constructor(user: User | null) {
        if (user == null) return
        this.id = user.id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.whatsapp = user.whatsapp;
        this.gender = user.gender;
        this.googleId = user.googleId;
        this.role = user.role;
    }
}