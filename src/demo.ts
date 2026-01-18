/**
 * DEMO - Voir ecom-utils en action
 */

import { Cart } from './cart/Cart.js';
import type { Product, Discount } from './types.js';

// ============================================
// 1. CRÉER DES PRODUITS
// ============================================

const tshirt: Product = {
  id: '1',
  name: 'T-shirt Premium',
  price: 29.90,
  currency: 'EUR',
  status: 'available',
  stock: 100,
};

const jean: Product = {
  id: '2',
  name: 'Jean Slim',
  price: 59.90,
  currency: 'EUR',
  status: 'available',
  stock: 50,
};

const sneakers: Product = {
  id: '3',
  name: 'Sneakers Blanches',
  price: 89.90,
  currency: 'EUR',
  status: 'available',
  stock: 30,
};

// ============================================
// 2. CRÉER UN PANIER
// ============================================

console.log('🛒 Création du panier...\n');

const cart = new Cart({
  currency: 'EUR',
  taxRate: 20,
  freeShippingThreshold: 100,
  shippingCost: 4.90,
});

// ============================================
// 3. AJOUTER DES PRODUITS
// ============================================

console.log('📦 Ajout des produits...');
cart.addItem(tshirt, 2);    // 2 t-shirts
cart.addItem(jean, 1);       // 1 jean
cart.addItem(sneakers, 1);   // 1 paire de sneakers

// ============================================
// 4. AFFICHER LE PANIER (sans réduction)
// ============================================

console.log('\n📋 PANIER SANS RÉDUCTION :');
cart.displaySummary();

// ============================================
// 5. APPLIQUER UN CODE PROMO
// ============================================

const promo: Discount = {
  code: 'SOLDES20',
  type: 'percentage',
  value: 20,
  isActive: true,
};

console.log('\n\n🏷️  Application du code promo SOLDES20 (-20%)...');
cart.applyDiscount(promo);

// ============================================
// 6. AFFICHER LE PANIER (avec réduction)
// ============================================

console.log('\n📋 PANIER AVEC RÉDUCTION :');
cart.displaySummary();

// ============================================
// 7. RÉCUPÉRER LES TOTAUX (pour une API par exemple)
// ============================================

const totals = cart.getTotals();
console.log('\n\n📊 DONNÉES JSON (pour API) :');
console.log(JSON.stringify(totals, null, 2));