'use client';

import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertOctagon
} from 'lucide-react';
import { Transaction, formatFCFA } from '../lib/data';

interface TransactionsPageProps {
  transactions: Transaction[];
  currency: string;
}

export default function TransactionsPage({ transactions = [], currency = 'GNF' }: TransactionsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Calculation summaries
  const totalCredit = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter(t => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalCredit - totalDebit;

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || t.method === filterMethod;
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesMethod && matchesType;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-950/45">
            <CheckCircle2 size={10} /> Validé
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-950/45">
            <Clock size={10} /> En cours
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-950/45">
            <AlertOctagon size={10} /> Échoué
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="pb-4 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-widest">
          Comptabilité
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Historique des Transactions
        </h1>
        <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
          Suivez en direct l'ensemble des encaissements et décaissements sur tous vos canaux.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Entrées */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Entrées (Revenus reçus)</span>
            <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-450 mt-1.5">{formatFCFA(totalCredit, currency)}</h3>
            <span className="text-[10px] font-bold text-emerald-600/80 mt-0.5 block">100% de réussite</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Sorties */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Sorties (Dépenses/Frais)</span>
            <h3 className="text-lg font-black text-rose-600 dark:text-rose-450 mt-1.5">{formatFCFA(totalDebit, currency)}</h3>
            <span className="text-[10px] font-bold text-rose-650/80 mt-0.5 block">Frais professionnels</span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl">
            <TrendingDown size={20} />
          </div>
        </div>

        {/* Solde net */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Flux de trésorerie net</span>
            <h3 className={`text-lg font-black mt-1.5 ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-450' : 'text-rose-600'}`}>
              {formatFCFA(netBalance, currency)}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mt-0.5 block">Total cumulé</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Wallet size={20} />
          </div>
        </div>

      </div>

      {/* Filters and Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft overflow-hidden">
        
        {/* Toolbar */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-zinc-950/20 border-b border-slate-100 dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 dark:text-zinc-500" size={15} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une transaction..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tous les Flux</option>
              <option value="credit">Revenus uniquement</option>
              <option value="debit">Dépenses uniquement</option>
            </select>

            {/* Filter by Method */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tous les Modes</option>
              <option value="Virement">Virement bancaire</option>
              <option value="Orange Money">Orange Money</option>
              <option value="MTN Money">MTN Money</option>
              <option value="Espèces">Espèces</option>
            </select>
          </div>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-850 bg-slate-50/30 dark:bg-zinc-950/10">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[15%] min-w-[110px]">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[40%] min-w-[200px]">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[15%] min-w-[120px]">Méthode</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[15%] min-w-[120px]">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[10%] min-w-[100px]">Montant</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[5%] min-w-[80px]">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850/70 text-xs">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr 
                    key={tx.id}
                    className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{tx.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-zinc-200">
                      {tx.description}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700 dark:text-zinc-350 whitespace-nowrap">
                      {tx.method}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider ${
                        tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'
                      }`}>
                        {tx.type === 'credit' ? 'Crédit (+)' : 'Débit (-)'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold whitespace-nowrap text-slate-750 dark:text-zinc-200">
                      {formatFCFA(tx.amount, currency)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs font-semibold text-slate-400 dark:text-zinc-550">
                    Aucune transaction trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
