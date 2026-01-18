/**
 * MODULE CURRENCY
 * Formatage et conversion des devises
 */

import type { Currency } from '../types.js';

/** Taux de change par rapport à l'EUR */
const exchangeRates: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.95,
  CAD: 1.47,
};

/** Symboles des devises */
const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  CAD: 'CA$',
};

/** Locales par devise */
const currencyLocales: Record<Currency, string> = {
  EUR: 'fr-FR',
  USD: 'en-US',
  GBP: 'en-GB',
  CHF: 'de-CH',
  CAD: 'en-CA',
};

/**
 * Formate un prix dans une devise donnée
 * 
 * @example
 * formatPrice(29.90, 'EUR')  // "29,90 €"
 * formatPrice(29.90, 'USD')  // "$29.90"
 */
export function formatPrice(amount: number, currency: Currency = 'EUR'): string {
  const locale = currencyLocales[currency];
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convertit un montant d'une devise à une autre
 * 
 * @example
 * convertCurrency(100, 'EUR', 'USD')  // 108.00
 * convertCurrency(100, 'USD', 'EUR')  // 92.59
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;

  // Convertit d'abord en EUR, puis dans la devise cible
  const amountInEur = amount / exchangeRates[from];
  const convertedAmount = amountInEur * exchangeRates[to];

  return Math.round(convertedAmount * 100) / 100;
}

/**
 * Récupère le symbole d'une devise
 */
export function getCurrencySymbol(currency: Currency): string {
  return currencySymbols[currency];
}

/**
 * Récupère la liste des devises supportées
 */
export function getSupportedCurrencies(): Currency[] {
  return Object.keys(exchangeRates) as Currency[];
}
