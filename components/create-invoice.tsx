'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  Download,
  Mail,
  ArrowLeft,
  Check,
  FileText,
  DollarSign,
  Calendar,
  Building,
  User,
  Percent,
  FileCheck,
  MessageCircle,
  Send
} from 'lucide-react';
import { Client, Invoice, InvoiceItem, Company, mockCompanies, formatFCFA, printInvoice } from '../lib/data';

interface CreateInvoiceProps {
  companies: Company[];
  clients: Client[];
  activeCompany: Company;
  invoiceToEdit?: Invoice | null;
  onSave: (invoice: Invoice) => Promise<boolean> | void | any;
  onCancel: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function CreateInvoice({
  companies,
  clients,
  activeCompany,
  invoiceToEdit = null,
  onSave,
  onCancel,
  showToast
}: CreateInvoiceProps) {
  const [invoiceType, setInvoiceType] = useState<'standard' | 'split' | 'recurring'>('standard');
  const [splitPaymentsCount, setSplitPaymentsCount] = useState<number>(2);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<string>('monthly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>(clients[0]?.id || '');
  const [selectedCompany, setSelectedCompany] = useState<string>(activeCompany.id);
  const [issueDate, setIssueDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [currency, setCurrency] = useState<string>(activeCompany.currency);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [addDiscount, setAddDiscount] = useState<boolean>(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('Virement bancaire');
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [sendMethod, setSendMethod] = useState<'email' | 'whatsapp' | null>(null);
  const [sendContact, setSendContact] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync selectedCompany when activeCompany changes
  useEffect(() => {
    if (activeCompany && activeCompany.id) {
      setSelectedCompany(activeCompany.id);
    }
  }, [activeCompany]);

  // Merge activeCompany into companies if not already present
  const allCompanies = [...companies];
  if (activeCompany && activeCompany.id && !allCompanies.some(c => c.id === activeCompany.id)) {
    allCompanies.push(activeCompany);
  }

  // Initialize form
  useEffect(() => {
    // Current date in YYYY-MM-DD
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    // Default due date (30 days from now)
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    const formattedDue = thirtyDaysLater.toISOString().split('T')[0];

    if (invoiceToEdit) {
      setInvoiceType('standard');
      const client = clients.find(c => c.name === invoiceToEdit.clientName || c.email === invoiceToEdit.clientEmail);
      if (client) setSelectedClient(client.id);

      // Parse dates from DD/MM/YYYY to YYYY-MM-DD
      const parseDate = (dStr: string) => {
        const parts = dStr.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return formattedToday;
      };

      setIssueDate(parseDate(invoiceToEdit.issueDate));
      setDueDate(parseDate(invoiceToEdit.dueDate));
      setInvoiceNumber(invoiceToEdit.invoiceNumber);
      setItems(invoiceToEdit.items || []);
      if (invoiceToEdit.discountAmount && invoiceToEdit.discountAmount > 0) {
        setAddDiscount(true);
        // Estimate discount percent
        const rawSubtotal = invoiceToEdit.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const percent = Math.round((invoiceToEdit.discountAmount / rawSubtotal) * 100);
        setDiscountPercent(percent);
      }
      setPaymentMethod(invoiceToEdit.paymentMethod || 'Virement bancaire');
    } else {
      setIssueDate(formattedToday);
      setDueDate(formattedDue);

      // Generate standard invoice number (random for mock)
      const randomNum = Math.floor(100 + Math.random() * 900);
      setInvoiceNumber(`#INV-2026-${randomNum}`);

      // Default item line
      setItems([
        { id: 'item-new-1', description: 'Prestation de services digitaux', quantity: 1, unitPrice: 1500000, taxPercent: 18 }
      ]);
    }
  }, [invoiceToEdit, clients]);

  // Handle company change updates currency
  useEffect(() => {
    const comp = allCompanies.find(c => c.id === selectedCompany);
    if (comp) {
      setCurrency(comp.currency);
    }
  }, [selectedCompany, companies, activeCompany]);

  // Ensure selectedClient is set if empty but clients list is loaded
  useEffect(() => {
    if (!selectedClient && clients.length > 0) {
      setSelectedClient(clients[0].id);
    }
  }, [clients, selectedClient]);

  const handleAddItem = () => {
    const newId = `item-new-${Date.now()}`;
    setItems([
      ...items,
      { id: newId, description: '', quantity: 1, unitPrice: 0, taxPercent: 18 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Calculations
  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const getDiscountAmount = () => {
    if (!addDiscount) return 0;
    return Math.round((getSubtotal() * discountPercent) / 100);
  };

  const getTaxAmount = () => {
    const base = getSubtotal() - getDiscountAmount();
    // Assuming 18% standard VAT
    return Math.round(base * 0.18);
  };

  const getTotalTTC = () => {
    return getSubtotal() - getDiscountAmount() + getTaxAmount();
  };

  const handleSave = async (status: 'draft' | 'sent') => {
    let client = clients.find(c => c.id === selectedClient);
    if (!client && clients.length > 0) {
      client = clients[0];
    }
    if (!client) {
      alert("Veuillez d'abord sélectionner ou ajouter un client.");
      return false;
    }

    // Format dates back to DD/MM/YYYY
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    };

    const newInvoice: Invoice = {
      id: invoiceToEdit?.id || `inv-new-${Date.now()}`,
      companyId: selectedCompany || activeCompany.id,
      invoiceNumber: invoiceNumber,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      issueDate: formatDate(issueDate),
      dueDate: formatDate(dueDate),
      items: items,
      subtotal: getSubtotal(),
      taxAmount: getTaxAmount(),
      discountAmount: getDiscountAmount(),
      amount: getTotalTTC(),
      status: status,
      paymentMethod: paymentMethod
    };

    setIsSaving(true);
    try {
      const result = await onSave(newInvoice);
      setIsSaving(false);
      return result !== false;
    } catch (error) {
      setIsSaving(false);
      return false;
    }
  };

  const activeCompObj = allCompanies.find(c => c.id === selectedCompany) || activeCompany;
  const activeCliObj = clients.find(c => c.id === selectedClient);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-widest flex items-center gap-1.5">
              <span>Facturation</span>
              <span>/</span>
              <span>{invoiceToEdit ? 'Modifier la Facture' : 'Créer une Facture'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {invoiceToEdit ? `Modifier la facture ${invoiceToEdit.invoiceNumber}` : 'Nouvelle Facture'}
            </h1>
            <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
              Créez une facture et transmettez-la instantanément à votre client.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Show Preview switch */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200/65 dark:border-zinc-800 text-xs font-semibold">
            <span className="text-slate-600 dark:text-zinc-400">Aperçu en direct</span>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showPreview ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-800'
                }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${showPreview ? 'translate-x-4' : 'translate-x-0'
                }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on the left, Live Preview on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Form Container */}
        <div className={`${showPreview ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>

          {/* Invoice Type selection */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-zinc-950/40 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInvoiceType('standard')}
                className={`py-2 rounded-lg text-center transition-all ${invoiceType === 'standard'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 dark:text-zinc-450'
                  }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setInvoiceType('split')}
                className={`py-2 rounded-lg text-center transition-all ${invoiceType === 'split'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 dark:text-zinc-450'
                  }`}
              >
                Divisée (Split)
              </button>
              <button
                type="button"
                onClick={() => setInvoiceType('recurring')}
                className={`py-2 rounded-lg text-center transition-all ${invoiceType === 'recurring'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 dark:text-zinc-450'
                  }`}
              >
                Récurrente
              </button>
            </div>

            {/* Split Parameters */}
            {invoiceType === 'split' && (
              <div className="mt-4 p-3.5 rounded-xl bg-blue-50/20 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 space-y-3 animate-in fade-in duration-200">
                <h4 className="text-[11px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-wider">
                  Configuration Échelonnement
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Nombre d'échéances
                    </label>
                    <select
                      value={splitPaymentsCount}
                      onChange={(e) => setSplitPaymentsCount(parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="2">2 versements (50% / 50%)</option>
                      <option value="3">3 versements (33% / 33% / 34%)</option>
                      <option value="4">4 versements (25% chacun)</option>
                    </select>
                  </div>
                  <div className="flex items-center text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                    Le montant total de la facture sera divisé équitablement entre chaque versement dans le récapitulatif.
                  </div>
                </div>
              </div>
            )}

            {/* Recurring Parameters */}
            {invoiceType === 'recurring' && (
              <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/20 space-y-3 animate-in fade-in duration-200">
                <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-455 uppercase tracking-wider">
                  Configuration Récurrence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Fréquence
                    </label>
                    <select
                      value={recurrenceFrequency}
                      onChange={(e) => setRecurrenceFrequency(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="monthly">Mensuelle (Tous les mois)</option>
                      <option value="quarterly">Trimestrielle (Tous les 3 mois)</option>
                      <option value="yearly">Annuelle (Tous les ans)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Date de fin (Optionnel)
                    </label>
                    <input
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Information Form */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-850/60 pb-3">
              <FileCheck size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
                Informations Facture
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Billed To / Client selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <User size={10} /> Destinataire (Client) *
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                >
                  {clients.map(cli => (
                    <option key={cli.id} value={cli.id}>{cli.name} ({cli.email})</option>
                  ))}
                </select>
              </div>

              {/* Billed From / Company selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Building size={10} /> Émis par (Entreprise) *
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                >
                  {allCompanies.map(comp => {
                    const logoToShow = (comp.logo && !comp.logo.startsWith('data:') && !comp.logo.startsWith('http') && comp.logo.length < 5) ? comp.logo : '🏢';
                    return (
                      <option key={comp.id} value={comp.id}>{logoToShow} {comp.name}</option>
                    );
                  })}
                </select>
              </div>

              {/* Issue Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={10} /> Date d'Émission *
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={10} /> Date d'Échéance *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>

              {/* Invoice Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Numéro de Facture
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="#INV-2026-000"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>

              {/* Mode de règlement */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Moyen de paiement favori
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                >
                  <option value="Virement bancaire">Virement bancaire</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Espèces / Caisse">Espèces / Caisse</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoice Items Section */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
                  Prestations & Lignes de Facture
                </h3>
              </div>

              <div className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                Devise : {currency}
              </div>
            </div>

            {/* Dynamic Lines */}
            <div className="space-y-4">
              {items.map((item, index) => {
                const lineTotal = item.quantity * item.unitPrice;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 relative space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-650 uppercase tracking-wider">
                        Ligne {index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-rose-600 hover:text-rose-700 dark:text-rose-400 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer la ligne"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                      {/* Description */}
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">Description de la prestation</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="ex: Design de logo..."
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none transition-all"
                        />
                      </div>

                      {/* Qty */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">Quantité</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none transition-all"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">Prix Unitaire ({currency})</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Auto calculations label */}
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 dark:border-zinc-800/60 text-slate-500 dark:text-zinc-400">
                      <span>TVA : 18% (standard)</span>
                      <span className="font-bold text-slate-700 dark:text-zinc-300">
                        Total HT : {formatFCFA(lineTotal, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Item Button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-450 dark:border-zinc-700 dark:hover:border-zinc-500 bg-slate-50/40 dark:bg-zinc-900/10 text-xs font-bold text-slate-600 dark:text-zinc-450 hover:text-slate-800 dark:hover:text-zinc-300 transition-all cursor-pointer"
            >
              <Plus size={15} />
              Ajouter une prestation
            </button>

            {/* Discount Option */}
            <div className="pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addDiscount}
                  onChange={(e) => setAddDiscount(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Appliquer une remise (Réduction globale)
                </span>
              </label>

              {addDiscount && (
                <div className="flex items-center gap-2 mt-3 p-3 rounded-lg border border-blue-100 dark:border-blue-900/20 bg-blue-50/20 dark:bg-blue-950/10 animate-in fade-in duration-200">
                  <Percent size={15} className="text-blue-500" />
                  <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Pourcentage de remise :</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-1 text-xs rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-bold focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions bottom */}
          <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-2xl">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-zinc-450 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>
            <div className="flex gap-2">
              <button
                disabled={isSaving}
                onClick={() => handleSave('draft')}
                className="px-4 py-2.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving && <div className="w-3.5 h-3.5 border-2 border-slate-400 dark:border-zinc-500 border-t-transparent rounded-full animate-spin" />}
                Enregistrer
              </button>
              <button
                disabled={isSaving || isSending}
                onClick={() => setShowSendModal(true)}
                className="px-4 py-2.5 text-xs font-bold bg-blue-600 dark:bg-blue-650 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} /> Générer & Transmettre
              </button>
            </div>
          </div>

        </div>

        {/* Live Preview Column */}
        {showPreview && (
          <div className="lg:col-span-5 space-y-4 sticky top-6">

            {/* Toolbar for preview actions */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-850 shadow-soft">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Aperçu Facture</span>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
                >
                  <Mail size={12} /> Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const client = clients.find(c => c.id === selectedClient);
                    const formatDate = (dateStr: string) => {
                      if (!dateStr) return '';
                      const parts = dateStr.split('-');
                      if (parts.length === 3) {
                        return `${parts[2]}/${parts[1]}/${parts[0]}`;
                      }
                      return dateStr;
                    };
                    const previewInvoice: Invoice = {
                      id: invoiceToEdit?.id || `inv-new-${Date.now()}`,
                      companyId: activeCompany.id,
                      invoiceNumber: invoiceNumber,
                      clientId: client?.id || '',
                      clientName: client?.name || '',
                      clientEmail: client?.email || '',
                      issueDate: formatDate(issueDate),
                      dueDate: formatDate(dueDate),
                      items: items,
                      subtotal: getSubtotal(),
                      taxAmount: getTaxAmount(),
                      discountAmount: getDiscountAmount(),
                      amount: getTotalTTC(),
                      status: 'draft',
                      paymentMethod: paymentMethod
                    };
                    printInvoice(previewInvoice, activeCompObj);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
                >
                  <Download size={12} /> PDF
                </button>
              </div>
            </div>

            {/* A4 Paper mockup invoice container (New Professional Design) */}
            {/* A4 Paper mockup invoice container (Classic Clean Design with Blue/Black accents) */}
            <div
              className="bg-white rounded-none shadow-premium w-full relative overflow-hidden flex flex-col justify-between mx-auto text-slate-800"
              style={{ minHeight: '842px', backgroundColor: 'white', padding: '40px 48px' }}
            >

              <div className="flex-1 flex flex-col">
                {/* Top Header Section */}
                <div className="flex justify-between items-start mb-12">
                  {/* Left: Company Info */}
                  <div className="flex flex-col gap-1.5">
                    {/* Logo */}
                    {activeCompObj.logo && activeCompObj.logo.startsWith('data:image') ? (
                      <img src={activeCompObj.logo} alt="Logo" className="max-h-16 object-contain mb-4" />
                    ) : (
                      <div className="w-12 h-12 mb-4 bg-[#1e2a47] rounded-xl flex items-center justify-center text-yellow-400 font-black text-2xl shadow-md">
                        {activeCompObj.name.charAt(0)}
                      </div>
                    )}
                    <h2 className="text-xl font-black text-[#0f172a]">{activeCompObj.name || 'VOTRE LOGO'}</h2>
                    <p className="text-sm text-slate-600 font-medium">{activeCompObj.address || 'Adresse de l\'entreprise'}</p>
                    <p className="text-[11px] text-slate-500 font-medium">RCCM : {activeCompObj.rccm || '-'} • NIF : {activeCompObj.nif || '-'}</p>
                  </div>

                  {/* Right: Invoice Info */}
                  <div className="flex flex-col items-end text-right">
                    <h1 className="text-4xl font-black text-blue-600 tracking-wider mb-2 uppercase">FACTURE</h1>
                    <p className="text-lg font-bold text-[#0f172a] mb-6">{invoiceNumber || '#INV-1234'}</p>
                    <div className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                      <div className="flex justify-end gap-2">
                        <span>Date d'émission :</span>
                        <span className="font-bold text-[#0f172a]">{issueDate || '10/10/2024'}</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <span>Date d'échéance :</span>
                        <span className="font-bold text-rose-600">{dueDate || '25/10/2024'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client & Payment Info Box */}
                <div className="w-full border border-blue-100 bg-blue-50/30 rounded-2xl p-6 mb-10 grid grid-cols-2 gap-8 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">FACTURÉ À</h3>
                    <div className="font-black text-base text-[#0f172a]">{activeCliObj?.name || 'NOM PRÉNOM'}</div>
                    <div className="text-sm text-slate-600 font-medium">
                      {activeCliObj?.email || 'Adresse email du client'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 border-l border-blue-100/50 pl-8">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MODE DE PAIEMENT</h3>
                    <div className="font-bold text-sm text-[#0f172a]">{paymentMethod || 'Virement bancaire'}</div>
                    <div className="text-sm text-slate-600 font-medium">Règlement en {currency}</div>
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
                    {items.map((item, index) => (
                      <div key={item.id} className="flex py-5 border-b border-slate-100 last:border-0 items-start">
                        <div className="w-[60%] flex flex-col gap-1.5 pr-4">
                          <span className="font-bold text-sm text-[#0f172a] leading-snug">{item.description || 'Description de la prestation'}</span>
                          <span className="text-xs text-slate-500 font-medium">P.U. : {formatFCFA(item.unitPrice, currency)}</span>
                        </div>
                        <div className="w-[15%] text-center font-bold text-sm text-[#0f172a] pt-1">{item.quantity}</div>
                        <div className="w-[25%] text-right font-bold text-sm text-[#0f172a] pt-1">{formatFCFA(item.quantity * item.unitPrice, currency)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-16">
                  <div className="w-[45%] border border-blue-100 bg-blue-50/20 rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                      <span>Sous-Total HT :</span>
                      <span className="font-bold text-[#0f172a]">{formatFCFA(getSubtotal(), currency)}</span>
                    </div>
                    {getDiscountAmount() > 0 && (
                      <div className="flex justify-between items-center text-sm font-medium text-emerald-600">
                        <span>Remise :</span>
                        <span className="font-bold">-{formatFCFA(getDiscountAmount(), currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600 pb-3 border-b border-blue-100">
                      <span>TVA (18%) :</span>
                      <span className="font-bold text-[#0f172a]">{formatFCFA(getTaxAmount(), currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-black text-[#1e2a47]">
                      <span>Total TTC :</span>
                      <span>{formatFCFA(getTotalTTC(), currency)}</span>
                    </div>

                    {/* Dynamic Split / Recurring info inside preview */}
                    {invoiceType === 'split' && (
                      <div className="mt-2 text-[11px] font-bold text-blue-600 text-right">
                        Paiement en {splitPaymentsCount} échéances de {formatFCFA(Math.round(getTotalTTC() / splitPaymentsCount), currency)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer / Signatures */}
                <div className="mt-auto flex justify-between items-end border-t border-slate-200 pt-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">{activeCompObj.name}</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <Check size={14} strokeWidth={3} /> Document signé électroniquement
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SIGNATURE DE L'ÉMETTEUR</span>
                    <span className="font-signature text-2xl text-[#1e2a47] opacity-90">{activeCompObj.name}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal de Transmission (WhatsApp / Email) */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-premium border border-slate-100 dark:border-zinc-800 flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-2">
                <Send size={24} />
              </div>
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                Transmettre la facture
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Comment souhaitez-vous envoyer cette facture à <strong>{activeCliObj?.name || 'votre client'}</strong> ?
              </p>
            </div>

            <div className="p-5 space-y-3 bg-slate-50/50 dark:bg-zinc-900/50">
              {sendSuccess ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Check size={32} strokeWidth={3} className="animate-in zoom-in duration-500 delay-150" />
                  </div>
                  <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">Facture envoyée avec succès</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 text-center">La facture a été transmise à {activeCliObj?.name}</p>
                </div>
              ) : isSending ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-zinc-800 border-t-blue-600 animate-spin"></div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">Envoi en cours...</p>
                </div>
              ) : sendMethod ? (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {sendMethod === 'whatsapp' ? 'Numéro WhatsApp' : 'Adresse Email'}
                    </label>
                    <input
                      type={sendMethod === 'whatsapp' ? 'tel' : 'email'}
                      value={sendContact}
                      onChange={(e) => setSendContact(e.target.value)}
                      placeholder={sendMethod === 'whatsapp' ? '+225 00 00 00 00 00' : 'client@email.com'}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSendMethod(null)}
                      className="flex-1 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      Retour
                    </button>
                    <button
                      disabled={isSending || !sendContact}
                      onClick={async () => {
                        setIsSending(true);
                        const success = await handleSave('sent');
                        if (success) {
                          setSendSuccess(true);
                          setTimeout(() => {
                            setSendSuccess(false);
                            setShowSendModal(false);
                            setSendMethod(null);
                            setIsSending(false);
                            if (showToast) {
                              showToast(`Facture transmise avec succès à ${activeCliObj?.name}.`, 'success');
                            }
                          }, 2000);
                        } else {
                          setIsSending(false);
                          setShowSendModal(false);
                          setSendMethod(null);
                        }
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <Send size={14} /> Envoyer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSendMethod('whatsapp');
                      setSendContact(activeCliObj?.phone || '');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle size={18} />
                    Envoyer via WhatsApp
                  </button>

                  <button
                    onClick={() => {
                      setSendMethod('email');
                      setSendContact(activeCliObj?.email || '');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Mail size={18} />
                    Envoyer par Email
                  </button>

                  <button
                    onClick={() => setShowSendModal(false)}
                    className="w-full mt-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
