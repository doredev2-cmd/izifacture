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
        {/* Real Invoice Sheet (Printable A4 preview style - New Professional Design) */}
        <div 
          className="lg:col-span-2 bg-white rounded-none border border-slate-200 shadow-premium w-full relative overflow-hidden flex flex-col justify-between" 
          style={{ minHeight: '842px', backgroundColor: 'white' }}
        >
          
          {/* Top decorative elements */}
          <div className="absolute top-0 left-0 w-full h-32 overflow-hidden pointer-events-none">
            {/* Dots on top left */}
            <div className="absolute top-10 left-10 grid grid-cols-6 gap-2 opacity-50">
              {Array.from({length: 42}).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-yellow-500"></div>
              ))}
            </div>
            {/* Geometric shape in center-top */}
            <svg className="absolute top-0 left-[45%] -translate-x-1/2 w-48 h-32 text-yellow-500" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="1.5">
               <path d="M10,0 L50,40 L90,0" />
               <path d="M25,0 L50,25 L75,0" />
               <path d="M40,0 L50,10 L60,0" />
            </svg>
          </div>

          <div className="px-10 pt-16 flex-1 flex flex-col">
            {/* Header: INVOICE and LOGO */}
            <div className="flex justify-between items-start mb-10 z-10">
              <div className="w-1/2 pt-16">
                <h1 className="text-5xl font-black text-[#1e2a47] tracking-wider mb-8">FACTURE</h1>
                <div className="text-sm font-bold text-[#1e2a47] mb-1">Facturé à :</div>
                <div className="font-black text-base text-[#1e2a47] uppercase">{invoice.clientName || 'NOM PRÉNOM'}</div>
                <div className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                  {invoice.clientEmail || 'Adresse du client non renseignée'}
                </div>
              </div>
              
              <div className="w-1/2 flex flex-col items-end pt-4">
                {/* Logo */}
                {invoiceCompany.logo && invoiceCompany.logo.startsWith('data:image') ? (
                  <img src={invoiceCompany.logo} alt="Logo" className="max-h-16 object-contain mb-3" />
                ) : (
                  <div className="flex gap-1.5 mb-5 mr-3">
                     <div className="w-6 h-6 bg-[#1e2a47] transform rotate-45"></div>
                     <div className="w-6 h-6 bg-yellow-500 transform rotate-45"></div>
                     <div className="w-6 h-6 bg-[#1e2a47] transform rotate-45"></div>
                  </div>
                )}
                <div className="text-xl font-black text-[#1e2a47] tracking-widest uppercase text-right">{invoiceCompany.name || 'VOTRE LOGO'}</div>
                <div className="text-[9px] font-semibold text-slate-500 tracking-[0.2em] uppercase mt-1">SLOGAN / RCCM: {invoiceCompany.rccm || '-'}</div>

                <div className="mt-14 flex flex-col gap-1.5 w-56 text-sm">
                  <div className="flex justify-between font-bold text-[#1e2a47]">
                    <span>N° Facture</span>
                    <span>{invoice.invoiceNumber || '#1234'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1e2a47]">
                    <span>Date</span>
                    <span>{invoice.issueDate ? invoice.issueDate : '10/10/2024'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="w-full mb-8">
              <div className="flex bg-[#1e2a47] text-white text-[11px] font-bold py-2.5 px-4 uppercase tracking-wider">
                <div className="w-[10%] text-center">N°</div>
                <div className="w-[45%]">Désignation / Prestation</div>
                <div className="w-[15%] text-center">Prix</div>
                <div className="w-[10%] text-center">Qté</div>
                <div className="w-[20%] text-right">Total</div>
              </div>
              
              <div className="border-b-2 border-[#1e2a47] mb-6">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <div key={item.id} className="flex text-xs py-4 px-4 border-b border-slate-200 text-[#1e2a47] font-semibold items-center">
                      <div className="w-[10%] text-center text-slate-500">{index + 1}</div>
                      <div className="w-[45%] font-bold">{item.description || 'Description de la prestation'}</div>
                      <div className="w-[15%] text-center text-slate-600">{formatFCFA(item.unitPrice, invoiceCompany.currency)}</div>
                      <div className="w-[10%] text-center text-slate-600">{item.quantity}</div>
                      <div className="w-[20%] text-right">{formatFCFA(item.quantity * item.unitPrice, invoiceCompany.currency)}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex text-xs py-4 px-4 border-b border-slate-200 text-[#1e2a47] font-semibold items-center">
                    <div className="w-[10%] text-center text-slate-500">1</div>
                    <div className="w-[45%] font-bold">Prestation générale</div>
                    <div className="w-[15%] text-center text-slate-600">-</div>
                    <div className="w-[10%] text-center text-slate-600">1</div>
                    <div className="w-[20%] text-right">{formatFCFA(invoice.subtotal || invoice.amount, invoiceCompany.currency)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer section (Totals and Terms) */}
            <div className="flex justify-between mt-auto mb-4">
              {/* Terms & Info */}
              <div className="w-[50%] text-[10px] text-[#1e2a47]">
                <div className="mb-5">
                  <div className="font-bold mb-1 text-xs">Conditions Générales</div>
                  <div className="text-slate-500 leading-relaxed pr-6">
                    Les règlements s'effectuent en {invoiceCompany.currency}. Tout retard de paiement entraîne des pénalités selon la réglementation en vigueur. Merci de votre confiance.
                  </div>
                </div>
                <div className="mb-5">
                  <div className="font-bold mb-1 text-xs">Questions :</div>
                  <div className="flex flex-col gap-1 text-slate-500 font-medium">
                    <div className="flex"><span className="w-16">Email :</span> <span>{invoiceCompany.email || 'contact@votreentreprise.com'}</span></div>
                  </div>
                </div>
                <div>
                  <div className="font-bold mb-1 text-xs">Informations de paiement :</div>
                  <div className="flex flex-col gap-1 text-slate-500 font-medium">
                    <div className="flex"><span className="w-20">Méthode :</span> <span>{invoice.paymentMethod || 'Virement bancaire'}</span></div>
                    <div className="flex"><span className="w-20">Devise :</span> <span>{invoiceCompany.currency}</span></div>
                  </div>
                </div>
              </div>

              {/* Totals & Signature */}
              <div className="w-[45%] flex flex-col items-end">
                <div className="w-full text-sm font-bold text-[#1e2a47] flex flex-col gap-2.5 mb-4 pr-4 pl-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sous-total</span>
                    <span>{formatFCFA(invoice.subtotal || (invoice.amount - (invoice.taxAmount || 0)), invoiceCompany.currency)}</span>
                  </div>
                  {invoice.discountAmount && invoice.discountAmount > 0 && (
                     <div className="flex justify-between text-emerald-600">
                       <span>Remise</span>
                       <span>-{formatFCFA(invoice.discountAmount, invoiceCompany.currency)}</span>
                     </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">TVA (18%)</span>
                    <span>{formatFCFA(invoice.taxAmount || 0, invoiceCompany.currency)}</span>
                  </div>
                </div>
                <div className="w-full flex justify-between items-center bg-[#1e2a47] text-white text-sm font-bold py-3 px-4 mb-10">
                  <span>TOTAL</span>
                  <span>{formatFCFA(invoice.amount, invoiceCompany.currency)}</span>
                </div>

                {/* Signature */}
                <div className="w-48 text-center mt-auto pb-4">
                  <div className="h-20 flex items-end justify-center">
                    <div className="font-signature text-2xl text-[#1e2a47] opacity-80 -rotate-3">
                      {invoiceCompany.name}
                    </div>
                  </div>
                  <div className="border-t border-[#1e2a47] pt-1.5 text-[10px] text-[#1e2a47] font-bold uppercase tracking-wider">
                    Signature de l'Émetteur
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dark blue footer block */}
          <div className="bg-[#1e2a47] h-14 w-full flex items-center justify-center gap-8 text-[10px] text-white font-medium">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[#1e2a47] font-bold text-xs">fb</div>
              <span>@{invoiceCompany.name.replace(/\s+/g, '').toLowerCase() || 'utilisateur'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[#1e2a47] font-bold text-xs">yt</div>
              <span>@{invoiceCompany.name.replace(/\s+/g, '').toLowerCase() || 'utilisateur'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[#1e2a47] font-bold text-xs">ig</div>
              <span>@{invoiceCompany.name.replace(/\s+/g, '').toLowerCase() || 'utilisateur'}</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[#1e2a47] font-bold text-xs">@</div>
              <span>{invoiceCompany.email || 'contact@votreentreprise.com'}</span>
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
