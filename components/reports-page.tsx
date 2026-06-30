'use client';

import React from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Percent, 
  Briefcase, 
  ShieldCheck, 
  Scale
} from 'lucide-react';
import { Invoice, formatFCFA } from '../lib/data';

interface ReportsPageProps {
  invoices: Invoice[];
  currency: string;
}

export default function ReportsPage({ invoices, currency = 'GNF' }: ReportsPageProps) {
  // Report indicators
  const totalInvoiced = invoices
    .filter(inv => inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalTax = invoices
    .filter(inv => inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);

  const recoveryRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="pb-4 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
          Analyses Financières
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Rapports Financiers & Déclarations
        </h1>
        <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
          Suivez votre chiffre d'affaires, la TVA collectée et facilitez vos clôtures comptables.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Chiffre d'Affaires */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-wider block">Chiffre d'Affaires émis</span>
          <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 mt-2">{formatFCFA(totalInvoiced, currency)}</h3>
          <span className="text-[10px] text-slate-455 dark:text-zinc-500 mt-1 block">Invoices actives</span>
        </div>

        {/* TVA Collectée */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-wider block">TVA Collectée (18%)</span>
          <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 mt-2">{formatFCFA(totalTax, currency)}</h3>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1 block">Prêt pour déclaration</span>
        </div>

        {/* Taux de Recouvrement */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-wider block">Taux de Recouvrement</span>
          <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-450 mt-2">{recoveryRate}%</h3>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Factures encaissées</span>
        </div>

        {/* Trésorerie Encaissée */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-wider block">Montant encaissé réel</span>
          <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 mt-2">{formatFCFA(totalPaid, currency)}</h3>
          <span className="text-[10px] text-slate-455 dark:text-zinc-500 mt-1 block">Fonds disponibles</span>
        </div>
      </div>

      {/* Tax Report & Table summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Table summary of TVA collected per Invoice */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-50 dark:border-zinc-850/60 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-850 dark:text-zinc-200 uppercase tracking-wider">TVA collectée détaillée</h3>
              <p className="text-[11px] text-slate-455 dark:text-zinc-500 font-medium">Lignes de TVA calculées pour vos formulaires de déclarations fiscales</p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Scale size={16} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/40 dark:bg-zinc-950/20 border-b border-slate-100 dark:border-zinc-850">
                  <th className="px-5 py-3 font-bold text-slate-450 uppercase tracking-wider">N° Facture</th>
                  <th className="px-5 py-3 font-bold text-slate-455 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 font-bold text-slate-455 uppercase tracking-wider">Base HT</th>
                  <th className="px-5 py-3 font-bold text-slate-455 uppercase tracking-wider">Taux</th>
                  <th className="px-5 py-3 font-bold text-slate-455 uppercase tracking-wider">Montant TVA</th>
                  <th className="px-5 py-3 font-bold text-slate-455 uppercase tracking-wider">Total TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-850/60">
                {invoices
                  .filter(inv => inv.status !== 'cancelled' && inv.status !== 'draft')
                  .map(inv => {
                    const sub = inv.subtotal || (inv.amount - (inv.taxAmount || 0));
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                        <td className="px-5 py-3 font-bold text-slate-800 dark:text-zinc-200">{inv.invoiceNumber}</td>
                        <td className="px-5 py-3 text-slate-450 dark:text-zinc-400">{inv.issueDate}</td>
                        <td className="px-5 py-3 font-semibold text-slate-700 dark:text-zinc-300">{formatFCFA(sub, currency)}</td>
                        <td className="px-5 py-3 text-slate-500">18%</td>
                        <td className="px-5 py-3 font-bold text-slate-750 dark:text-zinc-200">{formatFCFA(inv.taxAmount || 0, currency)}</td>
                        <td className="px-5 py-3 font-black text-slate-800 dark:text-zinc-150">{formatFCFA(inv.amount, currency)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side recommendations */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-850 dark:text-zinc-200 uppercase tracking-wider">Conformité Fiscale</h3>
          </div>
          <p className="text-xs text-slate-550 dark:text-zinc-400 leading-relaxed">
            Izi-Facture applique automatiquement le taux standard de TVA de 18% en vigueur pour les prestations de services en Afrique de l'Ouest (Union Monétaire Ouest Africaine et Guinée).
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200 block mb-1">Avis Comptable</span>
            Les montants indiqués ici correspondent à la méthode de la comptabilité d'engagement. Pensez à vérifier vos règlements réels en banque avant de valider votre déclaration mensuelle.
          </div>
        </div>

      </div>

    </div>
  );
}
