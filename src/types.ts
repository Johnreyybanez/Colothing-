export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'One Size';
export type Color = string;

export interface ProductVariant {
  id: string;
  productId: string;
  size: Size;
  color: Color;
  price: number;
  stock: number;
  sku: string; // TSHIRT-BLK-M-0001
  qrCode: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  variants: ProductVariant[];
}

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  size: Size;
  color: Color;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  payment: number;
  change: number;
}
