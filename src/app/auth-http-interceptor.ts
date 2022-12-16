import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs"
import { AuthService } from "./auth.service";


@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
    constructor(public authService: AuthService){}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('token');
        if (token) {
          const cloned = req.clone({
            headers: req.headers.set('Authorization', 'Bearer '.concat(token)).set('Content-Type', 'application/json')
          });
          return next.handle(cloned);
        } else {
          return next.handle(req);
        }
    }
}