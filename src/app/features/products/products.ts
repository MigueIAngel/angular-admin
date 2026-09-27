import { CurrencyPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryApi, toParams } from '../../core/api/inventory-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import { Page, Product } from '../../core/models';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { Notifier } from '../../shared/notifier';
import { ProductDialog } from './product-dialog';

@Component({
  selector: 'app-products',
  imports: [
    CurrencyPipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  templateUrl: './products.html',
})
export class Products {
  /** Bound from the `?lowStock=true` query param. */
  readonly lowStockParam = input<string | undefined>(undefined, { alias: 'lowStock' });

  protected readonly auth = inject(AuthService);
  protected readonly language = inject(LanguageService);
  private readonly api = inject(InventoryApi);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(Notifier);

  protected readonly search = signal('');
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(debounceTime(300)),
    { initialValue: '' },
  );
  protected readonly lowStock = linkedSignal(() => this.lowStockParam() === 'true');
  protected readonly page = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sort = signal<Sort>({ active: 'name', direction: 'asc' });

  protected readonly products = httpResource<Page<Product>>(() => ({
    url: `${environment.apiUrl}/products`,
    params: toParams({
      page: this.page() + 1,
      limit: this.pageSize(),
      search: this.debouncedSearch(),
      lowStock: this.lowStock(),
      sort: this.sort().direction ? this.sort().active : 'name',
      order: this.sort().direction === 'desc' ? 'DESC' : 'ASC',
    }),
  }));

  protected readonly columns = computed(() => [
    'sku',
    'name',
    'supplier',
    'price',
    'stock',
    ...(this.auth.isAdmin() ? ['actions'] : []),
  ]);

  protected onSearch(value: string): void {
    this.search.set(value);
    this.page.set(0);
  }

  protected onLowStock(value: boolean): void {
    this.lowStock.set(value);
    this.page.set(0);
  }

  protected onPage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected onSort(sort: Sort): void {
    this.sort.set(sort);
    this.page.set(0);
  }

  protected openDialog(product: Product | null = null): void {
    this.dialog
      .open(ProductDialog, { data: product, autoFocus: 'first-tabbable' })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.products.reload());
  }

  protected remove(product: Product): void {
    this.dialog
      .open(ConfirmDialog, { data: { name: product.name } })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() =>
        this.api.deleteProduct(product.id).subscribe({
          next: () => {
            this.notifier.success('common.deleted');
            this.products.reload();
          },
          error: (error) => this.notifier.error(error),
        }),
      );
  }
}
