import { HttpErrorResponse, HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const SKIP_SNACKBAR = new HttpContextToken(() => false);

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const skipSnackbar = req.context.get(SKIP_SNACKBAR);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`[HTTP ${error.status}] ${req.method} ${req.url}`, error.message);

      if (!skipSnackbar) {
        snackBar.open(
          `[HTTP ${error.status}] ${req.method} ${req.url}: ${error.message}`,
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
          },
        );
      }

      return throwError(() => error);
    }),
  );
};
