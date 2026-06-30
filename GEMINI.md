# Izi-Facture : Résumé du Projet

Ce document sert de point de repère pour comprendre l'architecture, les fonctionnalités et les règles de conception de l'application Izi-Facture.

## Ce que l'application fait
Izi-Facture est une application moderne de gestion de facturation et de suivi financier, spécialement conçue pour les PME, les indépendants et freelances (notamment en Afrique de l'Ouest, avec prise en charge des devises locales comme le FCFA, GNF, etc.). L'application permet de gérer des clients, de créer des factures avec prévisualisation en temps réel, de gérer les paiements par virements et mobile money (Orange Money, MTN Mobile Money), de suivre les statistiques de revenus, et de transmettre directement les factures aux clients via email ou WhatsApp.

## Toutes les fonctionnalités implémentées
- **Tableau de bord (Dashboard)** : Vue d'ensemble avec statistiques financières (Facturé, Payé), graphiques interactifs des revenus, liste des factures récentes et résumés des clients principaux.
- **Gestion Multi-Entreprises** : Possibilité d'ajouter, modifier et sélectionner plusieurs entreprises (avec gestion de devises, logos, et coordonnées).
- **Création & Gestion de Factures** :
  - Création de factures détaillées avec prévisualisation en temps réel (A4 mock-up).
  - Sauvegarde/Enregistrement et modification de brouillons.
  - Génération de factures en format PDF.
  - Transmission des factures via des modales interactives pour WhatsApp ou Email (avec animation de succès).
  - Gestion des réductions globales et calcul dynamique des taxes (TVA, TTC, HT).
  - Modification des statuts (payée, annulée, en retard, envoyée, brouillon).
- **Gestion des Clients** : Ajouter, éditer, lister et supprimer des clients avec fonctionnalité de recherche.
- **Portefeuille & Transactions** : Intégration simulée du Mobile Money (Orange, MTN) pour les encaissements, liste des transactions récentes.
- **Rapports & Budgets** : Outils de suivi de performance financière et prévisions.
- **Paramètres & Aide** : Réglages généraux du compte et FAQ/Support pour les utilisateurs.
- **Support Mode Sombre (Dark Mode)** : Entièrement implémenté (Slate en light, Zinc en dark).

## La structure des fichiers
```
izi-facture/
├── app/                  # Dossier principal Next.js (App Router)
│   ├── globals.css       # Variables CSS, design system et utilitaires Tailwind (v4)
│   ├── layout.tsx        # Layout racine
│   └── page.tsx          # Page principale de l'application (Contrôleur de vues SPA)
├── components/           # Composants de l'application
│   ├── sidebar.tsx             # Barre de navigation latérale et gestion des entreprises
│   ├── stats-cards.tsx         # Cartes KPIs du tableau de bord
│   ├── interactive-chart.tsx   # Graphique d'analyse des revenus
│   ├── recent-invoices.tsx     # Liste réduite des factures (pour dashboard)
│   ├── create-invoice.tsx      # Éditeur de facture avec prévisualisation live et envoi
│   ├── invoices-page.tsx       # Liste complète des factures
│   ├── invoice-detail.tsx      # Vue détails, historique et gestion du statut d'une facture
│   ├── clients-page.tsx        # Gestion (CRUD) des clients
│   ├── wallet-page.tsx         # Intégrations Mobile Money et Portefeuille
│   ├── transactions-page.tsx   # Historique complet des transactions/paiements
│   ├── budgets-page.tsx        # Gestion des budgets
│   ├── reports-page.tsx        # Rapports financiers
│   ├── settings-page.tsx       # Configurations et paramètres utilisateur
│   └── help-page.tsx           # Centre d'assistance
├── lib/
│   └── data.ts           # Définitions TypeScript (Interfaces), Mock Data, fonctions globales (PDF, formatage monnaie)
├── public/               # Images et ressources statiques
├── package.json          # Liste des dépendances npm
└── GEMINI.md             # Présent document de référence
```

## Les technologies utilisées
- **Framework** : Next.js 16.2.9 (App Router)
- **Bibliothèque UI** : React 19
- **Stylisation** : Tailwind CSS v4 (avec `@tailwindcss/postcss`)
- **Langage** : TypeScript
- **Icônes** : Lucide-react (`lucide-react`)

## Les décisions de design
- **Aesthetic Premium & Mode Sombre** : L'interface utilise un système de design soigné. Le mode clair utilise des nuances Slate (`slate-50`, `slate-900`) et le mode sombre des nuances Zinc (`zinc-950`, `zinc-900`), couplé à une couleur d'accentuation Bleu moderne (`blue-600`).
- **Comportement "Single Page" (SPA)** : Pour assurer une navigation instantanée et fluide sans rechargement, le fichier `app/page.tsx` orchestre l'affichage des différents composants (vues) via un état `activeTab`. 
- **Micro-animations & Retours visuels** : L'UX est grandement améliorée par l'utilisation de multiples animations (hover effects, `animate-spin`, `animate-in fade-in zoom-in`) et l'usage constant de notifications "toast" pour valider les actions de l'utilisateur (ex: sauvegarde, envoi WhatsApp).
- **Architecture de la Donnée** : L'application n'est pas (encore) couplée à un backend. Les données sont initialisées avec des "mocks" depuis `lib/data.ts` et la persistance est gérée via le `localStorage` du navigateur du client.

## Instructions pour un futur modèle IA
1. **Design System & Couleurs** : Ne jamais utiliser de couleurs HTML pures (ex: "red", "green"). Toujours s'appuyer sur le système de classes défini dans `globals.css` et utiliser les tons Slate/Zinc dictés par la règle globale de design de l'utilisateur (`<RULE[design.md]>`). Maintenir le style premium (ombres `shadow-soft`, bordures douces, angles `rounded-2xl` ou `rounded-xl`).
2. **Ajout de Fonctionnalités** : Toute nouvelle page ou vue doit être créée dans le dossier `components/` et gérée comme un état dans la structure SPA de `app/page.tsx`.
3. **Persistance des Données** : Toute nouvelle donnée ou entité (ex: employés, produits) ajoutée au projet doit posséder une interface TypeScript dans `lib/data.ts`, un mock par défaut, et être persistée via le `localStorage` dans les `useEffect` de `app/page.tsx`.
4. **Règles Strictes de Communication (User Rules)** : 
   - Toujours commencer les réponses à l'utilisateur par : `"Bienvenue Doré Henry Konan"`.
   - Si une action implique la **publication d'un site**, l'IA doit impérativement demander d'abord : `"Es-ce que tu peux le faire ?"` avant d'exécuter.
