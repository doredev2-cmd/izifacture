'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  MoreVertical, 
  Plus, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileCode,
  XCircle
} from 'lucide-react';
import { Invoice, formatFCFA } from '../lib/data';

interface RecentInvoicesProps {
  invoices: Invoice[];
  currency?: string;
  onCreateInvoiceClick?: () => void;
  onInvoiceClick?: (invoice: Invoice) => void;
  onEditInvoiceClick?: (invoice: Invoice) => void;
  onDeleteInvoice?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: Invoice['status']) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function RecentInvoices({ 
  invoices, 
  currency = 'GNF',
  onCreateInvoiceClick,
  onInvoiceClick,
  onEditInvoiceClick,
  onDeleteInvoice,
  onStatusChange,
  showToast
}: RecentInvoicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLTableCellElement>(null);
  const itemsPerPage = 5;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter logic
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-950/45">
            <CheckCircle size={12} /> Payée
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-950/45">
            <Clock size={12} /> Envoyée
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-950/45">
            <AlertCircle size={12} /> En retard
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-655 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/30">
            <FileCode size={12} /> Brouillon
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-800">
            <XCircle size={12} /> Annulée
          </span>
        );
      default:
        return null;
    }
  };

  const handleDownload = (inv: Invoice) => {
    const textContent = `=========================================
           IZI-FACTURE PLATFORM
=========================================
FACTURE N° : ${inv.invoiceNumber}
Date d'Émission : ${inv.issueDate}
Date d'Échéance : ${inv.dueDate}
Moyen de Règlement : ${inv.paymentMethod || 'Virement bancaire'}
Statut de la Facture : ${inv.status.toUpperCase()}

CLIENT :
-----------------------------------------
Nom/Entreprise : ${inv.clientName}
Adresse E-mail : ${inv.clientEmail}

DÉTAILS DES PRESTATIONS :
-----------------------------------------
${(inv.items || []).map((item, idx) => `${idx + 1}. ${item.description.padEnd(35)} | Qté: ${item.quantity.toString().padEnd(2)} | P.U: ${formatFCFA(item.unitPrice, currency)} | Total: ${formatFCFA(item.quantity * item.unitPrice, currency)}`).join('\n')}

RÉSUMÉ FINANCIER :
-----------------------------------------
Sous-Total HT : ${formatFCFA(inv.subtotal || (inv.amount - (inv.taxAmount || 0)), currency)}
Remise        : ${inv.discountAmount ? formatFCFA(inv.discountAmount, currency) : '0 ' + currency}
TVA (18%)     : ${formatFCFA(inv.taxAmount || 0, currency)}
TOTAL TTC     : ${formatFCFA(inv.amount, currency)}

Document signé électroniquement.
Merci pour votre confiance !
=========================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facture-${inv.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast?.(`La facture ${inv.invoiceNumber} a été téléchargée en format texte de simulation.`, 'success');
  };

  const statusFilters = [
    { label: 'Tous', value: 'all' },
    { label: 'Payées', value: 'paid' },
    { label: 'Envoyées', value: 'sent' },
    { label: 'En retard', value: 'overdue' },
    { label: 'Brouillons', value: 'draft' },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-soft border border-slate-100 dark:border-zinc-850">
      {/* Header Panel */}
      <div className="p-6 border-b border-slate-100 dark:border-zinc-850 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">
            Factures Récentes
          </h3>
          <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
            Visualisez et gérez le statut des dernières factures émises
          </p>
        </div>
        
        <button 
          onClick={onCreateInvoiceClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 dark:bg-blue-650 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl transition-all duration-155 shadow-md cursor-pointer"
        >
          <Plus size={16} />
          Créer une Facture
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="px-6 py-4 bg-slate-50/50 dark:bg-zinc-950/20 border-b border-slate-100 dark:border-zinc-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-455 dark:text-zinc-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Facture, client, email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 w-full md:w-auto p-1 bg-slate-100/85 dark:bg-zinc-950/45 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {statusFilters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border cursor-pointer whitespace-nowrap shrink-0
                ${selectedStatus === filter.value
                  ? 'bg-white text-slate-800 border-slate-200/60 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-850 dark:text-zinc-400 dark:hover:text-white border-transparent'
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
              <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[12%] min-w-[110px] whitespace-nowrap">Facture</th>
              <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[28%] min-w-[180px] whitespace-nowrap">Client</th>
              <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[22%] min-w-[160px] whitespace-nowrap">Émission / Échéance</th>
              <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[18%] min-w-[130px] whitespace-nowrap">Montant</th>
              <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[12%] min-w-[110px] whitespace-nowrap">Statut</th>
              <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider text-right w-[8%] min-w-[100px] whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-850/70">
            {paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((inv) => (
                <tr 
                  key={inv.id}
                  onClick={() => onInvoiceClick?.(inv)}
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
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-zinc-200 whitespace-nowrap">
                    {formatFCFA(inv.amount, currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap relative" ref={menuContainerRef} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onInvoiceClick?.(inv)}
                        title="Voir la facture"
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        onClick={() => handleDownload(inv)}
                        title="Télécharger"
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download size={15} />
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === inv.id ? null : inv.id);
                          }}
                          title="Options"
                          className="p-1.5 text-slate-550 dark:text-slate-450 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical size={15} />
                        </button>
                        
                        {activeMenuId === inv.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-premium z-50 py-1.5 overflow-hidden text-left animate-in fade-in slide-in-from-top-1 duration-100">
                            <button
                              onClick={() => {
                                onInvoiceClick?.(inv);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                            >
                              Voir le détail
                            </button>
                            <button
                              onClick={() => {
                                onEditInvoiceClick?.(inv);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                            >
                              Modifier
                            </button>
                            <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
                            <div className="px-3 py-1 text-[9px] font-bold text-slate-450 dark:text-zinc-550 uppercase tracking-wider">
                              Changer le statut
                            </div>
                            <button
                              onClick={() => {
                                onStatusChange?.(inv.id, 'paid');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              Marquer Payée
                            </button>
                            <button
                              onClick={() => {
                                onStatusChange?.(inv.id, 'sent');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-1.5 text-xs text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              Marquer Envoyée
                            </button>
                            <button
                              onClick={() => {
                                onStatusChange?.(inv.id, 'overdue');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-1.5 text-xs text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              Marquer En retard
                            </button>
                            <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
                            <button
                              onClick={() => {
                                onDeleteInvoice?.(inv.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-455 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-xs font-semibold text-slate-400 dark:text-zinc-555">
                  Aucune facture ne correspond à vos critères de recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination Indicator */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-850 bg-slate-50/30 dark:bg-zinc-950/10 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
          Affichage de {filteredInvoices.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredInvoices.length)} sur {filteredInvoices.length} factures
        </span>
        
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg bg-white dark:bg-zinc-900 transition-colors ${
              currentPage === 1 
                ? 'text-slate-300 dark:text-zinc-700 border-slate-150 dark:border-zinc-850 cursor-not-allowed' 
                : 'text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 cursor-pointer'
            }`}
          >
            Précédent
          </button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg bg-white dark:bg-zinc-900 transition-colors ${
              currentPage === totalPages 
                ? 'text-slate-300 dark:text-zinc-700 border-slate-150 dark:border-zinc-850 cursor-not-allowed' 
                : 'text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 cursor-pointer'
            }`}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
