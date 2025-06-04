import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { catchError, Observable, throwError } from 'rxjs';
import { TokenService } from "../core/services/token/token.service";
import {Injectable} from "@angular/core";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const token = this.tokenService.getToken();

    if (token !== null) {
      const clone = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + token),
      });
      return next
        .handle(clone)
        .pipe
        //catchError(() => {
        //return throwError('Session Expired');
        //}),
        ();
    }
    return next.handle(request);
  }
}

export const TokenInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: TokenInterceptor,
  multi: true,
};
