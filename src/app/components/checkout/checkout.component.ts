import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import {ShopFormService} from 'src/app/services/shop-form.service'
import { ShopValidator } from 'src/app/validators/shop-validator';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup
  totalPrice: number 
  totalQuantity:number 

  creditCardYears : number[] = []
  creditCardMonths : number[] = []

  countries: Country[]

  shippingAddressStates: State[]

  billingAddressStates: State[]

  storage: Storage = localStorage

  userEmail: Storage = sessionStorage

  currentYear : number = new Date().getFullYear()

  constructor(private formBuilder: FormBuilder, 
              private shopFormService: ShopFormService, 
              private cartService:CartService,
              private checkoutService: CheckoutService,
              private router: Router) {
    
   }

  ngOnInit(): void {

    this.reviewCartDetails()

    // user email from session

    const theEmail = JSON.parse(this.userEmail.getItem('userEmail'))
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidator.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidator.notOnlyWhiteSpace]),
        email: new FormControl(theEmail, [Validators.required, 
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidator.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidator.notOnlyWhiteSpace]),
        state: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidator.notOnlyWhiteSpace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidator.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidator.notOnlyWhiteSpace]),
        state: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidator.notOnlyWhiteSpace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', Validators.required),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidator.notOnlyWhiteSpace]),
        cardNumber: new FormControl('', [Validators.required, 
                                        Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      }),

    })

    // populate credit card years and months

    let startMonth: number = new Date().getMonth() + 1;
    console.log(`Start Month: ${startMonth}`)


    // displaying year
    this.getYear();

    //displaying month
    this.getMonth(startMonth)

    this.shopFormService.getCountries().subscribe(
      data => {
        console.log('Countires: '+JSON.stringify(data));
        
        this.countries = data
      }
    )
    //
  }
  reviewCartDetails() {
    // subscirbe to totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => {
        this.totalQuantity = totalQuantity
      }
    )
    // subscribe to total price

    this.cartService.totalPrice.subscribe(
      totalPrice => {
        this.totalPrice = totalPrice
      }
    )
  }




  onSubmit(){
    console.log("Handling the submit");
   
    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched()
      return
    }

    // set up order
    let order = new Order()
    order.totalPrice = this.totalPrice
    order.totalQuantity = this.totalQuantity

    // get cart items
    const cartItems = this.cartService.cartItems

    // create order items from cart items
    // - long way
    // let orderItems: OrderItem [] = []

    // for (let i = 0; i < cartItems.length; i++) {
    //   orderItems[i] = new OrderItem(cartItems[i])
      
    // }

    // - short way
    let orderItems: OrderItem[] = cartItems.map(
      item => new OrderItem(item)
    )

    // set up purchase
    let purchase = new Purchase()
    
    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value
    

    // populate purchase - shipping address

    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value

    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state))
    const shippingCountry: State = JSON.parse(JSON.stringify(purchase.shippingAddress.country))

    purchase.shippingAddress.state = shippingState.name
    purchase.shippingAddress.country = shippingCountry.name

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value

    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state))
    const billingCountry: State = JSON.parse(JSON.stringify(purchase.billingAddress.country))

    purchase.billingAddress.state = billingState.name
    purchase.billingAddress.country = billingCountry.name

    // populate purchase - order and orderItems
    purchase.order = order
    purchase.orderItems = orderItems

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: res => {
        alert(`Your order has been received. \nOrder tracking number: ${res.orderTrackingNumber}`)
        // reset cat
        this.resetCart()

      },
      error: err => {
        alert(`There was an error: ${err.message}`)
      }
    })
  }
  resetCart() {
    // reset cart data
    this.cartService.cartItems = []
    this.cartService.totalPrice.next(0)
    this.cartService.totalQuantity.next(0)

    this.storage.removeItem('cartItems')



    // reset the form
    this.checkoutFormGroup.reset()

    // navigate back to the products page
    this.router.navigateByUrl('/products')
  }

  // Customer getters
  get firstName() { return this.checkoutFormGroup.get('customer.firstName')}

  get lastName() { return this.checkoutFormGroup.get('customer.lastName')}

  get email() { return this.checkoutFormGroup.get('customer.email')}

  // shipping address getter
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city')}

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street')}

  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode')}

  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country')}

  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state')}

  // shipping address getter
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city')}

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street')}

  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode')}

  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country')}

  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state')}

  // Card Details getter
  get cardType() { return this.checkoutFormGroup.get('creditCard.cardType')}

  get nameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard')}

  get cardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber')}

  get securityCode() { return this.checkoutFormGroup.get('creditCard.securityCode')}

  get expirationYear() { return this.checkoutFormGroup.get('creditCard.expirationYear')}

  get expirationMonth() { return this.checkoutFormGroup.get('creditCard.expirationMonth')}

  copyShippingAddressToBillingAddress(event){
    if(event.target.checked){
      this.checkoutFormGroup.controls.billingAddress.setValue(
        this.checkoutFormGroup.controls.shippingAddress.value
      )

      this.billingAddressStates = this.shippingAddressStates

    }
    else{
       this.checkoutFormGroup.controls.billingAddress.reset() 
       this.billingAddressStates = []
    }
  }

  handleMonthsAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard')

    const currentYear = new Date().getFullYear()
    const selectedYear = Number(creditCardFormGroup.value.expirationYear)

    let startMonth: number

    if (currentYear == selectedYear) {
      startMonth = new Date().getMonth() + 1
    }
    else {
      startMonth = 1
    }

    this.getMonth(startMonth);
  }

  private getYear() {
    this.shopFormService.getCreditCardYears()
      .subscribe(data => {
        console.log("Retrieved credit card years =: " + JSON.stringify(data));
        this.creditCardYears = data;

      });
  }

  private getMonth(startMonth: number) {
    this.shopFormService.getCreditCardMonths(startMonth)
      .subscribe(data => {
        console.log("Retrieved credit card months =: " + JSON.stringify(data));
        this.creditCardMonths = data;
      });
  }

  getStates(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName)
    
    const countryCode = formGroup.value.country.code
    const countryName = formGroup.value.country.name
    
    console.log(`${formGroupName} country code: ${countryCode}`)
    console.log(`${formGroupName} country name: ${countryName}`)

    this.shopFormService.getStates(countryCode)
    .subscribe(data => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data
      }
      else {
        this.billingAddressStates = data
      }

      // select first item by default
      formGroup.get('state').setValue(data[0])

    })
  }
}
