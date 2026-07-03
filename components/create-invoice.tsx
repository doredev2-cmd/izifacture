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
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showPreview ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-800'
              }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                showPreview ? 'translate-x-4' : 'translate-x-0'
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
                className={`py-2 rounded-lg text-center transition-all ${
                  invoiceType === 'standard' 
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold' 
                    : 'text-slate-500 dark:text-zinc-450'
                }`}
              >
                Standard
              </button>
              <button 
                type="button"
                onClick={() => setInvoiceType('split')}
                className={`py-2 rounded-lg text-center transition-all ${
                  invoiceType === 'split' 
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold' 
                    : 'text-slate-500 dark:text-zinc-450'
                }`}
              >
                Divisée (Split)
              </button>
              <button 
                type="button"
                onClick={() => setInvoiceType('recurring')}
                className={`py-2 rounded-lg text-center transition-all ${
                  invoiceType === 'recurring' 
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
            <div 
              className="bg-white rounded-none border border-slate-200 shadow-premium w-full relative overflow-hidden flex flex-col justify-between mx-auto" 
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
                    <h1 className="text-5xl font-black text-[#1e2a47] tracking-wider mb-8">INVOICE</h1>
                    <div className="text-sm font-bold text-[#1e2a47] mb-1">Invoice to:</div>
                    <div className="font-black text-base text-[#1e2a47] uppercase">{activeCliObj?.name || 'NAME SURNAME'}</div>
                    <div className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                      {activeCliObj?.address || 'Adresse du client non renseignée'}
                    </div>
                  </div>
                  
                  <div className="w-1/2 flex flex-col items-end pt-4">
                    {/* Logo */}
                    {activeCompObj.logo && activeCompObj.logo.startsWith('data:image') ? (
                      <img src={activeCompObj.logo} alt="Logo" className="max-h-16 object-contain mb-3" />
                    ) : (
                      <div className="flex gap-1.5 mb-5 mr-3">
                         <div className="w-6 h-6 bg-[#1e2a47] transform rotate-45"></div>
                         <div className="w-6 h-6 bg-yellow-500 transform rotate-45"></div>
                         <div className="w-6 h-6 bg-[#1e2a47] transform rotate-45"></div>
                      </div>
                    )}
                    <div className="text-xl font-black text-[#1e2a47] tracking-widest uppercase text-right">{activeCompObj.name || 'YOUR LOGO'}</div>
                    <div className="text-[9px] font-semibold text-slate-500 tracking-[0.2em] uppercase mt-1">SLOGAN / RCCM: {activeCompObj.rccm || '-'}</div>

                    <div className="mt-14 flex flex-col gap-1.5 w-56 text-sm">
                      <div className="flex justify-between font-bold text-[#1e2a47]">
                        <span>Invoice #</span>
                        <span>{invoiceNumber || '#1234'}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#1e2a47]">
                        <span>Date</span>
                        <span>{issueDate ? new Date(issueDate).toLocaleDateString('en-GB') : '10/10/2024'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="w-full mb-8">
                  <div className="flex bg-[#1e2a47] text-white text-[11px] font-bold py-2.5 px-4 uppercase tracking-wider">
                    <div className="w-[10%] text-center">No.</div>
                    <div className="w-[45%]">Service Description</div>
                    <div className="w-[15%] text-center">Price</div>
                    <div className="w-[10%] text-center">Qty.</div>
                    <div className="w-[20%] text-right">Total</div>
                  </div>
                  
                  <div className="border-b-2 border-[#1e2a47] mb-6">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex text-xs py-4 px-4 border-b border-slate-200 text-[#1e2a47] font-semibold items-center">
                        <div className="w-[10%] text-center text-slate-500">{index + 1}</div>
                        <div className="w-[45%] font-bold">{item.description || 'Description de la prestation'}</div>
                        <div className="w-[15%] text-center text-slate-600">{formatFCFA(item.unitPrice, currency)}</div>
                        <div className="w-[10%] text-center text-slate-600">{item.quantity}</div>
                        <div className="w-[20%] text-right">{formatFCFA(item.quantity * item.unitPrice, currency)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer section (Totals and Terms) */}
                <div className="flex justify-between mt-auto mb-4">
                  {/* Terms & Info */}
                  <div className="w-[50%] text-[10px] text-[#1e2a47]">
                    <div className="mb-5">
                      <div className="font-bold mb-1 text-xs">Terms and Conditions</div>
                      <div className="text-slate-500 leading-relaxed pr-6">
                        Les règlements s'effectuent en {currency}. Tout retard de paiement entraîne des pénalités selon la réglementation en vigueur. Merci de votre confiance.
                      </div>
                    </div>
                    <div className="mb-5">
                      <div className="font-bold mb-1 text-xs">Questions:</div>
                      <div className="flex flex-col gap-1 text-slate-500 font-medium">
                        <div className="flex"><span className="w-16">Email us:</span> <span>{activeCompObj.email || 'contact@votreentreprise.com'}</span></div>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold mb-1 text-xs">Payment Info:</div>
                      <div className="flex flex-col gap-1 text-slate-500 font-medium">
                        <div className="flex"><span className="w-20">Method:</span> <span>{paymentMethod}</span></div>
                        <div className="flex"><span className="w-20">Currency:</span> <span>{currency}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Totals & Signature */}
                  <div className="w-[45%] flex flex-col items-end">
                    <div className="w-full text-sm font-bold text-[#1e2a47] flex flex-col gap-2.5 mb-4 pr-4 pl-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal</span>
                        <span>{formatFCFA(getSubtotal(), currency)}</span>
                      </div>
                      {addDiscount && (
                         <div className="flex justify-between text-emerald-600">
                           <span>Discount (-{discountPercent}%)</span>
                           <span>-{formatFCFA(getDiscountAmount(), currency)}</span>
                         </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tax Rate (18%)</span>
                        <span>{formatFCFA(getTaxAmount(), currency)}</span>
                      </div>
                    </div>
                    <div className="w-full flex justify-between items-center bg-[#1e2a47] text-white text-sm font-bold py-3 px-4 mb-10">
                      <span>TOTAL</span>
                      <span>{formatFCFA(getTotalTTC(), currency)}</span>
                    </div>

                    {/* Dynamic Split / Recurring info inside preview */}
                    {invoiceType === 'split' && (
                      <div className="w-full mb-6 pr-4 pl-4 text-xs font-bold text-blue-600 text-right">
                        Paiement en {splitPaymentsCount} échéances de {formatFCFA(Math.round(getTotalTTC() / splitPaymentsCount), currency)}
                      </div>
                    )}

                    {/* Signature */}
                    <div className="w-48 text-center mt-auto pb-4">
                      <div className="h-20 flex items-end justify-center">
                        <div className="font-signature text-2xl text-[#1e2a47] opacity-80 -rotate-3">
                          {activeCompObj.name}
                        </div>
                      </div>
                      <div className="border-t border-[#1e2a47] pt-1.5 text-[10px] text-[#1e2a47] font-bold uppercase tracking-wider">
                        Authorised Sign
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dark blue footer block */}
              <div className="bg-[#1e2a47] h-14 w-full flex items-center justify-center gap-10 text-[10px] text-white font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[#1e2a47] font-bold text-xs">f</div>
                  <span>@{activeCompObj.name.replace(/\s+/g, '').toLowerCase() || 'username'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[#1e2a47] font-bold text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </div>
                  <span>@{activeCompObj.name.replace(/\s+/g, '').toLowerCase() || 'username'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[#1e2a47] font-bold text-xs">ig</div>
                  <span>@{activeCompObj.name.replace(/\s+/g, '').toLowerCase() || 'username'}</span>
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
