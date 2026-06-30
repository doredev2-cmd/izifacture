'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  FileText,
  Eye,
  Plus,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCode,
  XCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Invoice, Company, formatFCFA, printInvoice } from '../lib/data';

interface InvoicesPageProps {
  invoices: Invoice[];
  activeCompany: Company;
  currency: string;
  onCreateInvoiceClick: () => void;
  onInvoiceClick: (invoice: Invoice) => void;
}

export default function InvoicesPage({
  invoices,
  activeCompany,
  currency = 'GNF',
  onCreateInvoiceClick,
  onInvoiceClick
}: InvoicesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Filter invoices based on status and search query
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || inv.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-950/45">
            <CheckCircle size={11} /> Payée
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-805 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-950/45">
            <Clock size={11} /> Envoyée
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-950/45">
            <AlertCircle size={11} /> En retard
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-655 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/30">
            <FileCode size={11} /> Brouillon
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-800">
            <XCircle size={11} /> Annulée
          </span>
        );
      default:
        return null;
    }
  };

  const statusFilters = [
    { label: 'Toutes', value: 'all' },
    { label: 'Payées', value: 'paid' },
    { label: 'Envoyées', value: 'sent' },
    { label: 'En retard', value: 'overdue' },
    { label: 'Brouillons', value: 'draft' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
            Facturation / Liste
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Toutes vos Factures
          </h1>
          <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
            Gérez, filtrez, relancez ou éditez l'ensemble des factures de votre entreprise.
          </p>
        </div>

        <button
          onClick={onCreateInvoiceClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 dark:bg-blue-655 hover:bg-blue-700 text-white rounded-xl transition-all duration-150 shadow-md cursor-pointer"
        >
          <Plus size={16} />
          Créer une Facture
        </button>
      </div>

      {/* Metrics / Counter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft flex flex-col justify-center">
          <div className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><FileText size={12} /> Total Factures</div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{invoices.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft flex flex-col justify-center">
          <div className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle size={12} /> Payées</div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{invoices.filter(i => i.status === 'paid').length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft flex flex-col justify-center">
          <div className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock size={12} /> En Attente</div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{invoices.filter(i => i.status === 'sent').length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft flex flex-col justify-center">
          <div className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><AlertCircle size={12} /> En Retard</div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{invoices.filter(i => i.status === 'overdue').length}</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft overflow-hidden">

        {/* Filters and Search Bar */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-zinc-950/20 border-b border-slate-100 dark:border-zinc-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 dark:text-zinc-500" size={15} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par numéro, nom, e-mail..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1 w-full md:w-auto p-1 bg-slate-100/80 dark:bg-zinc-950/40 rounded-xl border border-slate-200 dark:border-zinc-800/70 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border cursor-pointer whitespace-nowrap shrink-0
                  ${selectedStatus === filter.value
                    ? 'bg-white text-slate-800 border-slate-200/60 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white border-transparent'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-850 bg-slate-50/30 dark:bg-zinc-950/10">
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[15%] min-w-[120px] whitespace-nowrap">N° Facture</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[28%] min-w-[180px] whitespace-nowrap">Client</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[22%] min-w-[160px] whitespace-nowrap">Émission / Échéance</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[18%] min-w-[130px] whitespace-nowrap">Montant</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[12%] min-w-[110px] whitespace-nowrap">Statut</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider text-right w-[5%] min-w-[80px] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850/70">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onInvoiceClick(inv)}
                    className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 flex items-center justify-center font-medium">
                          <FileText size={15} />
                        </div>
                        <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                          {inv.invoiceNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {inv.clientName}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 dark:text-zinc-550 mt-0.5">
                          {inv.clientEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-650 dark:text-zinc-400 whitespace-nowrap">
                      <div>
                        <div>{inv.issueDate}</div>
                        <div className="text-[10px] text-slate-455 dark:text-zinc-500 font-medium mt-0.5">
                          Échéance : {inv.dueDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-zinc-200 whitespace-nowrap">
                      {formatFCFA(inv.amount, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onInvoiceClick(inv)}
                          title="Voir le détail"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => printInvoice(inv, activeCompany)}
                          title="Télécharger PDF"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs font-semibold text-slate-400 dark:text-zinc-500">
                    Aucune facture ne correspond à vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info / Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-850 bg-slate-50/30 dark:bg-zinc-950/10 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-wider">
            Affichage de {filteredInvoices.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredInvoices.length)} sur {filteredInvoices.length} factures
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg bg-white dark:bg-zinc-900 transition-colors ${currentPage === 1
                  ? 'text-slate-300 dark:text-zinc-700 border-slate-150 dark:border-zinc-850 cursor-not-allowed'
                  : 'text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 cursor-pointer'
                }`}
            >
              Précédent
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg bg-white dark:bg-zinc-900 transition-colors ${currentPage === totalPages
                  ? 'text-slate-300 dark:text-zinc-700 border-slate-150 dark:border-zinc-850 cursor-not-allowed'
                  : 'text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 cursor-pointer'
                }`}
            >
              Suivant
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
