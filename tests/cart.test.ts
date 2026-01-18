/**
 * TESTS - Cart
 * Tests unitaires pour la classe Cart
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Cart } from '../src/cart/Cart.js';
import type { Product, Discount } from '../src/types.js';

// Produit de test
const mockProduct: Product = {
  id: '1',
  name: 'T-shirt Premium',
  price: 29.90,
  currency: 'EUR',
  status: 'available',
  stock: 10,
};

const mockProduct2: Product = {
  id: '2',
  name: 'Jean Slim',
  price: 59.90,
  currency: 'EUR',
  status: 'available',
  stock: 5,
};

describe('Cart', () => {
  let cart: Cart;

  // Avant chaque test, on crée un nouveau panier
  beforeEach(() => {
    cart = new Cart({ currency: 'EUR', taxRate: 20 });
  });

  // ============================================
  // TESTS - Ajout d'articles
  // ============================================

  describe('addItem', () => {
    it('should add a product to the cart', () => {
      const item = cart.addItem(mockProduct, 2);

      expect(item).not.toBeNull();
      expect(cart.getItemCount()).toBe(2);
      expect(cart.getItems()).toHaveLength(1);
    });

    it('should update quantity if product already exists', () => {
      cart.addItem(mockProduct, 1);
      cart.addItem(mockProduct, 2);

      expect(cart.getItemCount()).toBe(3);
      expect(cart.getItems()).toHaveLength(1);
    });

    it('should reject if quantity is 0 or negative', () => {
      const item = cart.addItem(mockProduct, 0);

      expect(item).toBeNull();
      expect(cart.isEmpty()).toBe(true);
    });

    it('should reject if stock is insufficient', () => {
      const item = cart.addItem(mockProduct, 100);

      expect(item).toBeNull();
      expect(cart.isEmpty()).toBe(true);
    });

    it('should reject out of stock products', () => {
      const outOfStockProduct: Product = {
        ...mockProduct,
        status: 'out_of_stock',
      };
      const item = cart.addItem(outOfStockProduct, 1);

      expect(item).toBeNull();
    });
  });

  // ============================================
  // TESTS - Modification de quantité
  // ============================================

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      cart.addItem(mockProduct, 1);
      const result = cart.updateQuantity('1', 5);

      expect(result).toBe(true);
      expect(cart.getItemCount()).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      cart.addItem(mockProduct, 2);
      cart.updateQuantity('1', 0);

      expect(cart.isEmpty()).toBe(true);
    });

    it('should return false for non-existent product', () => {
      const result = cart.updateQuantity('999', 5);

      expect(result).toBe(false);
    });
  });

  // ============================================
  // TESTS - Suppression d'articles
  // ============================================

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      cart.addItem(mockProduct, 2);
      const result = cart.removeItem('1');

      expect(result).toBe(true);
      expect(cart.isEmpty()).toBe(true);
    });

    it('should return false for non-existent product', () => {
      const result = cart.removeItem('999');

      expect(result).toBe(false);
    });
  });

  // ============================================
  // TESTS - Codes promo
  // ============================================

  describe('applyDiscount', () => {
    const validDiscount: Discount = {
      code: 'PROMO10',
      type: 'percentage',
      value: 10,
      isActive: true,
    };

    it('should apply a valid discount', () => {
      cart.addItem(mockProduct, 2);
      const result = cart.applyDiscount(validDiscount);

      expect(result).toBe(true);
    });

    it('should reject inactive discount', () => {
      const inactiveDiscount: Discount = {
        ...validDiscount,
        isActive: false,
      };
      const result = cart.applyDiscount(inactiveDiscount);

      expect(result).toBe(false);
    });

    it('should reject expired discount', () => {
      const expiredDiscount: Discount = {
        ...validDiscount,
        endDate: new Date('2020-01-01'),
      };
      const result = cart.applyDiscount(expiredDiscount);

      expect(result).toBe(false);
    });

    it('should reject if minimum amount not reached', () => {
      const minAmountDiscount: Discount = {
        ...validDiscount,
        minOrderAmount: 1000,
      };
      cart.addItem(mockProduct, 1);
      const result = cart.applyDiscount(minAmountDiscount);

      expect(result).toBe(false);
    });
  });

  // ============================================
  // TESTS - Calculs
  // ============================================

  describe('getTotals', () => {
    it('should calculate correct totals without discount', () => {
      cart.addItem(mockProduct, 2); // 2 x 29.90 = 59.80

      const totals = cart.getTotals();

      expect(totals.subtotal).toBe(59.80);
      expect(totals.discountAmount).toBe(0);
      expect(totals.shipping).toBe(0); // > 50€ = gratuit
      expect(totals.taxAmount).toBe(11.96); // 59.80 * 20%
      expect(totals.total).toBe(71.76);
      expect(totals.itemCount).toBe(2);
    });

    it('should calculate correct totals with percentage discount', () => {
      cart.addItem(mockProduct, 2); // 59.80
      cart.applyDiscount({
        code: 'PROMO10',
        type: 'percentage',
        value: 10,
        isActive: true,
      });

      const totals = cart.getTotals();

      expect(totals.subtotal).toBe(59.80);
      expect(totals.discountAmount).toBe(5.98); // 10%
      expect(totals.shipping).toBe(0);
    });

    it('should apply shipping when under threshold', () => {
      cart.addItem(mockProduct, 1); // 29.90 < 50

      const totals = cart.getTotals();

      expect(totals.shipping).toBe(4.90);
    });

    it('should apply free shipping with discount code', () => {
      cart.addItem(mockProduct, 1);
      cart.applyDiscount({
        code: 'FREESHIP',
        type: 'free_shipping',
        value: 0,
        isActive: true,
      });

      const totals = cart.getTotals();

      expect(totals.shipping).toBe(0);
    });
  });

  // ============================================
  // TESTS - Vider le panier
  // ============================================

  describe('clear', () => {
    it('should empty the cart and remove discount', () => {
      cart.addItem(mockProduct, 2);
      cart.addItem(mockProduct2, 1);
      cart.applyDiscount({
        code: 'TEST',
        type: 'percentage',
        value: 5,
        isActive: true,
      });

      cart.clear();

      expect(cart.isEmpty()).toBe(true);
      expect(cart.getItemCount()).toBe(0);
    });
  });
});
