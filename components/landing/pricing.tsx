'use client';

import React from 'react';

export default function Pricing({ onStart }: { onStart: () => void }) {
  return (
    <section id="tarifs" className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg fade-in-up delay-300">
      <div className="text-center mb-stack-lg">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4">
          Des tarifs adaptés à votre croissance
        </h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto font-body-lg text-body-lg">
          Choisissez le plan qui correspond le mieux aux besoins de votre entreprise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Free Plan */}
        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 flex flex-col transition-transform hover:-translate-y-2 duration-300">
          <div className="mb-6">
            <h3 className="font-headline-sm text-headline-sm mb-2 text-on-surface">Gratuit</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-headline-lg font-bold text-on-surface">0 GNF</span>
              <span className="text-on-surface-variant text-body-md">/mois</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              5 factures / mois
            </li>
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              1 utilisateur
            </li>
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              Support par email
            </li>
          </ul>
          <button onClick={onStart} className="w-full py-3 px-4 border border-primary text-primary font-label-md text-center rounded-lg hover:bg-primary/5 transition-colors">
            Commencer
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-surface-container-lowest p-8 rounded-xl border-2 border-primary relative flex flex-col shadow-lg transition-transform hover:-translate-y-2 duration-300 scale-100 md:scale-105 z-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-1 rounded-full font-label-md text-label-md">
            Populaire
          </div>
          <div className="mb-6">
            <h3 className="font-headline-sm text-headline-sm mb-2 text-on-surface">Pro</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-headline-lg font-bold text-on-surface">90 000 GNF</span>
              <span className="text-on-surface-variant text-body-md">/mois</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              Factures illimitées
            </li>
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              3 utilisateurs
            </li>
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              Devis & Bons de commande
            </li>
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              Support prioritaire
            </li>
          </ul>
          <button onClick={onStart} className="w-full py-3 px-4 bg-primary text-on-primary font-label-md text-center rounded-lg hover:opacity-90 transition-opacity">
            Choisir Pro
          </button>
        </div>

        {/* Business Plan */}
        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 flex flex-col transition-transform hover:-translate-y-2 duration-300">
          <div className="mb-6">
            <h3 className="font-headline-sm text-headline-sm mb-2 text-on-surface">Business</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-headline-lg font-bold text-on-surface">300 000 GNF</span>
              <span className="text-on-surface-variant text-body-md">/mois</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              Tout du plan Pro
            </li>
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              Utilisateurs illimités
            </li>
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              Gestion de stock
            </li>
            <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <span className="text-primary text-[20px]">✔️</span>
              API & Intégrations
            </li>
          </ul>
          <button onClick={onStart} className="w-full py-3 px-4 border border-primary text-primary font-label-md text-center rounded-lg hover:bg-primary/5 transition-colors">
            Choisir Business
          </button>
        </div>
      </div>
    </section>
  );
}
