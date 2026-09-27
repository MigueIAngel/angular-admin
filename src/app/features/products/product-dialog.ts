import { httpResource } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { InventoryApi } from '../../core/api/inventory-api.service';
import { Page, Product, ProductPayload, Supplier } from '../../core/models';
import { Notifier } from '../../shared/notifier';

@Component({
  selector: 'app-product-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './product-dialog.html',
})
export class ProductDialog {
  protected readonly product = inject<Product | null>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ProductDialog>);
  private readonly api = inject(InventoryApi);
  private readonly notifier = inject(Notifier);

  protected readonly saving = signal(false);
  protected readonly suppliers = httpResource<Page<Supplier>>(
    () => `${environment.apiUrl}/suppliers?limit=100`,
  );

  protected readonly form = inject(NonNullableFormBuilder).group({
    sku: [this.product?.sku ?? '', [Validators.required, Validators.pattern(/^[A-Z0-9-]{3,40}$/)]],
    name: [this.product?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.product?.description ?? ''],
    price: [this.product?.price ?? 0, [Validators.required, Validators.min(0.01)]],
    stock: [this.product?.stock ?? 0, [Validators.min(0)]],
    minStock: [this.product?.minStock ?? 5, [Validators.required, Validators.min(0)]],
    supplierId: [this.product?.supplier?.id ?? (null as number | null)],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { stock, ...values } = this.form.getRawValue();
    const payload: ProductPayload = { ...values, description: values.description || undefined };
    const request = this.product
      ? this.api.updateProduct(this.product.id, payload)
      : this.api.createProduct({ ...payload, stock, supplierId: payload.supplierId ?? undefined });

    this.saving.set(true);
    request.subscribe({
      next: (saved) => {
        this.notifier.success('common.saved');
        this.dialogRef.close(saved);
      },
      error: (error) => {
        this.saving.set(false);
        this.notifier.error(error);
      },
    });
  }
}
