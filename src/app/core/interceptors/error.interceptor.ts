import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toast: ToastService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'An unexpected error occurred';

        switch (error.status) {
          case 401:
            message = 'Session expired. Please login again.';
            this.authService.logout();
            break;
          case 403:
            message = 'You do not have permission to perform this action.';
            break;
          case 404:
            message = error.error?.message || 'Resource not found.';
            break;
          case 409:
            message = error.error?.message || 'A conflict occurred (duplicate data).';
            break;
          case 400:
            if (error.error?.data) {
              const validationErrors = Object.values(error.error.data).join(', ');
              message = `Validation failed: ${validationErrors}`;
            } else {
              message = error.error?.message || 'Invalid request.';
            }
            break;
          case 500:
            message = 'Server error. Please try again later.';
            break;
          default:
            message = error.error?.message || message;
        }

        this.toast.error(message);
        return throwError(() => error);
      })
    );
  }
}
