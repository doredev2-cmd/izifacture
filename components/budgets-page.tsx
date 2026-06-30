'use client';

import React, { useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Edit, 
  PiggyBank, 
  Calculator,
  Percent,
  CheckCircle,
  X
} from 'lucide-react';
import { Budget, mockBudgets, formatFCFA } from '../lib/data';

interface BudgetsPageProps {
  currency: string;
}

export default function BudgetsPage({ currency = 'GNF' }: BudgetsPageProps) {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [editLimit, setEditLimit] = useState<string>('');

  const handleOpenEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setEditLimit(budget.allocated.toString());
    setShowModal(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget) return;

    const updated = budgets.map(b => {
      if (b.id === selectedBudget.id) {
        return {
          ...b,
          allocated: parseFloat(editLimit) || 0
        };
      }
      return b;
    });

    setBudgets(updated);
    setShowModal(false);
  };

  // Calculations
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="pb-4 border-b border-slate-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
            Trésorerie / Contrôle
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Budgets & Enveloppes
          </h1>
          <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
            Suivez et limitez vos dépenses d'exploitation pour optimiser vos marges.
          </p>
        </div>
      </div>

      {/* Overview Block */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-850 p-6 shadow-soft grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Spent Progress Wheel (or summary text) */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider block">
            Dépenses Globales vs Budget
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-150">
              {overallPercent}%
            </h2>
            <span className="text-xs text-slate-400 font-semibold">consommé</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                overallPercent > 90 ? 'bg-rose-500' : overallPercent > 70 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
        </div>

        {/* Total Allocated Card */}
        <div className="p-4 rounded-xl bg-slate-50/40 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-850 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Total Alloué</span>
          <div className="text-base font-black text-slate-800 dark:text-zinc-200">
            {formatFCFA(totalAllocated, currency)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">4 catégories d'exploitation</span>
        </div>

        {/* Remaining Card */}
        <div className="p-4 rounded-xl bg-slate-50/40 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-850 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Solde resté disponible</span>
          <div className={`text-base font-black ${totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {formatFCFA(totalRemaining, currency)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Économie disponible</span>
        </div>

      </div>

      {/* Budgets Progress Bar cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {budgets.map((b) => {
          const ratio = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
          return (
            <div 
              key={b.id}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200">
                    {b.category}
                  </h3>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider mt-0.5">
                    Budget ID : {b.id}
                  </p>
                </div>
                
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-zinc-450 dark:hover:text-zinc-350 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
                  title="Modifier l'enveloppe"
                >
                  <Edit size={14} />
                </button>
              </div>

              {/* Progress and indicators */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-500 dark:text-zinc-400">Consommé : {formatFCFA(b.spent, currency)}</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-200">Limite : {formatFCFA(b.allocated, currency)}</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-zinc-950/60 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${b.color} ${ratio > 90 ? 'animate-pulse' : ''}`}
                    style={{ width: `${Math.min(100, ratio)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] pt-1">
                  <span className={`font-bold px-1.5 py-0.5 rounded-md ${
                    ratio > 90 
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20' 
                      : ratio > 75 
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' 
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                  }`}>
                    {ratio}% utilisé
                  </span>
                  
                  <span className="text-slate-400 dark:text-zinc-500 font-semibold">
                    Reste : {formatFCFA(Math.max(0, b.allocated - b.spent), currency)}
                  </span>
                </div>
              </div>

            </div>
          );
        })}

      </div>

      {/* Edit Budget Modal */}
      {showModal && selectedBudget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveBudget}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-premium animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-zinc-100"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-850/60 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Modifier le budget alloué
              </h3>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white p-1 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Catégorie</span>
                <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">{selectedBudget.category}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Montant limite alloué ({currency})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-850/60">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-zinc-450 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
