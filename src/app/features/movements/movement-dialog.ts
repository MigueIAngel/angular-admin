import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { InventoryApi } from '../../core/api/inventory-api.service';
import { MovementType, Page, Product } from '../../core/models';
import { Notifier } from '../../shared/notifier';

@Component({
  selector: 'app-movement-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './movement-dialog.html',
})
export class MovementDialog {
  private readonly dialogRef = inject(MatDialogRef<MovementDialog>);
  private readonly api = inject(InventoryApi);
  private readonly notifier = inject(Notifier);
  protected readonly saving = signal(false);

  protected readonly products = httpResource<Page<Product>>(
    () => `${environment.apiUrl}/products?limit=100`,
  );

  protected readonly form = inject(NonNullableFormBuilder).group({
    type: ['in' as MovementType, Validators.required],
    productId: [null as number | null, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    reason: [''],
  });

  private readonly productId = toSignal(this.form.controls.productId.valueChanges, {
    initialValue: null,
  });
  protected readonly selected = computed(() =>
    this.products.value()?.items.find((p) => p.id === this.productId()),
  );

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { type, productId, quantity, reason } = this.form.getRawValue();
    this.saving.set(true);
    this.api
      .createMovement({ type, productId: productId!, quantity, reason: reason || undefined })
      .subscribe({
        next: (movement) => {
          this.notifier.success('movements.registered');
          this.dialogRef.close(movement);
        },
        error: (error) => {
          this.saving.set(false);
          this.notifier.error(error);
        },
      });
  }
}
