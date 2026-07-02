'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  Smartphone, 
  SmartphoneCharging, 
  Building2, 
  Banknote, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  Settings,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { mockTransactions, formatFCFA, Transaction } from '../lib/data';

interface WalletPageProps {
  currency: string;
  setActiveTab?: (tab: string) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  transactions?: Transaction[];
  onAddTransaction?: (tx: Transaction) => Promise<void>;
}

export default function WalletPage({ currency = 'GNF', setActiveTab, showToast, transactions = [], onAddTransaction }: WalletPageProps) {
  // Mobile money connection toggles states
  const [omActive, setOmActive] = useState(true);
  const [mtnActive, setMtnActive] = useState(true);

  // States for Modals
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Form states
  const [amount, setAmount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<'Orange Money' | 'MTN Money' | 'Virement' | 'Espèces'>('Orange Money');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Calcul dynamique des soldes basés sur les transactions
  const getDynamicBalance = (method: 'Orange Money' | 'MTN Money' | 'Virement' | 'Espèces', initialBalance: number) => {
    return (transactions || []).reduce((balance, tx) => {
      if (tx.status !== 'completed' || tx.method !== method) return balance;
      if (tx.type === 'credit') {
        return balance + tx.amount;
      } else if (tx.type === 'debit') {
        return balance - tx.amount;
      }
      return balance;
    }, initialBalance);
  };

  const orangeMoneyBalance = getDynamicBalance('Orange Money', 0);
  const mtnMoneyBalance = getDynamicBalance('MTN Money', 0);
  const bankBalance = getDynamicBalance('Virement', 0);
  const cashBalance = getDynamicBalance('Espèces', 0);

  // Balances
  const channels = [
    {
      name: 'Orange Money Côte d\'Ivoire/Guinée',
      type: 'mobile',
      method: 'Orange Money' as const,
      number: '+224 622 34 56 78',
      balance: orangeMoneyBalance,
      active: omActive,
      setActive: setOmActive,
      logo: '🍊',
      color: 'from-orange-500 to-amber-600',
      borderClass: 'border-orange-200 dark:border-orange-900/40',
      bgClass: 'bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400'
    },
    {
      name: 'MTN Mobile Money (MoMo)',
      type: 'mobile',
      method: 'MTN Money' as const,
      number: '+224 664 12 89 00',
      balance: mtnMoneyBalance,
      active: mtnActive,
      setActive: setMtnActive,
      logo: '💛',
      color: 'from-amber-400 to-yellow-500',
      borderClass: 'border-yellow-200 dark:border-yellow-900/40',
      bgClass: 'bg-yellow-50/50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400'
    },
    {
      name: 'Virement bancaire (SG)',
      type: 'bank',
      method: 'Virement' as const,
      number: 'GN092 01002 00392819283 92',
      balance: bankBalance,
      active: true,
      logo: '🏦',
      color: 'from-blue-600 to-indigo-700',
      borderClass: 'border-blue-200 dark:border-blue-900/40',
      bgClass: 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Petite Caisse (Espèces)',
      type: 'cash',
      method: 'Espèces' as const,
      number: 'Coffre-fort Bureau',
      balance: cashBalance,
      active: true,
      logo: '💵',
      color: 'from-emerald-500 to-teal-600',
      borderClass: 'border-emerald-200 dark:border-emerald-900/40',
      bgClass: 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
    }
  ];

  const totalBalance = channels.reduce((sum, channel) => sum + channel.balance, 0);

  const [showMobileConfig, setShowMobileConfig] = useState(false);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMessage("Le montant doit être supérieur à 0.");
      return;
    }
    
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleDateString('fr-FR'),
      description: description.trim() || 'Dépôt de fonds',
      type: 'credit',
      method: selectedMethod,
      amount: amount,
      status: 'completed'
    };

    if (onAddTransaction) {
      await onAddTransaction(newTx);
    }
    
    setShowDepositModal(false);
    setAmount(0);
    setDescription('');
    setErrorMessage('');
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMessage("Le montant doit être supérieur à 0.");
      return;
    }
    
    let currentBalance = 0;
    if (selectedMethod === 'Orange Money') currentBalance = orangeMoneyBalance;
    else if (selectedMethod === 'MTN Money') currentBalance = mtnMoneyBalance;
    else if (selectedMethod === 'Virement') currentBalance = bankBalance;
    else if (selectedMethod === 'Espèces') currentBalance = cashBalance;

    if (amount > currentBalance) {
      setErrorMessage(`Solde insuffisant sur ce canal. Solde maximum disponible : ${formatFCFA(currentBalance, currency)}.`);
      return;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleDateString('fr-FR'),
      description: description.trim() || 'Retrait de fonds',
      type: 'debit',
      method: selectedMethod,
      amount: amount,
      status: 'completed'
    };

    if (onAddTransaction) {
      await onAddTransaction(newTx);
    }

    setShowWithdrawModal(false);
    setAmount(0);
    setDescription('');
    setErrorMessage('');
  };

  const handleConfigureWebhooks = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMobileConfig(true);
  };

  const handleViewDocs = (e: React.MouseEvent) => {
    e.preventDefault();
    if (showToast) {
      showToast("Redirection vers la documentation développeur de l'API en cours...", "info");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="pb-4 border-b border-slate-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
            Trésorerie globale
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Mon Portefeuille & Comptes
          </h1>
          <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
            Gérez vos liquidités, vos comptes bancaires et vos passerelles Mobile Money.
          </p>
        </div>
      </div>

      {/* Hero Total Balance Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wallet size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
              Total des fonds disponibles
            </div>
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {formatFCFA(totalBalance, currency)}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowUpRight size={16} /> Retirer
          </button>
          <button 
            onClick={() => setShowDepositModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <ArrowDownLeft size={16} /> Ajouter des fonds
          </button>
        </div>
      </div>

      {/* Grid of Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {channels.map((channel, idx) => (
          <div 
            key={idx}
            className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-850 shadow-soft overflow-hidden hover:-translate-y-1 transition-all duration-300 group`}
          >
            {/* Top color bar */}
            <div className={`h-1.5 bg-gradient-to-r ${channel.color}`} />
            
            <div className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl ${channel.bgClass} flex items-center justify-center text-xl border ${channel.borderClass}`}>
                  {channel.logo}
                </div>
                {channel.setActive && (
                  <button 
                    onClick={() => {
                      channel.setActive(!channel.active);
                      if (showToast) {
                        showToast(`Le canal ${channel.name} a été ${!channel.active ? 'activé' : 'désactivé'}.`, "success");
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {channel.active ? (
                      <ToggleRight size={24} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={24} className="text-slate-400" />
                    )}
                  </button>
                )}
              </div>

              <div className="mb-6 flex-1">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">
                  {channel.name}
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-zinc-500 font-medium mt-1">
                  {channel.number}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest block mb-1">
                    Solde actuel
                  </span>
                  <div className="text-lg font-mono font-black text-slate-800 dark:text-zinc-100">
                    {formatFCFA(channel.balance, currency)}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 dark:text-zinc-450 pt-3 border-t border-slate-100 dark:border-zinc-800/60">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-emerald-500" /> Sécurisé
                  </span>
                  {channel.type === 'mobile' && channel.active ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 animate-pulse">
                      <Zap size={10} /> Connecté
                    </span>
                  ) : channel.type === 'mobile' && !channel.active ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      Hors ligne
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API Configuration Help Panel */}
      <div className="bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-900/50 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-soft flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute right-0 top-0 opacity-5 dark:opacity-[0.02] pointer-events-none">
          <SmartphoneCharging size={200} className="-mr-10 -mt-10" />
        </div>

        <div className="p-4 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner shrink-0 relative z-10">
          <SmartphoneCharging size={28} />
        </div>
        
        <div className="space-y-3 flex-1 relative z-10">
          <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 tracking-tight">
            Encaissement Mobile Money automatisé
          </h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-3xl font-medium">
            Vos clients peuvent payer vos factures instantanément en scannant le QR code généré sur leur facture ou via un lien de paiement direct Orange Money ou MTN Mobile Money. Le statut de votre facture passe à <strong className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">Payée</strong> en temps réel dès confirmation du réseau.
          </p>
          
          <div className="pt-3 flex flex-wrap gap-4">
            <button 
              onClick={handleConfigureWebhooks}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Settings size={14} />
              Configurer les webhooks
            </button>
            <button 
              onClick={handleViewDocs}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <ExternalLink size={14} />
              Voir la documentation API
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Configuration Mobile Money */}
      {showMobileConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-premium border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Settings size={20} className="text-blue-600" /> Configuration Mobile Money
              </h2>
              <button 
                onClick={() => setShowMobileConfig(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-xl text-xs flex gap-3 items-start">
                  <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                  <p>Vos clés d'API et tokens sont chiffrés de bout en bout. Izi-Facture ne stocke aucune information bancaire sensible.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                    URL du Webhook (Notification de paiement)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value="https://api.izi-facture.com/v1/webhooks/momo" 
                      className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-600 dark:text-zinc-400"
                    />
                    <button className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 transition-colors">
                      Copier
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                    Clé Secrète API (Production)
                  </label>
                  <input 
                    type="password" 
                    placeholder="sk_live_..................." 
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowMobileConfig(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  if (showToast) showToast("Configuration Mobile Money enregistrée avec succès !", "success");
                  setShowMobileConfig(false);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Sauvegarder les clés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de fonds (Dépôt) */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleDepositSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-premium border border-slate-100 dark:border-zinc-800 flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <ArrowDownLeft size={20} className="text-emerald-500" /> Ajouter des fonds
              </h2>
              <button 
                type="button"
                onClick={() => {
                  setShowDepositModal(false);
                  setErrorMessage('');
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-semibold">
                  {errorMessage}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">Méthode</label>
                <select 
                  value={selectedMethod} 
                  onChange={(e) => setSelectedMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN Money">MTN Money</option>
                  <option value="Virement">Virement bancaire</option>
                  <option value="Espèces">Espèces</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">Montant ({currency})</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Ex: 500000"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">Description (Optionnel)</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Approvisionnement caisse"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => {
                  setShowDepositModal(false);
                  setErrorMessage('');
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Confirmer le dépôt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Retrait */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleWithdrawSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-premium border border-slate-100 dark:border-zinc-800 flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <ArrowUpRight size={20} className="text-rose-500" /> Retirer des fonds
              </h2>
              <button 
                type="button"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setErrorMessage('');
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-semibold">
                  {errorMessage}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">Méthode / Canal</label>
                <select 
                  value={selectedMethod} 
                  onChange={(e) => setSelectedMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN Money">MTN Money</option>
                  <option value="Virement">Virement bancaire</option>
                  <option value="Espèces">Espèces</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">Montant ({currency})</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Ex: 100000"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">Motif du retrait (Optionnel)</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Frais de déplacement"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setErrorMessage('');
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Confirmer le retrait
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
