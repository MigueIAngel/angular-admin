import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class Notifier {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  success(key: string): void {
    this.snackBar.open(this.translate.instant(key), undefined, { duration: 3000 });
  }

  /** Shows the API validation message when available, or a generic error. */
  error(error: unknown): void {
    let message = this.translate.instant('common.error');
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) message = this.translate.instant('common.adminOnly');
      else if (error.error?.message) {
        message = Array.isArray(error.error.message)
          ? error.error.message.join('\n')
          : error.error.message;
      }
    }
    this.snackBar.open(message, 'OK', { duration: 6000 });
  }
}
