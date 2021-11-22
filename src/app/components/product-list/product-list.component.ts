import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId : number = 1
  previousCategoryId: number = 1;
  searchMode:boolean = false
  previousKeyword: string = null

  // pagination propertites
  thePageNumber: number = 1
  thePageSize: number = 5
  theTotalElements: number = 0
  

  constructor(private productService: ProductService,
              private route: ActivatedRoute,
              private cartService: CartService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    })
    
  }
  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword')

    if(this.searchMode)
      this.handleSearchProducts();
    
    else
    this.handleListProducts()
  }


  handleSearchProducts() {
    const theKeyword = this.route.snapshot.paramMap.get('keyword')
    
    if (theKeyword != this.previousKeyword) {
      this.thePageNumber = 1
    }

    this.previousKeyword = theKeyword

    console.log(`keyword=${theKeyword} pageNumber=${this.thePageNumber}`);

    // now search the product
    this.productService.searchProductsPaginate(
      this.thePageNumber - 1,
      this.thePageSize,
      theKeyword
    )
    .subscribe(this.processResult())
  }

  handleListProducts(){
    const hasCategory: boolean = this.route.snapshot.paramMap.has('id')

    if (hasCategory) {
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')
    }
    else {
      this.currentCategoryId = 1;
    }

    // check if we have a different category id than previous

    if (this.currentCategoryId != this.previousCategoryId) {
      this.thePageNumber = 1
    }

    this.previousCategoryId = this.currentCategoryId
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);
    

    this.productService.getProductListPaginate(
      this.thePageNumber - 1,
      this.thePageSize,
      this.currentCategoryId
    ).subscribe(this.processResult())
  }
  processResult() {
    return data => {
      this.products = data._embedded.products
      this.thePageNumber = data.page.number + 1
      this.thePageSize = data.page.size
      this.theTotalElements = data.page.totalElements
    }

    
  }

  updatePageSize(pageSize: number){
      this.thePageSize = pageSize
      this.thePageNumber = 1
      this.listProducts()
  }

  addToCart(product: Product){
    console.log(`Name: ${product.name}  Price: ${product.unitPrice}`);
    const theCartItem = new CartItem(product)
    this.cartService.addToCart(theCartItem) 
  }

}
