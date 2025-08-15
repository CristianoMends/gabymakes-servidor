import { Product } from "src/products/entities/product.entity";
import { TrackingEvent } from "../entities/tracking-event.entity";
import { ViewUserDto } from "src/users/dto/view-user-dto";


export default class TrackingEventView {

    id: number;
    type: string; // "search", "click", "whatsapp_click", "view"
    term?: string; // usado para pesquisas
    product?: Product;
    user?: ViewUserDto;
    extra?: string; // JSON.stringify(...) para dados adicionais
    createdAt: Date;


    constructor(t: TrackingEvent) {
        this.id = t.id;
        this.type = t.type;
        this.term = t.term;
        this.product = t.product;
        this.extra = t.extra;
        this.createdAt = t.createdAt;

        if(t.user){
            this.user = new ViewUserDto(t.user);
        }
    }

}