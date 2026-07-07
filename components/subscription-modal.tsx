'use client';

import React, { useState } from 'react';
import { X, Check, CreditCard, Smartphone, ShieldCheck, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_FEATURES } from '../lib/subscription';
import { formatFCFA } from '../lib/data';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  initialPlan?: 'Pro' | 'Business';
  onSuccess?: () => void;
  showToast: (msg: string, type: 'success'|'error'|'info') => void;
}

export default function SubscriptionModal({ isOpen, onClose, userId, userEmail, initialPlan, onSuccess, showToast }: SubscriptionModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'Pro' | 'Business'>(initialPlan || 'Pro');
  const [step, setStep] = useState<1 | 2>(1); // 1: Choose plan, 2: Checkout
  
  // Checkout states
  const [paymentMethod, setPaymentMethod] = useState<'Orange Money' | 'MTN Mobile Money' | 'Carte Bancaire (Afrique)'>('Orange Money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync initialPlan when it changes
  React.useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  if (!isOpen) return null;

  const getPrice = (plan: 'Pro' | 'Business', cycle: 'monthly' | 'quarterly' | 'annual') => {
    return SUBSCRIPTION_PLANS[plan][cycle];
  };

  const handleProceedToCheckout = () => {
    setStep(2);
  };

  const simulatePayment = async () => {
    // Validation du numéro de téléphone
    const cleanedNumber = phoneNumber.replace(/\s+/g, '');
    if (!/^\d{9}$/.test(cleanedNumber)) {
      showToast("Le numéro doit contenir exactement 9 chiffres.", "error");
      return;
    }

    if (paymentMethod === 'Orange Money' && !/^(62|61)/.test(cleanedNumber)) {
      showToast("Un numéro Orange Money doit commencer par 62 ou 61.", "error");
      return;
    }

    if (paymentMethod === 'MTN Mobile Money' && !/^66/.test(cleanedNumber)) {
      showToast("Un numéro MTN Mobile Money doit commencer par 66.", "error");
      return;
    }
    
    setIsProcessing(true);
    
    // Simuler le délai d'une vraie API (USSD Push, puis Webhook)
    setTimeout(async () => {
      try {
        // En production, cette requête serait faite par l'agrégateur (CinetPay etc.) vers notre Webhook.
        // Ici, nous appelons notre propre webhook pour simuler la réussite du paiement.
        const res = await fetch('/api/webhooks/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: `SIM_TX_${Date.now()}`,
            user_id: userId,
            status: 'success',
            amount: getPrice(selectedPlan, billingCycle),
            currency: 'GNF',
            method: paymentMethod,
            plan_name: selectedPlan,
            duration: billingCycle
          })
        });

        if (res.ok) {
          showToast(`Paiement de ${formatFCFA(getPrice(selectedPlan, billingCycle))} réussi via ${paymentMethod} !`, "success");
          setIsProcessing(false);
          if (onSuccess) onSuccess();
          onClose();
        } else {
          showToast("Erreur lors de la validation du paiement.", "error");
          setIsProcessing(false);
        }
      } catch (err) {
        showToast("Erreur de connexion au serveur.", "error");
        setIsProcessing(false);
      }
    }, 3000); // 3 seconds simulation
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200/50 dark:border-zinc-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50 relative">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="text-blue-600" /> 
              {step === 1 ? 'Mettre à niveau votre compte' : 'Paiement Sécurisé'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {step === 1 ? 'Débloquez toutes les fonctionnalités premium de IziFacture' : `Finalisation de l'abonnement ${selectedPlan}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-zinc-950">
          {step === 1 ? (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              {/* Billing Cycle Toggle */}
              <div className="flex justify-center">
                <div className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl flex items-center gap-1 border border-slate-200/50 dark:border-zinc-800 shadow-inner">
                  {(['monthly', 'quarterly', 'annual'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        billingCycle === cycle 
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm border border-slate-200/50 dark:border-zinc-700' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      {cycle === 'monthly' ? 'Mensuel' : cycle === 'quarterly' ? 'Trimestriel' : 'Annuel'}
                      {cycle === 'annual' && <span className="ml-1.5 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[9px] rounded-md uppercase">-10%</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Pro Plan */}
                <div 
                  className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlan === 'Pro' 
                    ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 shadow-glow' 
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedPlan('Pro')}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pro</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Pour les freelances et TPE</p>
                    </div>
                    {selectedPlan === 'Pro' && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
                  </div>
                  <div className="mb-6">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{formatFCFA(getPrice('Pro', billingCycle))}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">/{billingCycle === 'monthly' ? 'mois' : billingCycle === 'quarterly' ? '3 mois' : 'an'}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {SUBSCRIPTION_FEATURES['Pro'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
                        <Check size={16} className="text-green-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Business Plan */}
                <div 
                  className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlan === 'Business' 
                    ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 shadow-glow' 
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedPlan('Business')}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                    Recommandé
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Business</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Pour les PME en croissance</p>
                    </div>
                    {selectedPlan === 'Business' && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
                  </div>
                  <div className="mb-6">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{formatFCFA(getPrice('Business', billingCycle))}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">/{billingCycle === 'monthly' ? 'mois' : billingCycle === 'quarterly' ? '3 mois' : 'an'}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {SUBSCRIPTION_FEATURES['Business'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
                        <Check size={16} className="text-green-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={handleProceedToCheckout}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  Continuer avec {selectedPlan} <CreditCard size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4">
              <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white mb-4 inline-flex items-center gap-1">
                ← Retour aux plans
              </button>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Smartphone className="text-slate-400" /> Moyen de paiement
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {/* Orange Money */}
                  <div 
                    onClick={() => setPaymentMethod('Orange Money')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'Orange Money' ? 'border-[#ff7900] bg-orange-50/50 dark:bg-orange-950/20' : 'border-slate-100 dark:border-zinc-800 hover:border-[#ff7900]/50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-[#ff7900] rounded-lg flex items-center justify-center text-white font-black text-[10px]">OM</div>
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">Orange</span>
                  </div>

                  {/* MTN Mobile Money */}
                  <div 
                    onClick={() => setPaymentMethod('MTN Mobile Money')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'MTN Mobile Money' ? 'border-[#ffcc00] bg-yellow-50/50 dark:bg-yellow-950/20' : 'border-slate-100 dark:border-zinc-800 hover:border-[#ffcc00]/50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-[#ffcc00] rounded-lg flex items-center justify-center text-slate-900 font-black text-[10px]">MTN</div>
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">MTN</span>
                  </div>

                  {/* Carte Bancaire / Autres */}
                  <div 
                    onClick={() => setPaymentMethod('Carte Bancaire (Afrique)')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'Carte Bancaire (Afrique)' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20' : 'border-slate-100 dark:border-zinc-800 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-slate-800 dark:bg-slate-700 rounded-lg flex items-center justify-center text-white font-black text-[10px]"><CreditCard size={14}/></div>
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">Carte</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    {paymentMethod === 'Carte Bancaire (Afrique)' ? 'Numéro de Carte / Téléphone' : 'Numéro de téléphone payeur'}
                  </label>
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={paymentMethod === 'Carte Bancaire (Afrique)' ? "Numéro..." : "ex: 620000000"}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                    {paymentMethod === 'Carte Bancaire (Afrique)' ? 'Paiement sécurisé par carte ou méthode alternative.' : 'Un pop-up de validation s\'affichera sur votre téléphone.'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 mb-6">
                  <div className="flex justify-between items-center mb-2 text-sm text-slate-600 dark:text-zinc-400">
                    <span>Plan {selectedPlan} ({billingCycle === 'monthly' ? 'Mensuel' : billingCycle === 'quarterly' ? 'Trimestriel' : 'Annuel'})</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{formatFCFA(getPrice(selectedPlan, billingCycle))}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">Total à payer</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">{formatFCFA(getPrice(selectedPlan, billingCycle))}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-zinc-400">Marchand Receveur :</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-300">624 02 77 87</span>
                  </div>
                </div>

                <button 
                  onClick={simulatePayment}
                  disabled={isProcessing || !phoneNumber}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" size={18} /> Traitement en cours...</>
                  ) : (
                    <>Payer {formatFCFA(getPrice(selectedPlan, billingCycle))} maintenant</>
                  )}
                </button>
                <div className="text-center mt-4 text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                  <ShieldCheck size={12} /> Paiement 100% sécurisé via nos partenaires locaux
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
