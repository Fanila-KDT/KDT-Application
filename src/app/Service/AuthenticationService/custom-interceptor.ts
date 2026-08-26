import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class CustomInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler):Observable<HttpEvent<unknown>> {
    const token = sessionStorage.getItem('jwtToken');
    request = request.clone({headers: request.headers.set('Authorization', 'bearer ' + token)});
    return next.handle(request);
  }
}
