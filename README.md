# 🛒 ecom-utils

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Librairie TypeScript utilitaire pour e-commerce : panier, promotions, TVA, devises.

## ✨ Fonctionnalités

- 🛒 **Cart** - Gestion complète du panier (ajout, modification, suppression)
- 🏷️ **Discount** - Codes promo (%, montant fixe, livraison gratuite)
- 💰 **Currency** - Formatage et conversion de devises
- 🧾 **Tax** - Calcul de TVA par pays

## 📦 Installation

```bash
npm install ecom-utils
```

## 🚀 Utilisation rapide

```typescript
import { Cart, Product, Discount } from 'ecom-utils';

// Créer un panier
const cart = new Cart({ currency: 'EUR', taxRate: 20 });

// Créer un produit
const product: Product = {
  id: '1',
  name: 'T-shirt Premium',
  price: 29.90,
  currency: 'EUR',
  status: 'available',
  stock: 100,
};

// Ajouter au panier
cart.addItem(product, 2);

// Appliquer un code promo
const discount: Discount = {
  code: 'PROMO10',
  type: 'percentage',
  value: 10,
  isActive: true,
};
cart.applyDiscount(discount);

// Obtenir les totaux
const totals = cart.getTotals();
console.log(totals);
// {
//   subtotal: 59.80,
//   discountAmount: 5.98,
//   shipping: 0,
//   taxAmount: 10.76,
//   total: 64.58,
//   itemCount: 2,
//   currency: 'EUR'
// }

// Afficher le récapitulatif
cart.displaySummary();
```

## 🛠️ Développement

```bash
# Cloner le repo
git clone https://github.com/celineharbane/ecom-utils.git
cd ecom-utils

# Installer les dépendances
npm install

# Compiler TypeScript
npm run build

# Mode watch
npm run dev

# Lancer les tests
npm test
```

## 📂 Structure

```
ecom-utils/
├── src/
│   ├── cart/
│   │   └── Cart.ts       # Classe de gestion du panier
│   ├── types.ts          # Définitions TypeScript
│   └── index.ts          # Export principal
├── tests/
│   └── cart.test.ts      # Tests unitaires
├── package.json
├── tsconfig.json
└── README.md
```

## 📄 Licence

MIT - [Céline Harbane](https://github.com/celineharbane)
