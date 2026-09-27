import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  MovementPayload,
  Product,
  ProductPayload,
  StockMovement,
  Supplier,
  SupplierPayload,
} from '../models';

/** Write operations against the Nest Inventory API. Reads use `httpResource` in components. */
@Injectable({ providedIn: 'root' })
export class InventoryApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  createProduct(payload: ProductPayload) {
    return this.http.post<Product>(`${this.base}/products`, payload);
  }

  updateProduct(id: number, payload: Partial<ProductPayload>) {
    return this.http.patch<Product>(`${this.base}/products/${id}`, payload);
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  createSupplier(payload: SupplierPayload) {
    return this.http.post<Supplier>(`${this.base}/suppliers`, payload);
  }

  updateSupplier(id: number, payload: Partial<SupplierPayload>) {
    return this.http.patch<Supplier>(`${this.base}/suppliers/${id}`, payload);
  }

  deleteSupplier(id: number) {
    return this.http.delete<void>(`${this.base}/suppliers/${id}`);
  }

  createMovement(payload: MovementPayload) {
    return this.http.post<StockMovement>(`${this.base}/movements`, payload);
  }
}

/** Builds query params skipping empty values. */
export function toParams(values: Record<string, string | number | boolean | null | undefined>) {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== undefined && value !== '' && value !== false) {
      params = params.set(key, String(value));
    }
  }
  return params;
}
