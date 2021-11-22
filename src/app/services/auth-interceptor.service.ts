import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private oktaAuth: OktaAuth) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next));
  }


  private async handleAccess(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    // Only add an access token for secured endpoints
    const orderEndPoint = environment.BASE_URL + '/orders'
    const securedEndpoints = [orderEndPoint]

    if(securedEndpoints.some(url => req.urlWithParams.includes(url))){
      // if true get access token
      const accessToken = await this.oktaAuth.getAccessToken()

      // clone the request because it is immutable

      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }

      })
    }
    return next.handle(req).toPromise()
  }
}
