import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { tap, shareReplay } from 'rxjs/operators';
import * as moment from 'moment';
import { environment } from '../environments/environment';
import jwtDecode from 'jwt-decode';

interface JWTPayload {
  user_id: number;
  username: string;
  email: string;
  exp: number;
}

@Injectable()
export class AuthService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  refresh_token: any;
  private apiRoot = environment.app_url;
  private http: HttpClient;
  public redirectUrl: string | undefined;
  constructor(backend: HttpBackend, private router: Router) {
    this.http = new HttpClient(backend);
  }

  private setSession(authResult:any) {
    const token = authResult.access;
    this.refresh_token = authResult.refresh;
    const access = <JWTPayload> jwtDecode(token);
    const accessexpiresAt = moment.unix(access.exp);
    localStorage.setItem('token', authResult.access);
    localStorage.setItem('access_expires_at', JSON.stringify(accessexpiresAt.valueOf()));

    if (authResult.refresh){
      const refresh = <JWTPayload> jwtDecode(authResult.refresh);
      const refreshexpiresAt = moment.unix(refresh.exp);
      localStorage.setItem('refresh_token', authResult.refresh);
      localStorage.setItem('refresh_expires_at', JSON.stringify(refreshexpiresAt.valueOf()));
    }

  }

  token(){
    return localStorage.getItem('token');
  }

  login(username: string, password: string) {
    return this.http.post(
      this.apiRoot.concat('/api/v1/token'),
      JSON.stringify({ "username": username, "password": password }),
      this.httpOptions
    ).pipe(
      tap(response => {this.setSession(response), this.redirect()}),
      shareReplay(),
    ).subscribe();
  }

  redirect(): void {
    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
      this.redirectUrl = "";
    }
    else {
      this.router.navigate(['/']);
    }
  }

  signup(username: string, email: string, password1: string, password2: string) {
    // TODO: implement signup
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_expires_at');
    localStorage.removeItem('refresh_expires_at');
  }

  refreshToken() {
    if (moment().isBetween(this.getExpiration("access").subtract(1, 'days'), this.getExpiration("access"))){
      return "";
    }
    else{
      let httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
      };
      var formData: any = new FormData();
      formData.append('refresh', localStorage.getItem('refresh_token'));
      return this.http.post(
        this.apiRoot.concat('/api/v1/token/refresh'),
        formData,
      ).pipe(
        tap(response => this.setSession(response)),
        shareReplay(),
      ).subscribe();
    }
  }

  getExpiration(key: any) {
    let item = "";
    if (key == "access" ){
      item = "access_expires_at"
    }
    else {
      item = "refresh_expires_at"
    }
    const expiration = localStorage.getItem(item) as any;
    const expiresAt = JSON.parse(expiration);

    return moment(expiresAt);
  }

  isLoggedIn() {
    if (moment().isBefore(this.getExpiration("access"))){
      return true
    }
    else {
      if (moment().isBefore(this.getExpiration("refresh"))){
        this.refreshToken()
        return true
      }
      else {
        return false
      }
    }
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }
}

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
    if (this.authService.isLoggedIn()) {
      // this.authService.refreshToken();
      return true;
    } else {
      let url: string = state.url
      this.authService.logout();
      this.authService.redirectUrl = url;
      this.router.navigate(['login'], { state: { redirect: this.router.url } });
      return false;
    }
  }
}