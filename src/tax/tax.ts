/**
 * MODULE TAX
 * Calcul de TVA par pays
 */

/** Résultat du calcul de taxe */
export interface TaxCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  countryCode: string;
  countryName: string;
}

/** Configuration de taxe par pays */
interface TaxConfig {
  countryCode: string;
  countryName: string;
  standardRate: number;
  reducedRates?: {
    category: string;
    rate: number;
  }[];
}

/** Taux de TVA par pays européens */
const taxRates: Record<string, TaxConfig> = {
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    standardRate: 20,
    reducedRates: [
      { category: 'food', rate: 5.5 },
      { category: 'books', rate: 5.5 },
      { category: 'medicine', rate: 2.1 },
    ],
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Allemagne',
    standardRate: 19,
    reducedRates: [
      { category: 'food', rate: 7 },
      { category: 'books', rate: 7 },
    ],
  },
  BE: {
    countryCode: 'BE',
    countryName: 'Belgique',
    standardRate: 21,
    reducedRates: [
      { category: 'food', rate: 6 },
    ],
  },
  ES: {
    countryCode: 'ES',
    countryName: 'Espagne',
    standardRate: 21,
    reducedRates: [
      { category: 'food', rate: 10 },
    ],
  },
  IT: {
    countryCode: 'IT',
    countryName: 'Italie',
    standardRate: 22,
    reducedRates: [
      { category: 'food', rate: 10 },
      { category: 'books', rate: 4 },
    ],
  },
  GB: {
    countryCode: 'GB',
    countryName: 'Royaume-Uni',
    standardRate: 20,
    reducedRates: [
      { category: 'food', rate: 0 },
      { category: 'books', rate: 0 },
    ],
  },
  CH: {
    countryCode: 'CH',
    countryName: 'Suisse',
    standardRate: 8.1,
    reducedRates: [
      { category: 'food', rate: 2.6 },
    ],
  },
  PT: {
    countryCode: 'PT',
    countryName: 'Portugal',
    standardRate: 23,
  },
  NL: {
    countryCode: 'NL',
    countryName: 'Pays-Bas',
    standardRate: 21,
    reducedRates: [
      { category: 'food', rate: 9 },
    ],
  },
  LU: {
    countryCode: 'LU',
    countryName: 'Luxembourg',
    standardRate: 17,
    reducedRates: [
      { category: 'food', rate: 3 },
    ],
  },
};

/**
 * Récupère le taux de TVA pour un pays
 * 
 * @example
 * getTaxRate('FR')           // 20
 * getTaxRate('FR', 'food')   // 5.5
 * getTaxRate('DE', 'books')  // 7
 */
export function getTaxRate(countryCode: string, category?: string): number {
  const config = taxRates[countryCode.toUpperCase()];

  if (!config) {
    console.warn(`⚠️ Pays "${countryCode}" non trouvé, taux par défaut: 20%`);
    return 20;
  }

  // Cherche un taux réduit si catégorie spécifiée
  if (category && config.reducedRates) {
    const reducedRate = config.reducedRates.find(
      r => r.category.toLowerCase() === category.toLowerCase()
    );
    if (reducedRate) {
      return reducedRate.rate;
    }
  }

  return config.standardRate;
}

/**
 * Calcule la TVA sur un montant
 * 
 * @example
 * calculateTax(100, 'FR')
 * // { subtotal: 100, taxRate: 20, taxAmount: 20, total: 120, ... }
 */
export function calculateTax(
  subtotal: number,
  countryCode: string,
  category?: string
): TaxCalculation {
  const config = taxRates[countryCode.toUpperCase()];
  const taxRate = getTaxRate(countryCode, category);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    subtotal,
    taxRate,
    taxAmount,
    total,
    countryCode: countryCode.toUpperCase(),
    countryName: config?.countryName ?? 'Inconnu',
  };
}

/**
 * Récupère la liste des pays supportés
 */
export function getSupportedCountries(): string[] {
  return Object.keys(taxRates);
}

/**
 * Récupère le nom d'un pays
 */
export function getCountryName(countryCode: string): string {
  return taxRates[countryCode.toUpperCase()]?.countryName ?? 'Inconnu';
}

/**
 * Calcule le montant HT à partir d'un montant TTC
 * 
 * @example
 * getPriceExcludingTax(120, 'FR')  // 100
 */
export function getPriceExcludingTax(
  totalTTC: number,
  countryCode: string,
  category?: string
): number {
  const taxRate = getTaxRate(countryCode, category);
  const priceHT = totalTTC / (1 + taxRate / 100);
  return Math.round(priceHT * 100) / 100;
}
