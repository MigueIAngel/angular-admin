export type Role = 'admin' | 'staff';
export type MovementType = 'in' | 'out';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  minStock: number;
  supplier: Supplier | null;
}

export interface ProductPayload {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  minStock?: number;
  supplierId?: number | null;
}

export type SupplierPayload = Omit<Supplier, 'id'>;

export interface StockMovement {
  id: number;
  type: MovementType;
  quantity: number;
  stockAfter: number;
  reason: string | null;
  product: Product;
  user: User | null;
  createdAt: string;
}

export interface MovementPayload {
  productId: number;
  type: MovementType;
  quantity: number;
  reason?: string;
}

export interface DashboardSummary {
  totalProducts: number;
  totalSuppliers: number;
  lowStockCount: number;
  inventoryValue: number;
  lowStockProducts: Product[];
  recentMovements: StockMovement[];
  movementsByDay: { date: string; in: number; out: number }[];
}
