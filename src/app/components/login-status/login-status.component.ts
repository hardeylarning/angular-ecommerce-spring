import { Component, OnInit } from '@angular/core';
import { OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean = false
  userFullName: string

  storage:Storage = sessionStorage

  constructor(private oktaAuthService: OktaAuthStateService,
              private oktaAuth: OktaAuth) { }

  ngOnInit(): void {
    // subscribe to authentication
    this.oktaAuthService.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated
      
        this.getUserDetails()
      }
    )
  }
  getUserDetails() {
    if(this.isAuthenticated){
      this.oktaAuth.getUser().then(
        (res) => {
          this.userFullName = res.name

          // retrieve the user's email from authentication response and store in browser storage
          this.storage.setItem('userEmail', JSON.stringify(res.email))
        }
      )
    }
  }

  logout(){
    this.oktaAuth.signOut()
  }

}
