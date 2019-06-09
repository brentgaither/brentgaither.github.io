---
layout: post
title:  Angular and Laravel Authentication
tags: [authentication, laravel]
---

I have been working on an Angular 6 application and i was struggling to get
all of the authentication setup. I read lots of articles on how to create the entire
OAuth workflow and I landed with the following solution for implicit grants.
First you will need to create a Laravel application, I won't go too much into
how to create a new application, but basically you need to run create the application 'laravel new authentication'
add authentication 'php artisan make:auth' and finally you can add passport (https://laravel.com/docs/master/passport)
#Install Laravel
Basic installation for passport includes running:

  * `composer require laravel/passport`
  * `php artisan migrate`
  * `php artisan passport:install`
  * add Laravel\Passport\HasApiTokens to your user class
  * add Passport::routes to AuthServiceProvider
  * add passport to your auth config
  * install the pre-built passport components with `php artisan vendor:publish --tag=passport-components`.

Make sure you are loading your app js after everything else has loaded so vue
can be fully loaded before you try to load its components (put the script tag for app js
  at the bottom of your layout page)

# Install Angular
For angular you will need to run a few commands to create the application. I put both the Angular
and Laravel app in the same repository since i wanted to keep it all together,
but it depends on how large the project is if you want to keep them together or not.
  * `npm install -g @angular/cli`
  * `ng new my-auth`
  * `cd my-auth`
  * `ng serve`

# Configure the OAuth server

Now you have a simple Angular application and a basic OAuth server setup with passport.
Now we can actually add some code to add authentication to the Angular app. To do this you will need to
first add a client to passport, you can navigate to the page on the Laravel site you made where you put
the passport components click create new client and add your app name as well as 'http://localhost:4200/callback' for the redirect url. If you are going to use a different port for your Angular application or if you are going to server this as a real site you will need to change the redirect to "yoursite/callback".

# Auth Service

 Once you have the client created we can add a service to detect if the user is logged in.
Create a new service named auth that looks like this

```typescript
import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AUTH_CONFIG } from './auth-config';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthResult } from './authResult.model';

@Injectable()
export class AuthService {

token: any;

// Create a stream of logged in status to communicate throughout app
loggedIn: boolean;
loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);

constructor(private router: Router, private http: HttpClient) {  }

getToken (): string {
  return localStorage.getItem('access_token');
}

public tryLogin() {
if (!this.isAuthenticated()) {
 // Send the user to the authenticaition server
  location.href = encodeURI(AUTH_CONFIG.AUTHENTICATION_SERVER + '?'
  + 'client_id=' + AUTH_CONFIG.CLIENT_ID
  + '&redirect_uri=' + AUTH_CONFIG.REDIRECT + '&response_type='
  + AUTH_CONFIG.RESPONSE_TYPE);
  }
}


public setSession(urlFragment): void {
  const authResult = this.parseQueryString(urlFragment);
  // Set the time that the Access Token will expire at
  const expiresAt = JSON.stringify((authResult.expires_in * 1000)
  + new Date().getTime());
  localStorage.setItem('access_token', authResult.access_token);
  localStorage.setItem('token_type', authResult.token_type);
  localStorage.setItem('expires_at', expiresAt);
}

public logout(): void {
  // Remove tokens and expiry time from localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('expires_at');
  // Go back to the home route
  this.router.navigate(['/']);
}

public isAuthenticated(): boolean {
  // Check whether the current time is past the
  // Access Token's expiry time
  const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
  return new Date().getTime() < expiresAt;
}

private parseQueryString ( queryString ): AuthResult {
  const params = {};
  let queries, temp, i, l;
  // Split into key/value pairs
  queries = queryString.split('&');
  // Convert the array of strings into an object
  for ( i = 0, l = queries.length; i < l; i++ ) {
    temp = queries[i].split('=');
    params[temp[0]] = temp[1];
  }
  const authResult = new AuthResult();
  authResult.access_token =  params['access_token'];
  authResult.expires_in =  params['expires_in'];
  authResult.token_type =  params['token_type'];
  return authResult;
}
}

```
This service will take care of the sending the user to the OAuth server
checking their token and parsing the token from the server. We need a few more
files to save all of the configurations for the authorization server.

```typescript
export class AuthResult {
  access_token: string;
  expires_in: number;
  token_type: string;
}
```

```typescript
interface AuthConfig {
  CLIENT_ID: string;
  REDIRECT: string;
  SCOPE: string;
  RESPONSE_TYPE: string;
  AUTHENTICATION_SERVER: string;
}

export const AUTH_CONFIG: AuthConfig = {
  CLIENT_ID: '1',
  REDIRECT: 'http://localhost:4200/callback',
  SCOPE: '',
  RESPONSE_TYPE: 'token',
  AUTHENTICATION_SERVER: 'http://127.0.0.1:8000/oauth/authorize'
};
```

# Callback component
 Now that we have a service to handle authentication we need to handle the callback
from the auth server. To do this create a new component (ng g c callback). It is a very simple component that will just
send some data to the auth service and maybe run a spinner while it waits. 

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  constructor(private authService: AuthService, private route: ActivatedRoute) { }

  accessToken: string;
  ngOnInit() {
    this.route.fragment.subscribe((fragment: string) => {
      this.authService.setSession(fragment);
    });
    location.href = '/';
  }
}
```

# Home component
 Lets create a simple component to check and see if the user is logged in (ng g c home) 
 
```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private authService: AuthService) {}

  public logout(): void {
    this.authService.logout();
  }
  public login(): void {
    this.authService.tryLogin();
  }

  public authenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
```

 Now add some html in the home component
 
``` html
      <button
      *ngIf="this.authenticated()"
      mat-menu-item
      aria-label="Logout"
      (click)="logout()">
      Log out
    </button>
    <button
      *ngIf="!this.authenticated()"
      mat-menu-item
      aria-label="Login"
      (click)="login()">
      Sign in
    </button>
```

# Routing
 We will also need to add RouterModule to the app module so the app can use Angular's routing. Create a simple routing module and import it into your app module.

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CallbackComponent } from './callback/callback.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, },
  { path: 'callback', component: CallbackComponent, },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  providers: []
})
export class AppRoutingModule {}
```

# Http interceptor
 Click the sign in button and it should all work! Oh no... "unsupported_grant_type", looks like something is setup
wrong for the authorization server. If we go to Laravel's documentation we can see that for implicit flow to work we need to add  Passport::enableImplicitGrant(); to AuthServiceProvider (right after where we registered the passport routes) Now everything should work and we will have an authorization token in local storage. Theres just one more thing. When we send requests to the server from a component we will have to go to the authorization service and add the token in the header. Instead of doing that on each request we can add an http interceptor to our project and let that take care of sending the token on each request. 

```typescript
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
constructor(private authService: AuthService) { }

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

  // Clone the request to add the new header.
  const authReq = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + this.authService.getToken())});

  // send the newly created request
  return next.handle(authReq).pipe(
      catchError((error, caught) => {
      // intercept the response error and displace it to the console
      console.log('Error Occurred');
      console.log(error);
      // return the error to the method that called it
      return observableThrowError(error);
  })) as any;
  }
}
```
 Once you add the class MyHttpInterceptor you need to add it to your providers in app module and it will send the header Authorization with Bearer and an access token on each request! 

```typescript
providers: [AuthService,
{
provide: HTTP_INTERCEPTORS,
useClass: MyHttpInterceptor,
multi: true
}],
```
