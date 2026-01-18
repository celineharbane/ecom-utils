/**
 * TYPES ECOM-UTILS
 * Définition de tous les types et interfaces
 */

// ============================================
// TYPES DE BASE
// ============================================

/** Devises supportées */
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD';

/** Statut d'un produit */
export type ProductStatus = 'available' | 'out_of_stock' | 'preorder' | 'discontinued';

/** Type de réduction */
export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

// ============================================
// INTERFACES PRODUIT
// ============================================

/** Produit de base */
export interface Product {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  status: ProductStatus;
  stock: number;
  category?: string;
}

// ============================================
// INTERFACES PANIER
// ============================================

/** Article dans le panier */
export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

/** Totaux du panier */
export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  shipping: number;
  taxAmount: number;
  total: number;
  itemCount: number;
  currency: Currency;
}

// ============================================
// INTERFACES RÉDUCTION
// ============================================

/** Code promo / Réduction */
export interface Discount {
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  endDate?: Date;
  isActive: boolean;
}
