import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { InventoryApi } from '../../core/api/inventory-api.service';
import { Supplier } from '../../core/models';
import { Notifier } from '../../shared/notifier';

@Component({
  selector: 'app-supplier-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ (supplier ? 'suppliers.editTitle' : 'suppliers.new') | translate }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form" id="supplier-form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'suppliers.name' | translate }}</mat-label>
          <input matInput formControlName="name" />
          <mat-error>{{ 'common.required' | translate }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'suppliers.email' | translate }}</mat-label>
          <input matInput type="email" formControlName="email" />
          <mat-error>{{ 'login.invalidEmail' | translate }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'suppliers.phone' | translate }}</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button type="submit" form="supplier-form" [disabled]="saving()">
        {{ 'common.save' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class SupplierDialog {
  protected readonly supplier = inject<Supplier | null>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SupplierDialog>);
  private readonly api = inject(InventoryApi);
  private readonly notifier = inject(Notifier);
  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.supplier?.name ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.supplier?.email ?? '', [Validators.email]],
    phone: [this.supplier?.phone ?? '', [Validators.minLength(5)]],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, phone } = this.form.getRawValue();
    const payload = { name, email: email || null, phone: phone || null };
    const clean = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== null));
    const request = this.supplier
      ? this.api.updateSupplier(this.supplier.id, clean)
      : this.api.createSupplier(payload);

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
