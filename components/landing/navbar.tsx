'use client';

import React, { useState, useEffect } from 'react';

export default function Navbar({ onStart }: { onStart: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 flex justify-center ${scrolled ? 'bg-black/90 backdrop-blur-lg shadow-lg' : 'bg-black backdrop-blur-md'}`}>
      <div className="w-full flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max">
        <div className="font-headline-md text-headline-md font-bold text-white tracking-tight flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 duration-300">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">⚡</span>
          </div>
          iziFacture
        </div>
        <div className="hidden md:flex items-center gap-stack-md font-label-md text-label-md">
          <a className="text-white/80 hover:text-white transition-colors" href="#solution">Solution</a>
          <a className="text-white/80 hover:text-white transition-colors" href="#fonctionnalites">Fonctionnalités</a>
          <a className="text-white/80 hover:text-white transition-colors" href="#tarifs">Tarifs</a>
          <a className="text-white/80 hover:text-white transition-colors" href="#temoignages">Témoignages</a>
        </div>
        <div className="flex items-center gap-base">
          <button onClick={onStart} className="hidden md:block font-label-md text-label-md text-white/80 hover:text-white transition-colors">
            Se connecter
          </button>
          <button onClick={onStart} className="magnetic-btn bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:opacity-80 transition-opacity duration-300 shadow-[0px_4px_20px_rgba(0,0,0,0.1)]">
            Commencer gratuitement
          </button>
        </div>
      </div>
    </nav>
  );
}
