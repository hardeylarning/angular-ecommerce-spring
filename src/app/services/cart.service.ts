import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  

  cartItems: CartItem [] = []
  totalPrice: Subject<number> = new BehaviorSubject<number>(0)
  totalQuantity: Subject<number> = new BehaviorSubject(0)

  // storage: Storage = sessionStorage;

  storage: Storage = localStorage;


  constructor() { 
    // read data from storage
    let data = JSON.parse(this.storage.getItem('cartItems'))

    if(data != null){
      this.cartItems = data

      // compute totals based on the data read from storage

      this.computeCartTotals()
    }
  }

  addToCart(theCartItem: CartItem){
    let alreadyExistsInCart: boolean = false
    let existingCartItem: CartItem = undefined

    if (this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find(item => item.id === theCartItem.id)
      //
      alreadyExistsInCart = (existingCartItem != undefined)
    }

    if (alreadyExistsInCart) {
      existingCartItem.quantity++
    }
    else {
      this.cartItems.push(theCartItem)
    }

    this.computeCartTotals()

  }
  computeCartTotals() {
    let totalPriceValue: number = 0
    let totalQuantityValue: number = 0

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice
      totalQuantityValue += currentCartItem.quantity
    }

    // publish the new value with subject
    this.totalPrice.next(totalPriceValue)
    this.totalQuantity.next(totalQuantityValue)

    // log details
    this.logCartData(totalPriceValue, totalQuantityValue);

    // persist cart data
    this.persistCartItems()
  }

  persistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems))
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart')
    for (const item of this.cartItems) {
      const subTotalPrice = item.quantity * item.unitPrice

      console.log(`name: ${item.name}, quantity=${item.quantity}, unitPrice=${item.unitPrice}, Sub Total=${subTotalPrice}`)
    }
    console.log(`Total Price: ${totalPriceValue.toFixed(2)}, Total Quantity: ${totalQuantityValue}`)
    console.log('-----');
    
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if(theCartItem.quantity === 0){
      this.remove(theCartItem)
    }
    else {
      this.computeCartTotals()
    }
  }
  remove(theCartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(
      item => item.id == theCartItem.id
    )

    if(itemIndex > -1){
      this.cartItems.splice(itemIndex, 1)
    }

  }
}




