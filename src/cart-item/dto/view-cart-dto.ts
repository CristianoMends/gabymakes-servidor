import { Product } from "src/products/entities/product.entity";
import { CartItem } from "../entities/cart-item.entity";

export class ViewCartDto {
    id: number;
    quantity: number;
    product: Product;

    constructor(cardItem: CartItem) {
        this.id = cardItem.id;
        this.quantity = cardItem.quantity;
        this.product = cardItem.product;
    }
}

