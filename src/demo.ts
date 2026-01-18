/**
 * DEMO COMPLÈTE - Tous les modules ecom-utils
 */

import { Cart } from './cart/Cart.js';
import { formatPrice, convertCurrency, getCurrencySymbol } from './currency/currency.js';
import { calculateTax, getTaxRate, getCountryName } from './tax/tax.js';
import { calculateShipping, formatDeliveryTime } from './shipping/shipping.js';
import type { Product, Discount } from './types.js';

// ============================================
// 1. MODULE CURRENCY - Formatage des prix
// ============================================

console.log('💰 MODULE CURRENCY');
console.log('═'.repeat(50));

console.log('Formatage des prix :');
console.log(`  France:    ${formatPrice(29.90, 'EUR')}`);
console.log(`  USA:       ${formatPrice(29.90, 'USD')}`);
console.log(`  UK:        ${formatPrice(29.90, 'GBP')}`);

console.log('\nConversion de devises :');
console.log(`  100€ en USD: ${formatPrice(convertCurrency(100, 'EUR', 'USD'), 'USD')}`);
console.log(`  100€ en GBP: ${formatPrice(convertCurrency(100, 'EUR', 'GBP'), 'GBP')}`);
console.log(`  100$ en EUR: ${formatPrice(convertCurrency(100, 'USD', 'EUR'), 'EUR')}`);

// ============================================
// 2. MODULE TAX - TVA par pays
// ============================================

console.log('\n\n🧾 MODULE TAX');
console.log('═'.repeat(50));

console.log('Taux de TVA standard :');
const countries = ['FR', 'DE', 'BE', 'ES', 'IT', 'GB', 'CH'];
countries.forEach(code => {
  console.log(`  ${getCountryName(code)}: ${getTaxRate(code)}%`);
});

console.log('\nTaux réduits (alimentation) :');
console.log(`  France:  ${getTaxRate('FR', 'food')}%`);
console.log(`  Allemagne: ${getTaxRate('DE', 'food')}%`);
console.log(`  UK: ${getTaxRate('GB', 'food')}% (exonéré)`);

console.log('\nCalcul TVA sur 100€ :');
const taxFR = calculateTax(100, 'FR');
const taxDE = calculateTax(100, 'DE');
console.log(`  France: ${taxFR.subtotal}€ HT + ${taxFR.taxAmount}€ TVA = ${taxFR.total}€ TTC`);
console.log(`  Allemagne: ${taxDE.subtotal}€ HT + ${taxDE.taxAmount}€ TVA = ${taxDE.total}€ TTC`);

// ============================================
// 3. MODULE SHIPPING - Frais de livraison
// ============================================

console.log('\n\n🚚 MODULE SHIPPING');
console.log('═'.repeat(50));

console.log('Livraison en France (commande 45€) :');
const shippingFR = calculateShipping('FR', 45);
console.log(`  Zone: ${shippingFR.zoneName}`);
console.log(`  Livraison gratuite: ${shippingFR.freeShippingEligible ? 'Oui' : 'Non'}`);
console.log(`  Il manque: ${shippingFR.amountForFreeShipping}€ pour la gratuité`);
console.log(`  Options disponibles:`);
shippingFR.rates.forEach(rate => {
  console.log(`    - ${rate.name}: ${rate.price}€ (${formatDeliveryTime(rate.estimatedDays)})`);
});

console.log('\nLivraison en Allemagne (commande 80€) :');
const shippingDE = calculateShipping('DE', 80);
console.log(`  Zone: ${shippingDE.zoneName}`);
console.log(`  Livraison gratuite: ${shippingDE.freeShippingEligible ? 'Oui ✓' : 'Non'}`);
shippingDE.rates.forEach(rate => {
  console.log(`    - ${rate.name}: ${rate.price === 0 ? 'GRATUIT' : rate.price + '€'}`);
});

// ============================================
// 4. PANIER COMPLET
// ============================================

console.log('\n\n🛒 PANIER COMPLET');
console.log('═'.repeat(50));

const products: Product[] = [
  { id: '1', name: 'T-shirt Premium', price: 29.90, currency: 'EUR', status: 'available', stock: 100 },
  { id: '2', name: 'Jean Slim', price: 59.90, currency: 'EUR', status: 'available', stock: 50 },
  { id: '3', name: 'Sneakers', price: 89.90, currency: 'EUR', status: 'available', stock: 30 },
];

const cart = new Cart({ currency: 'EUR', taxRate: 20, freeShippingThreshold: 100 });

products.forEach(p => cart.addItem(p, 1));

const discount: Discount = {
  code: 'BIENVENUE15',
  type: 'percentage',
  value: 15,
  isActive: true,
};

cart.applyDiscount(discount);
cart.displaySummary();

// Résumé final
const totals = cart.getTotals();
console.log('\n📊 Résumé pour export API :');
console.log(JSON.stringify(totals, null, 2));