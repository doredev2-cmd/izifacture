'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-stack-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-base max-w-container-max mx-auto border-t border-white/10 bg-black text-white mt-10">
      <div className="font-headline-sm text-headline-sm font-bold flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
          <span className="text-white text-xs">⚡</span>
        </div>
        iziFacture
      </div>
      
      <div className="flex flex-wrap justify-center gap-base font-label-md text-label-md mt-4 md:mt-0">
        <a className="text-white/70 hover:text-white underline-offset-4 hover:underline transition-all duration-200" href="#about">À propos</a>
        <a className="text-white/70 hover:text-white underline-offset-4 hover:underline transition-all duration-200" href="#privacy">Confidentialité</a>
        <a className="text-white/70 hover:text-white underline-offset-4 hover:underline transition-all duration-200" href="#terms">Conditions</a>
        <a className="text-white/70 hover:text-white underline-offset-4 hover:underline transition-all duration-200" href="#support">Support</a>
        <a className="text-white/70 hover:text-white underline-offset-4 hover:underline transition-all duration-200" href="#blog">Blog</a>
      </div>
      
      <div className="font-body-sm text-body-sm text-white/50 mt-4 md:mt-0 text-center md:text-right">
        © 2024 iziFacture. Fait avec fierté en Guinée et pour l'Afrique.
      </div>
    </footer>
  );
}
