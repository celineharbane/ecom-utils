/**
 * MODULE SHIPPING
 * Calcul des frais de livraison
 */

/** Tarif de livraison */
export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  estimatedDays: {
    min: number;
    max: number;
  };
}

/** Zone de livraison */
export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

/** Résultat du calcul de livraison */
export interface ShippingCalculation {
  available: boolean;
  zoneName: string;
  rates: ShippingRate[];
  cheapestRate: ShippingRate | null;
  fastestRate: ShippingRate | null;
  freeShippingEligible: boolean;
  amountForFreeShipping: number;
}

/** Zones de livraison par défaut */
const defaultShippingZones: ShippingZone[] = [
  {
    id: 'france',
    name: 'France métropolitaine',
    countries: ['FR'],
    rates: [
      {
        id: 'standard-fr',
        name: 'Livraison standard',
        price: 4.90,
        estimatedDays: { min: 3, max: 5 },
      },
      {
        id: 'express-fr',
        name: 'Livraison express',
        price: 9.90,
        estimatedDays: { min: 1, max: 2 },
      },
      {
        id: 'relay-fr',
        name: 'Point relais',
        price: 3.90,
        estimatedDays: { min: 3, max: 5 },
      },
    ],
  },
  {
    id: 'europe',
    name: 'Europe',
    countries: ['DE', 'BE', 'ES', 'IT', 'NL', 'PT', 'AT', 'LU', 'CH', 'GB'],
    rates: [
      {
        id: 'standard-eu',
        name: 'Livraison standard',
        price: 9.90,
        estimatedDays: { min: 5, max: 10 },
      },
      {
        id: 'express-eu',
        name: 'Livraison express',
        price: 19.90,
        estimatedDays: { min: 2, max: 4 },
      },
    ],
  },
  {
    id: 'world',
    name: 'International',
    countries: ['*'],
    rates: [
      {
        id: 'standard-world',
        name: 'Livraison internationale',
        price: 19.90,
        estimatedDays: { min: 10, max: 20 },
      },
      {
        id: 'express-world',
        name: 'Express international',
        price: 39.90,
        estimatedDays: { min: 5, max: 10 },
      },
    ],
  },
];

/**
 * Trouve la zone de livraison pour un pays
 */
function findShippingZone(
  countryCode: string,
  zones: ShippingZone[] = defaultShippingZones
): ShippingZone | null {
  const code = countryCode.toUpperCase();

  // Cherche une zone spécifique au pays
  const specificZone = zones.find(zone => zone.countries.includes(code));
  if (specificZone) return specificZone;

  // Sinon, cherche la zone "monde" (wildcard)
  const worldZone = zones.find(zone => zone.countries.includes('*'));
  return worldZone ?? null;
}

/**
 * Calcule les options de livraison disponibles
 * 
 * @example
 * calculateShipping('FR', 45)   // Livraison payante, montre combien il manque
 * calculateShipping('FR', 60)   // Livraison gratuite !
 * calculateShipping('US', 100)  // Livraison internationale
 */
export function calculateShipping(
  countryCode: string,
  orderAmount: number,
  freeShippingThreshold: number = 50,
  zones: ShippingZone[] = defaultShippingZones
): ShippingCalculation {
  const zone = findShippingZone(countryCode, zones);

  if (!zone) {
    return {
      available: false,
      zoneName: 'Inconnu',
      rates: [],
      cheapestRate: null,
      fastestRate: null,
      freeShippingEligible: false,
      amountForFreeShipping: 0,
    };
  }

  // Vérifie l'éligibilité à la livraison gratuite
  const freeShippingEligible = orderAmount >= freeShippingThreshold;

  // Clone les tarifs et applique la gratuité si éligible
  let rates = zone.rates.map(rate => ({ ...rate }));
  
  if (freeShippingEligible) {
    // Rend le tarif le moins cher gratuit
    const cheapestIndex = rates.reduce(
      (minIdx, rate, idx, arr) => (rate.price < arr[minIdx].price ? idx : minIdx),
      0
    );
    rates[cheapestIndex] = { ...rates[cheapestIndex], price: 0 };
  }

  // Trie par prix pour trouver le moins cher
  const sortedByPrice = [...rates].sort((a, b) => a.price - b.price);
  
  // Trie par délai pour trouver le plus rapide
  const sortedBySpeed = [...rates].sort(
    (a, b) => a.estimatedDays.min - b.estimatedDays.min
  );

  return {
    available: true,
    zoneName: zone.name,
    rates,
    cheapestRate: sortedByPrice[0],
    fastestRate: sortedBySpeed[0],
    freeShippingEligible,
    amountForFreeShipping: freeShippingEligible
      ? 0
      : Math.round((freeShippingThreshold - orderAmount) * 100) / 100,
  };
}

/**
 * Formate le délai de livraison
 * 
 * @example
 * formatDeliveryTime({ min: 3, max: 5 })  // "3-5 jours ouvrés"
 */
export function formatDeliveryTime(estimatedDays: { min: number; max: number }): string {
  const { min, max } = estimatedDays;

  if (min === max) {
    return `${min} jour${min > 1 ? 's' : ''} ouvré${min > 1 ? 's' : ''}`;
  }

  return `${min}-${max} jours ouvrés`;
}

/**
 * Vérifie si un pays est livrable
 */
export function isCountryShippable(
  countryCode: string,
  zones: ShippingZone[] = defaultShippingZones
): boolean {
  return findShippingZone(countryCode, zones) !== null;
}

/**
 * Récupère la liste des pays livrables
 */
export function getShippableCountries(
  zones: ShippingZone[] = defaultShippingZones
): string[] {
  const countries: string[] = [];
  
  for (const zone of zones) {
    if (!zone.countries.includes('*')) {
      countries.push(...zone.countries);
    }
  }
  
  return [...new Set(countries)]; // Supprime les doublons
}
