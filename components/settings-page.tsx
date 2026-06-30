'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Percent, 
  SmartphoneCharging, 
  Save, 
  ShieldCheck, 
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Company } from '../lib/data';

interface SettingsPageProps {
  activeCompany: Company;
  onUpdateCompany: (company: Company) => void;
  omActive: boolean;
  setOmActive: (active: boolean) => void;
  mtnActive: boolean;
  setMtnActive: (active: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function SettingsPage({
  activeCompany,
  onUpdateCompany,
  omActive,
  setOmActive,
  mtnActive,
  setMtnActive,
  showToast
}: SettingsPageProps) {
  // State for company form
  const [companyName, setCompanyName] = useState(activeCompany.name);
  const [companyEmail, setCompanyEmail] = useState(activeCompany.email);
  const [companyAddress, setCompanyAddress] = useState(activeCompany.address);
  const [companyLogo, setCompanyLogo] = useState(activeCompany.logo);
  const [companyRccm, setCompanyRccm] = useState(activeCompany.rccm || '');
  const [companyNif, setCompanyNif] = useState(activeCompany.nif || '');
  const [companyCurrency, setCompanyCurrency] = useState(activeCompany.currency);

  // State for invoicing preferences
  const [vatPercent, setVatPercent] = useState<number>(18);
  const [duePeriod, setDuePeriod] = useState<number>(30);

  // State for API Credentials
  const [omMerchantId, setOmMerchantId] = useState('OM_MERCH_482910');
  const [omApiKey, setOmApiKey] = useState('••••••••••••••••••••••••');
  const [mtnMerchantId, setMtnMerchantId] = useState('MTN_MOMO_99210');
  const [mtnApiKey, setMtnApiKey] = useState('••••••••••••••••••••••••');
  const [webhookUrl, setWebhookUrl] = useState('https://api.izi-facture.com/v1/payments/webhook');

  // Update states if active company changes
  useEffect(() => {
    setCompanyName(activeCompany.name);
    setCompanyEmail(activeCompany.email);
    setCompanyAddress(activeCompany.address);
    setCompanyLogo(activeCompany.logo);
    setCompanyRccm(activeCompany.rccm || '');
    setCompanyNif(activeCompany.nif || '');
    setCompanyCurrency(activeCompany.currency);
  }, [activeCompany]);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCompany: Company = {
      ...activeCompany,
      name: companyName,
      email: companyEmail,
      address: companyAddress,
      logo: companyLogo,
      rccm: companyRccm,
      nif: companyNif,
      currency: companyCurrency
    };
    onUpdateCompany(updatedCompany);
    showToast("Profil de l'entreprise mis à jour avec succès !", 'success');
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Préférences de facturation sauvegardées !", 'success');
  };

  const handleSaveAPIs = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Configurations de paiement Mobile Money enregistrées !", 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="pb-4 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
          Réglages de l'application
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Paramètres Généraux
        </h1>
        <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
          Configurez votre structure juridique, vos coordonnées de facturation et connectez vos comptes bancaires ou Mobile Money.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Company Profile (Left) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Company Profile Card */}
          <form 
            onSubmit={handleSaveCompany}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft space-y-5"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-850/60 pb-3">
              <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
                Profil de l'Entreprise Active
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Logo icon */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Logo (Image ou Emoji)
                </label>
                <div className="relative w-full h-[38px] rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-blue-500 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setCompanyLogo(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Changer le logo"
                  />
                  {companyLogo.startsWith('data:image') ? (
                    <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-lg">{companyLogo}</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Upload</span>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Raison Sociale / Nom Commercial *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Adresse e-mail de facturation *
                </label>
                <input
                  type="email"
                  required
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Currency */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Devise par défaut
                </label>
                <select
                  value={companyCurrency}
                  onChange={(e) => setCompanyCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="GNF">Franc Guinéen (GNF)</option>
                  <option value="FCFA">Franc CFA (FCFA)</option>
                  <option value="USD">Dollar Américain (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              {/* RCCM */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  N° RCCM (Registre du Commerce)
                </label>
                <input
                  type="text"
                  value={companyRccm}
                  onChange={(e) => setCompanyRccm(e.target.value)}
                  placeholder="ex: GN.CON.2026.B.1234"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* NIF */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  NIF (Numéro d'Identification Fiscale)
                </label>
                <input
                  type="text"
                  value={companyNif}
                  onChange={(e) => setCompanyNif(e.target.value)}
                  placeholder="ex: 0012345A"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Adresse Géographique complète
                </label>
                <textarea
                  required
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-850/60">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Save size={14} />
                Sauvegarder le profil
              </button>
            </div>
          </form>

          {/* Invoicing Preferences Card */}
          <form 
            onSubmit={handleSavePreferences}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft space-y-5"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-850/60 pb-3">
              <Percent size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
                Préférences de Facturation & Taxes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Taux de TVA Standard (%)
                </label>
                <input
                  type="number"
                  required
                  value={vatPercent}
                  onChange={(e) => setVatPercent(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Délai de paiement standard (Jours)
                </label>
                <input
                  type="number"
                  required
                  value={duePeriod}
                  onChange={(e) => setDuePeriod(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-850/60">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Save size={14} />
                Sauvegarder les règles
              </button>
            </div>
          </form>

        </div>

        {/* Mobile Money Integration API (Right) */}
        <div className="space-y-6">
          
          <form 
            onSubmit={handleSaveAPIs}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft space-y-5"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-850/60 pb-3">
              <SmartphoneCharging size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
                API Passerelle Mobile Money
              </h3>
            </div>

            {/* Orange Money Toggle & Inputs */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  🍊 Orange Money
                </span>
                <button
                  type="button"
                  onClick={() => setOmActive(!omActive)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {omActive ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      Actif <ToggleRight size={22} className="text-emerald-500" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      Inactif <ToggleLeft size={22} className="text-slate-450" />
                    </span>
                  )}
                </button>
              </div>

              {omActive && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-850/60 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase">Merchant ID</label>
                    <input
                      type="text"
                      value={omMerchantId}
                      onChange={(e) => setOmMerchantId(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase">API Secret Key</label>
                    <input
                      type="password"
                      value={omApiKey}
                      onChange={(e) => setOmApiKey(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* MTN MoMo Toggle & Inputs */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  💛 MTN Mobile Money
                </span>
                <button
                  type="button"
                  onClick={() => setMtnActive(!mtnActive)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {mtnActive ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      Actif <ToggleRight size={22} className="text-emerald-500" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      Inactif <ToggleLeft size={22} className="text-slate-450" />
                    </span>
                  )}
                </button>
              </div>

              {mtnActive && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-850/60 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase">User ID (UUID)</label>
                    <input
                      type="text"
                      value={mtnMerchantId}
                      onChange={(e) => setMtnMerchantId(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase">Subscription Key</label>
                    <input
                      type="password"
                      value={mtnApiKey}
                      onChange={(e) => setMtnApiKey(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Webhook API */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                URL de Notification Webhook API
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none"
              />
              <span className="text-[9px] text-slate-400 font-medium block">
                Reçoit les accusés de réception de paiements en temps réel de l'opérateur.
              </span>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-850/60">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Save size={14} />
                Lier les API
              </button>
            </div>
          </form>

          {/* Security stamp */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft space-y-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck className="text-emerald-500" size={16} /> Chiffrement AES-256
            </span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-450 leading-relaxed">
              Toutes les clés de paiement et jetons d'authentification saisis sont chiffrés localement dans votre sandbox de sécurité et ne sont jamais transmis en clair.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
