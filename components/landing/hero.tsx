'use client';

import React from 'react';

export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-center fade-in-up">
      <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface mb-stack-sm max-w-4xl mx-auto tracking-tighter leading-tight">
        Dites adieu aux factures sur Word et Excel.
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-md max-w-2xl mx-auto">
        iziFacture est la solution de facturation simple et moderne conçue pour les entrepreneurs Guinéens et Africains.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center items-center gap-base mb-stack-lg">
        <button onClick={onStart} className="magnetic-btn w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:opacity-80 transition-opacity shadow-[0px_4px_20px_rgba(0,0,0,0.1)]">
          Commencer gratuitement
        </button>
        <a href="#solution" className="w-full sm:w-auto bg-transparent border border-outline text-tertiary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-center">
          Voir la démo
        </a>
      </div>

      {/* Dashboard Mockup */}
      <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-[0px_10px_32px_rgba(0,0,0,0.08)] border border-outline-variant/20 fade-in-up delay-100">
        <div className="bg-surface-container-lowest w-full h-[300px] md:h-[500px] flex items-center justify-center p-4 md:p-8">
          <div className="w-full h-full border border-outline-variant/50 rounded-lg flex flex-col p-4 md:p-6 bg-surface-bright shadow-inner">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                  <span className="text-on-primary-container text-xl font-bold">📄</span>
                </div>
                <div className="text-left">
                  <div className="font-headline-sm text-headline-sm text-on-surface">Facture AN-2005</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Due December 4, 2024</div>
                </div>
              </div>
              <div className="px-3 py-1 bg-secondary-container/20 text-on-secondary-container rounded-full font-label-md text-label-md">Payé</div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="h-6 md:h-8 bg-surface-variant/50 rounded-md w-full animate-pulse"></div>
              <div className="h-6 md:h-8 bg-surface-variant/50 rounded-md w-full animate-pulse delay-75"></div>
              <div className="h-6 md:h-8 bg-surface-variant/50 rounded-md w-3/4 animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
