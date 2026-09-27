import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toParams } from '../../core/api/inventory-api.service';
import { LanguageService } from '../../core/i18n/language.service';
import { MovementType, Page, StockMovement } from '../../core/models';
import { MovementDialog } from './movement-dialog';

@Component({
  selector: 'app-movements',
  imports: [
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressBarModule,
    TranslatePipe,
  ],
  templateUrl: './movements.html',
})
export class Movements {
  protected readonly language = inject(LanguageService);
  private readonly dialog = inject(MatDialog);

  protected readonly type = signal<MovementType | ''>('');
  protected readonly page = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly columns = [
    'date',
    'type',
    'product',
    'quantity',
    'stockAfter',
    'reason',
    'user',
  ];

  protected readonly movements = httpResource<Page<StockMovement>>(() => ({
    url: `${environment.apiUrl}/movements`,
    params: toParams({ page: this.page() + 1, limit: this.pageSize(), type: this.type() }),
  }));

  protected onType(type: MovementType | ''): void {
    this.type.set(type);
    this.page.set(0);
  }

  protected onPage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected openDialog(): void {
    this.dialog
      .open(MovementDialog)
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.movements.reload());
  }
}
