import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryApi, toParams } from '../../core/api/inventory-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Page, Supplier } from '../../core/models';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { Notifier } from '../../shared/notifier';
import { SupplierDialog } from './supplier-dialog';

@Component({
  selector: 'app-suppliers',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  templateUrl: './suppliers.html',
})
export class Suppliers {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(InventoryApi);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(Notifier);

  protected readonly search = signal('');
  private readonly debouncedSearch = toSignal(toObservable(this.search).pipe(debounceTime(300)), {
    initialValue: '',
  });
  protected readonly page = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly suppliers = httpResource<Page<Supplier>>(() => ({
    url: `${environment.apiUrl}/suppliers`,
    params: toParams({
      page: this.page() + 1,
      limit: this.pageSize(),
      search: this.debouncedSearch(),
    }),
  }));

  protected readonly columns = computed(() => [
    'name',
    'email',
    'phone',
    ...(this.auth.isAdmin() ? ['actions'] : []),
  ]);

  protected onSearch(value: string): void {
    this.search.set(value);
    this.page.set(0);
  }

  protected onPage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected openDialog(supplier: Supplier | null = null): void {
    this.dialog
      .open(SupplierDialog, { data: supplier })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.suppliers.reload());
  }

  protected remove(supplier: Supplier): void {
    this.dialog
      .open(ConfirmDialog, { data: { name: supplier.name } })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() =>
        this.api.deleteSupplier(supplier.id).subscribe({
          next: () => {
            this.notifier.success('common.deleted');
            this.suppliers.reload();
          },
          error: (error) => this.notifier.error(error),
        }),
      );
  }
}
