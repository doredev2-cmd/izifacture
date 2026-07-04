'use client';

import React from 'react';

export default function Features() {
  return (
    <section id="solution" className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg mt-stack-lg fade-in-up delay-200">
      <div className="text-center mb-stack-md">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Pourquoi la facturation traditionnelle vous ralentit ?
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        
        {/* Feature 1 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-error text-3xl">⚠️</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm mb-2 text-on-surface">Factures non professionnelles</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Perte de crédibilité face à vos clients importants.</p>
        </div>

        {/* Feature 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-primary text-3xl">🧮</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm mb-2 text-on-surface">Calculs de TVA manuels</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Erreurs coûteuses. La TVA 18% est automatique chez nous.</p>
        </div>

        {/* Feature 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-secondary text-3xl">⏱️</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm mb-2 text-on-surface">Suivi impossible</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Perte de temps considérable sur les relances clients.</p>
        </div>

      </div>
    </section>
  );
}
