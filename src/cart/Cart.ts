/**
 * MODULE CART
 * Gestion complète du panier e-commerce
 */

import type { Product, CartItem, CartTotals, Discount, Currency } from '../types.js';

/** Configuration du panier */
interface CartConfig {
  currency: Currency;
  taxRate?: number;
  freeShippingThreshold?: number;
  shippingCost?: number;
}

/**
 * Classe de gestion du panier
 * 
 * @example
 * ```typescript
 * const cart = new Cart({ currency: 'EUR', taxRate: 20 });
 * cart.addItem(product, 2);
 * cart.applyDiscount(discount);
 * const totals = cart.getTotals();
 * ```
 */
export class Cart {
  private items: CartItem[] = [];
  private discount: Discount | null = null;
  private config: Required<CartConfig>;

  constructor(config: CartConfig) {
    this.config = {
      currency: config.currency,
      taxRate: config.taxRate ?? 20,
      freeShippingThreshold: config.freeShippingThreshold ?? 50,
      shippingCost: config.shippingCost ?? 4.90,
    };
  }

  // ============================================
  // GETTERS
  // ============================================

  /** Récupère tous les articles du panier */
  getItems(): CartItem[] {
    return [...this.items];
  }

  /** Récupère le nombre d'articles */
  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  /** Vérifie si le panier est vide */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // ============================================
  // GESTION DES ARTICLES
  // ============================================

  /**
   * Ajoute un produit au panier
   * @param product - Le produit à ajouter
   * @param quantity - La quantité (défaut: 1)
   * @returns L'article ajouté ou null si erreur
   */
  addItem(product: Product, quantity: number = 1): CartItem | null {
    // Validation de la quantité
    if (quantity <= 0) {
      console.error('❌ La quantité doit être supérieure à 0');
      return null;
    }

    // Vérification du stock
    if (product.stock < quantity) {
      console.error(`❌ Stock insuffisant pour "${product.name}". Disponible: ${product.stock}`);
      return null;
    }

    // Vérification du statut
    if (product.status !== 'available' && product.status !== 'preorder') {
      console.error(`❌ Le produit "${product.name}" n'est pas disponible`);
      return null;
    }

    // Cherche si l'article existe déjà
    const existingIndex = this.items.findIndex(item => item.product.id === product.id);

    if (existingIndex !== -1) {
      // Mise à jour de la quantité
      const newQuantity = this.items[existingIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        console.error(`❌ Stock insuffisant. Maximum: ${product.stock}`);
        return null;
      }

      this.items[existingIndex].quantity = newQuantity;
      return this.items[existingIndex];
    }

    // Nouvel article
    const newItem: CartItem = {
      product,
      quantity,
      addedAt: new Date(),
    };

    this.items.push(newItem);
    return newItem;
  }

  /**
   * Met à jour la quantité d'un article
   * @param productId - L'ID du produit
   * @param quantity - La nouvelle quantité
   * @returns true si succès, false sinon
   */
  updateQuantity(productId: string, quantity: number): boolean {
    const index = this.items.findIndex(item => item.product.id === productId);

    if (index === -1) {
      console.error('❌ Article non trouvé dans le panier');
      return false;
    }

    // Si quantité <= 0, on supprime l'article
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    // Vérification du stock
    if (quantity > this.items[index].product.stock) {
      console.error(`❌ Stock insuffisant. Maximum: ${this.items[index].product.stock}`);
      return false;
    }

    this.items[index].quantity = quantity;
    return true;
  }

  /**
   * Supprime un article du panier
   * @param productId - L'ID du produit
   * @returns true si succès, false sinon
   */
  removeItem(productId: string): boolean {
    const index = this.items.findIndex(item => item.product.id === productId);

    if (index === -1) {
      console.error('❌ Article non trouvé dans le panier');
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }

  /** Vide le panier */
  clear(): void {
    this.items = [];
    this.discount = null;
  }

  // ============================================
  // GESTION DES RÉDUCTIONS
  // ============================================

  /**
   * Applique un code promo au panier
   * @param discount - L'objet réduction
   * @returns true si succès, false sinon
   */
  applyDiscount(discount: Discount): boolean {
    // Vérification si actif
    if (!discount.isActive) {
      console.error('❌ Ce code promo n\'est pas actif');
      return false;
    }

    // Vérification de la date de fin
    if (discount.endDate && new Date() > discount.endDate) {
      console.error('❌ Ce code promo a expiré');
      return false;
    }

    // Vérification du montant minimum
    const subtotal = this.calculateSubtotal();
    if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
      console.error(`❌ Montant minimum requis: ${discount.minOrderAmount}€`);
      return false;
    }

    this.discount = discount;
    return true;
  }

  /** Supprime le code promo */
  removeDiscount(): void {
    this.discount = null;
  }

  // ============================================
  // CALCULS
  // ============================================

  /** Calcule le sous-total (avant réductions et taxes) */
  private calculateSubtotal(): number {
    return this.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }

  /** Calcule le montant de la réduction */
  private calculateDiscountAmount(subtotal: number): number {
    if (!this.discount) return 0;

    let discountAmount = 0;

    switch (this.discount.type) {
      case 'percentage':
        discountAmount = subtotal * (this.discount.value / 100);
        break;
      case 'fixed_amount':
        discountAmount = Math.min(this.discount.value, subtotal);
        break;
      case 'free_shipping':
        // Géré dans le calcul des frais de port
        discountAmount = 0;
        break;
    }

    // Applique le plafond si défini
    if (this.discount.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, this.discount.maxDiscountAmount);
    }

    return this.round(discountAmount);
  }

  /** Calcule les frais de port */
  private calculateShipping(subtotalAfterDiscount: number): number {
    // Livraison gratuite si code promo free_shipping
    if (this.discount?.type === 'free_shipping') {
      return 0;
    }

    // Livraison gratuite au-dessus du seuil
    if (subtotalAfterDiscount >= this.config.freeShippingThreshold) {
      return 0;
    }

    return this.config.shippingCost;
  }

  /** Calcule la TVA */
  private calculateTax(amount: number): number {
    return this.round(amount * (this.config.taxRate / 100));
  }

  /**
   * Calcule tous les totaux du panier
   * @returns Les totaux complets
   */
  getTotals(): CartTotals {
    const subtotal = this.calculateSubtotal();
    const discountAmount = this.calculateDiscountAmount(subtotal);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const shipping = this.calculateShipping(subtotalAfterDiscount);
    const taxableAmount = subtotalAfterDiscount + shipping;
    const taxAmount = this.calculateTax(taxableAmount);
    const total = this.round(taxableAmount + taxAmount);

    return {
      subtotal: this.round(subtotal),
      discountAmount,
      shipping,
      taxAmount,
      total,
      itemCount: this.getItemCount(),
      currency: this.config.currency,
    };
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  /** Arrondit à 2 décimales */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /** Affiche un résumé du panier (pour debug) */
  displaySummary(): void {
    const totals = this.getTotals();
    const symbol = this.config.currency === 'EUR' ? '€' : '$';

    console.log('\n🛒 RÉCAPITULATIF DU PANIER');
    console.log('═'.repeat(50));

    this.items.forEach(item => {
      console.log(`${item.product.name}`);
      console.log(`  ${item.quantity} x ${item.product.price.toFixed(2)}${symbol} = ${(item.product.price * item.quantity).toFixed(2)}${symbol}`);
    });

    console.log('─'.repeat(50));
    console.log(`Sous-total:        ${totals.subtotal.toFixed(2)}${symbol}`);

    if (totals.discountAmount > 0) {
      console.log(`Réduction:        -${totals.discountAmount.toFixed(2)}${symbol} (${this.discount?.code})`);
    }

    console.log(`Livraison:         ${totals.shipping === 0 ? 'GRATUITE' : totals.shipping.toFixed(2) + symbol}`);
    console.log(`TVA (${this.config.taxRate}%):         ${totals.taxAmount.toFixed(2)}${symbol}`);
    console.log('═'.repeat(50));
    console.log(`TOTAL:             ${totals.total.toFixed(2)}${symbol}`);
  }
}
