import { Product } from "./product"

export class CartItem {
    id: number
    name: string
    imageUrl: string
    unitPrice: number
    quantity: number

    constructor(p: Product){
        this.id = p.id
        this.name = p.name
        this.imageUrl = p.imageUrl
        this.unitPrice = p.unitPrice
        this.quantity = 1
    }
}
