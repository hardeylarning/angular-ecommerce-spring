import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  

  
  private baseUrl = environment.BASE_URL+"/products";

  private categoryUrl = environment.BASE_URL+"/product-category";

  constructor(private httpClient: HttpClient) { }


  // get panination
  getProductListPaginate(thePage:number, thePageSize:number, categoryId: number): Observable<GetResponseProducts> {
    //@TODO

    let searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`
                      +`&page=${thePage}&size=${thePageSize}`
    
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  } 

  getProductList(categoryId: number): Observable<Product[]> {
    //@TODO

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`
    
    return this.getProducts(searchUrl);
  } 

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductsCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  searchProducts(theKeyword: string) {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
    
    return this.getProducts(searchUrl);
  }

  searchProductsPaginate(thePage:number, thePageSize:number, theKeyword: string): Observable<GetResponseProducts> {
    //@TODO

    let searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
                      +`&page=${thePage}&size=${thePageSize}`
    
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  } 

  

  private getProducts(searchUrl: string) {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProduct(theProductId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${theProductId}`;

    return this.httpClient.get<Product>(productUrl);
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[]
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductsCategory {
  _embedded: {
    productCategory: ProductCategory[]
  }
}
