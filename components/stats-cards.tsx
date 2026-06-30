'use client';

import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Invoice, formatFCFA } from '../lib/data';

interface StatsCardsProps {
  invoices: Invoice[];
  currency?: string;
}

export default function StatsCards({ invoices, currency = 'GNF' }: StatsCardsProps) {
  // Calculations
  const totalCount = invoices.length;
  
  const totalInvoiced = invoices
    .filter(inv => inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.amount, 0);
    
  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
    
  const totalPending = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'draft')
    .reduce((sum, inv) => sum + inv.amount, 0);
    
  const totalOverdue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const stats = [
    {
      title: 'Total Facturé',
      value: formatFCFA(totalInvoiced, currency),
      subtext: `${totalCount} factures actives`,
      icon: FileText,
      color: 'blue',
      trend: { value: '+14.2%', isPositive: true },
      bgClass: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Montant Encaissé',
      value: formatFCFA(totalPaid, currency),
      subtext: `${invoices.filter(i => i.status === 'paid').length} factures réglées`,
      icon: CheckCircle2,
      color: 'green',
      trend: { value: '+21.5%', isPositive: true },
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Montant en Attente',
      value: formatFCFA(totalPending, currency),
      subtext: `${invoices.filter(i => i.status === 'sent').length} factures envoyées`,
      icon: Clock,
      color: 'orange',
      trend: { value: '-3.1%', isPositive: false },
      bgClass: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Factures en Retard',
      value: formatFCFA(totalOverdue, currency),
      subtext: `${invoices.filter(i => i.status === 'overdue').length} factures impayées`,
      icon: AlertTriangle,
      color: 'red',
      trend: { value: '+8.4%', isPositive: false },
      bgClass: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                {stat.title}
              </span>
              <h3 className="text-[18px] font-semibold text-slate-800 dark:text-zinc-100 mt-2 leading-none tracking-tight">
                {stat.value}
              </h3>
            </div>
            
            <div className={`p-2.5 rounded-xl ${stat.bgClass}`}>
              <stat.icon size={20} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-50 dark:border-zinc-800/80">
            <span className="text-xs text-slate-450 dark:text-zinc-500 font-medium">
              {stat.subtext}
            </span>
            
            <div className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md
              ${stat.trend.isPositive 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}
            `}>
              {stat.trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{stat.trend.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
