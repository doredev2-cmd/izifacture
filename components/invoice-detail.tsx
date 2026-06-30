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
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-premium relative overflow-hidden text-slate-800 dark:text-zinc-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

          {/* Invoice Header */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-2xl flex items-center justify-center shadow-inner overflow-hidden">
                {invoiceCompany.logo && invoiceCompany.logo.startsWith('data:image') ? (
                  <img src={invoiceCompany.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  invoiceCompany.logo || '🏢'
                )}
              </div>
              <h4 className="font-bold text-sm mt-3 text-slate-800 dark:text-zinc-200">
                {invoiceCompany.name}
              </h4>
              <p className="text-[10px] text-slate-450 dark:text-zinc-500 font-medium leading-relaxed max-w-[180px] mt-1">
                {invoiceCompany.address}
              </p>
              {invoiceCompany.rccm && (
                <p className="text-[8px] text-slate-400 dark:text-zinc-550 font-bold mt-1">
                  RCCM: {invoiceCompany.rccm} • NIF: {invoiceCompany.nif}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">FACTURE</span>
              <div className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-350 mt-1">
                {invoice.invoiceNumber}
              </div>
              <div className="text-[9px] text-slate-450 dark:text-zinc-500 font-semibold mt-3">
                Date émission : {invoice.issueDate}
              </div>
              <div className="text-[9px] text-rose-650 dark:text-rose-400 font-semibold mt-1">
                Date échéance : {invoice.dueDate}
              </div>
            </div>
          </div>

          {/* Billing info */}
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100 dark:border-zinc-850/60 text-xs">
            <div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider block mb-1">Facturé à</span>
              <h5 className="font-bold text-slate-800 dark:text-zinc-200">{invoice.clientName}</h5>
              <p className="text-[10px] text-slate-500 dark:text-zinc-450 mt-0.5">{invoice.clientEmail}</p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider block mb-1">Informations de Paiement</span>
              <div className="font-semibold text-slate-700 dark:text-zinc-350">{invoice.paymentMethod || 'Non spécifié'}</div>
              <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1">
                Les règlements s'effectuent en {invoiceCompany.currency}. Tout retard entraîne des pénalités légales.
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-850/60 pb-1.5">
              <div className="col-span-7">Désignation / Prestation</div>
              <div className="col-span-1 text-center">Qté</div>
              <div className="col-span-4 text-right">Total HT ({invoiceCompany.currency})</div>
            </div>

            <div className="divide-y divide-slate-100/50 dark:divide-zinc-850/40">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map(item => (
                  <div key={item.id} className="grid grid-cols-12 py-3 text-xs">
                    <div className="col-span-7">
                      <div className="font-bold text-slate-700 dark:text-zinc-300">
                        {item.description}
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-zinc-555 font-medium">
                        P.U. : {formatFCFA(item.unitPrice, invoiceCompany.currency)}
                      </span>
                    </div>
                    <div className="col-span-1 text-center text-slate-650 dark:text-zinc-400 font-semibold">{item.quantity}</div>
                    <div className="col-span-4 text-right font-bold text-slate-700 dark:text-zinc-250">
                      {formatFCFA(item.quantity * item.unitPrice, invoiceCompany.currency)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-12 py-3 text-xs">
                  <div className="col-span-7 font-bold text-slate-700 dark:text-zinc-300">Prestation générale (Montant total)</div>
                  <div className="col-span-1 text-center text-slate-650 dark:text-zinc-400 font-semibold">1</div>
                  <div className="col-span-4 text-right font-bold text-slate-700 dark:text-zinc-250">
                    {formatFCFA(invoice.subtotal || invoice.amount, invoiceCompany.currency)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subtotal & Totals */}
          <div className="border-t border-slate-100 dark:border-zinc-850/60 pt-4 flex justify-end">
            <div className="w-56 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-zinc-450 font-medium">
                <span>Sous-Total HT :</span>
                <span className="font-semibold">
                  {formatFCFA(invoice.subtotal || (invoice.amount - (invoice.taxAmount || 0)), invoiceCompany.currency)}
                </span>
              </div>
              
              {invoice.discountAmount && invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Remise :</span>
                  <span>-{formatFCFA(invoice.discountAmount, invoiceCompany.currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 dark:text-zinc-450 font-medium">
                <span>TVA (18%) :</span>
                <span className="font-semibold">
                  {formatFCFA(invoice.taxAmount || 0, invoiceCompany.currency)}
                </span>
              </div>

              <div className="flex justify-between text-slate-900 dark:text-white font-black text-sm border-t border-slate-100 dark:border-zinc-850/60 pt-2">
                <span>Total TTC :</span>
                <span>{formatFCFA(invoice.amount, invoiceCompany.currency)}</span>
              </div>
            </div>
          </div>

          {/* Footer stamp */}
          <div className="flex justify-between items-end border-t border-slate-100 dark:border-zinc-850/60 pt-4 mt-6">
            <div>
              <div className="text-[8px] text-slate-400 dark:text-zinc-550 uppercase tracking-widest font-bold">IZIFACTURE PLATFORM</div>
              <div className="text-[9px] text-slate-500 dark:text-zinc-500 mt-1 font-semibold flex items-center gap-1">
                <Check size={10} className="text-emerald-500" /> Signée électroniquement
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider mb-1">
                Signature de l'Émetteur
              </div>
              <div className="font-signature text-xs font-semibold text-slate-700 dark:text-zinc-350 italic">
                {invoiceCompany.name}
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
