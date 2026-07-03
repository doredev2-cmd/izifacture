'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileCode,
  XCircle,
  Mail,
  Download,
  Check,
  Calendar,
  User,
  CreditCard,
  Building
} from 'lucide-react';
import { Invoice, Company, mockCompanies, formatFCFA, printInvoice } from '../lib/data';

interface InvoiceDetailProps {
  invoice: Invoice;
  companies: Company[];
  activeCompany: Company;
  onBack: () => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: Invoice['status']) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function InvoiceDetail({
  invoice,
  companies = [],
  activeCompany,
  onBack,
  onEdit,
  onDelete,
  onStatusChange,
  showToast
}: InvoiceDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const invoiceCompany = companies.find(c => c.id === invoice.companyId) || activeCompany;

  const getStatusDetails = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Payée',
          colorClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-950/45',
          icon: CheckCircle
        };
      case 'sent':
        return {
          label: 'Envoyée',
          colorClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-950/45',
          icon: Clock
        };
      case 'overdue':
        return {
          label: 'En retard',
          colorClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-950/45',
          icon: AlertCircle
        };
      case 'draft':
        return {
          label: 'Brouillon',
          colorClass: 'bg-slate-50 text-slate-655 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/30',
          icon: FileCode
        };
      case 'cancelled':
        return {
          label: 'Annulée',
          colorClass: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-800',
          icon: XCircle
        };
    }
  };

  const statusOptions: Invoice['status'][] = ['paid', 'sent', 'overdue', 'draft', 'cancelled'];
  const statusDetails = getStatusDetails(invoice.status);
  const StatusIcon = statusDetails.icon;

  const handlePrint = () => {
    printInvoice(invoice, invoiceCompany);
  };

  return (
    <div className="space-y-6">
      {/* Header and top controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
            title="Retour à la liste"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
              Facturation / Détail
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Facture {invoice.invoiceNumber}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status badge and switcher */}
          <div className="relative">
            <button 
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${statusDetails.colorClass}`}
            >
              <StatusIcon size={14} />
              <span>Statut : {statusDetails.label}</span>
            </button>

            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-md z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                <div className="px-3 py-1 text-[9px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-wider">
                  Changer le statut
                </div>
                {statusOptions.map((opt) => {
                  const optDet = getStatusDetails(opt);
                  const OptIcon = optDet.icon;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        onStatusChange(invoice.id, opt);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors"
                    >
                      <OptIcon size={12} />
                      <span>{optDet.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <button 
            onClick={() => onEdit(invoice)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Edit size={14} /> Modifier
          </button>
          
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-55 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-100 dark:border-rose-900/20"
          >
            <Trash2 size={14} /> Supprimer
          </button>

          <button 
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 dark:bg-blue-655 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-premium animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirmer la suppression</h3>
            <p className="text-xs text-slate-550 dark:text-zinc-400 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement la facture <span className="font-bold text-slate-800 dark:text-zinc-200">{invoice.invoiceNumber}</span> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-zinc-450 dark:hover:text-zinc-350 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDelete(invoice.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real Invoice Sheet (Printable A4 preview style) */}
        {/* Real Invoice Sheet (Printable A4 preview style - Classic Clean Design with Blue/Black accents) */}
        <div 
          className="lg:col-span-2 bg-white rounded-none shadow-premium w-full relative overflow-hidden flex flex-col justify-between text-slate-800" 
          style={{ minHeight: '842px', backgroundColor: 'white', padding: '40px 48px' }}
        >
          
          <div className="flex-1 flex flex-col">
            {/* Top Header Section */}
            <div className="flex justify-between items-start mb-12">
              {/* Left: Company Info */}
              <div className="flex flex-col gap-1.5">
                {/* Logo */}
                {invoiceCompany.logo && invoiceCompany.logo.startsWith('data:image') ? (
                  <img src={invoiceCompany.logo} alt="Logo" className="max-h-16 object-contain mb-4" />
                ) : (
                  <div className="w-12 h-12 mb-4 bg-[#1e2a47] rounded-xl flex items-center justify-center text-yellow-400 font-black text-2xl shadow-md">
                    {invoiceCompany.name.charAt(0)}
                  </div>
                )}
                <h2 className="text-xl font-black text-[#0f172a]">{invoiceCompany.name || 'VOTRE LOGO'}</h2>
                <p className="text-sm text-slate-600 font-medium">{invoiceCompany.address || 'Adresse de l\'entreprise'}</p>
                <p className="text-[11px] text-slate-500 font-medium">RCCM : {invoiceCompany.rccm || '-'} • NIF : {invoiceCompany.nif || '-'}</p>
              </div>

              {/* Right: Invoice Info */}
              <div className="flex flex-col items-end text-right">
                <h1 className="text-4xl font-black text-blue-600 tracking-wider mb-2 uppercase">FACTURE</h1>
                <p className="text-lg font-bold text-[#0f172a] mb-6">{invoice.invoiceNumber || '#INV-1234'}</p>
                <div className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  <div className="flex justify-end gap-2">
                    <span>Date d'émission :</span>
                    <span className="font-bold text-[#0f172a]">{invoice.issueDate || '10/10/2024'}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span>Date d'échéance :</span>
                    <span className="font-bold text-rose-600">{invoice.dueDate || '25/10/2024'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client & Payment Info Box */}
            <div className="w-full border border-blue-100 bg-blue-50/30 rounded-2xl p-4 sm:p-6 mb-10 flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:gap-8 shadow-sm">
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">FACTURÉ À</h3>
                <div className="font-black text-base text-[#0f172a]">{invoice.clientName || 'NOM PRÉNOM'}</div>
                <div className="text-sm text-slate-600 font-medium">
                  {invoice.clientEmail || 'Adresse email du client'}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:border-l sm:border-blue-100/50 sm:pl-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-blue-100/50">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MODE DE PAIEMENT</h3>
                <div className="font-bold text-sm text-[#0f172a]">{invoice.paymentMethod || 'Virement bancaire'}</div>
                <div className="text-sm text-slate-600 font-medium">Règlement en {invoiceCompany.currency}</div>
              </div>
            </div>

            {/* Items Table */}
            <div className="w-full mb-10 flex-1">
              {/* Table Header */}
              <div className="flex text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-3 border-b-2 border-[#1e2a47]">
                <div className="w-[60%]">DÉSIGNATION / PRESTATION</div>
                <div className="w-[15%] text-center">QUANTITÉ</div>
                <div className="w-[25%] text-right">TOTAL HT</div>
              </div>
              
              {/* Table Body */}
              <div className="flex flex-col border-b border-slate-200 mb-6">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <div key={item.id} className="flex py-5 border-b border-slate-100 last:border-0 items-start">
                      <div className="w-[60%] flex flex-col gap-1.5 pr-4">
                        <span className="font-bold text-sm text-[#0f172a] leading-snug">{item.description || 'Description de la prestation'}</span>
                        <span className="text-xs text-slate-500 font-medium">P.U. : {formatFCFA(item.unitPrice, invoiceCompany.currency)}</span>
                      </div>
                      <div className="w-[15%] text-center font-bold text-sm text-[#0f172a] pt-1">{item.quantity}</div>
                      <div className="w-[25%] text-right font-bold text-sm text-[#0f172a] pt-1">{formatFCFA(item.quantity * item.unitPrice, invoiceCompany.currency)}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex py-5 border-b border-slate-100 last:border-0 items-start">
                    <div className="w-[60%] flex flex-col gap-1.5 pr-4">
                      <span className="font-bold text-sm text-[#0f172a] leading-snug">Prestation générale</span>
                      <span className="text-xs text-slate-500 font-medium">P.U. : {formatFCFA(invoice.subtotal || invoice.amount, invoiceCompany.currency)}</span>
                    </div>
                    <div className="w-[15%] text-center font-bold text-sm text-[#0f172a] pt-1">1</div>
                    <div className="w-[25%] text-right font-bold text-sm text-[#0f172a] pt-1">{formatFCFA(invoice.subtotal || invoice.amount, invoiceCompany.currency)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-16">
              <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[45%] border border-blue-100 bg-blue-50/20 rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
                <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                  <span className="whitespace-nowrap">Sous-Total HT :</span>
                  <span className="font-bold text-[#0f172a] whitespace-nowrap">{formatFCFA(invoice.subtotal || (invoice.amount - (invoice.taxAmount || 0)), invoiceCompany.currency)}</span>
                </div>
                {(invoice.discountAmount || 0) > 0 && (
                  <div className="flex justify-between items-center text-sm font-medium text-emerald-600">
                    <span className="whitespace-nowrap">Remise :</span>
                    <span className="font-bold whitespace-nowrap">-{formatFCFA(invoice.discountAmount || 0, invoiceCompany.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-medium text-slate-600 pb-3 border-b border-blue-100">
                  <span className="whitespace-nowrap">TVA (18%) :</span>
                  <span className="font-bold text-[#0f172a] whitespace-nowrap">{formatFCFA(invoice.taxAmount || 0, invoiceCompany.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-black text-[#1e2a47]">
                  <span className="whitespace-nowrap">Total TTC :</span>
                  <span className="whitespace-nowrap">{formatFCFA(invoice.amount, invoiceCompany.currency)}</span>
                </div>
              </div>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-auto flex justify-between items-end border-t border-slate-200 pt-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">{invoiceCompany.name}</span>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <Check size={14} strokeWidth={3} /> Document signé électroniquement
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SIGNATURE DE L'ÉMETTEUR</span>
                <span className="font-signature text-2xl text-[#1e2a47] opacity-90">{invoiceCompany.name}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Audit Trail & Quick Actions Panel (Right side) */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-4">Résumé Facture</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-850">
                <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 text-blue-655 dark:text-blue-400 rounded-lg">
                  <User size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Client</span>
                  <div className="font-bold text-slate-800 dark:text-zinc-200">{invoice.clientName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-850">
                <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 text-blue-655 dark:text-blue-400 rounded-lg">
                  <Calendar size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Échéance</span>
                  <div className="font-bold text-slate-800 dark:text-zinc-200">{invoice.dueDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-850">
                <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 text-blue-655 dark:text-blue-400 rounded-lg">
                  <CreditCard size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Total TTC</span>
                  <div className="font-black text-slate-800 dark:text-zinc-200 text-sm">{formatFCFA(invoice.amount, invoiceCompany.currency)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick client contact card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3">Relance Client</h3>
            <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium leading-relaxed mb-4">
              Envoyez un e-mail de rappel de paiement poli ou une notification à ce client d'un simple clic.
            </p>
            
            <button 
              onClick={() => showToast ? showToast(`Rappel de paiement envoyé avec succès à ${invoice.clientEmail} !`, 'success') : alert(`Rappel envoyé par email à ${invoice.clientEmail}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 dark:bg-blue-655 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              <Mail size={15} /> Envoyer une Relance
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
