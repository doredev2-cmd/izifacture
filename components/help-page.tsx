'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Mail, 
  Send, 
  MessageSquare, 
  BookOpen, 
  PhoneCall, 
  ChevronDown,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

interface HelpPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function HelpPage({ showToast }: HelpPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Form states
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('billing');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const faqs = [
    {
      q: "Comment créer une facture sur Izi-Facture ?",
      a: "Allez sur l'onglet 'Factures' ou cliquez sur 'Créer une Facture' dans le tableau de bord. Remplissez ensuite le destinataire (client), la date d'échéance, et ajoutez vos prestations avec leurs prix unitaires. Vous pouvez ensuite soit sauvegarder comme Brouillon, soit Générer & Envoyer la facture pour qu'elle passe au statut Envoyée."
    },
    {
      q: "Comment fonctionne l'encaissement direct via Mobile Money ?",
      a: "Dans la page 'Portefeuille' ou 'Paramètres', configurez vos identifiants d'API Orange Money et MTN MoMo et activez-les. Izi-Facture générera automatiquement un QR code de paiement sur vos factures. Lorsque le client effectue le règlement, l'API envoie une notification instantanée et la facture passe automatiquement au statut 'Payée' en temps réel."
    },
    {
      q: "Comment ajouter, éditer ou supprimer un client ?",
      a: "Accédez à la page 'Clients' via la barre latérale. Vous y trouverez un bouton 'Nouveau Client' pour enregistrer une fiche. Sur chaque fiche client, des boutons d'édition (crayon) et de suppression (poubelle) vous permettent de mettre à jour ou retirer des clients en temps réel."
    },
    {
      q: "Puis-je exporter mes factures ou mes rapports de TVA ?",
      a: "Oui, vous pouvez exporter chaque facture individuellement au format PDF en cliquant sur le bouton de téléchargement 'PDF' sur la page de détail de la facture. Les rapports fiscaux et chiffres d'affaires sont calculés en direct dans l'onglet 'Rapports' pour vous aider à remplir vos déclarations fiscales mensuelles."
    },
    {
      q: "Comment gérer plusieurs entreprises en même temps ?",
      a: "Cliquez sur le sélecteur d'entreprise actif situé tout en haut de votre barre latérale (Sidebar). Un menu déroulant s'ouvre, vous permettant de basculer instantanément entre vos structures (ex: Creatinf Agency, Cansaas Group, Sahel Tech). L'ensemble des factures, clients et devises s'adaptent instantanément."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEmail || !supportMessage) {
      showToast("Veuillez remplir l'e-mail et le message.", 'error');
      return;
    }
    
    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      showToast("Votre message a bien été envoyé au support. Nous vous répondrons dans les plus brefs délais !", 'success');
      setSupportEmail('');
      setSupportMessage('');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="pb-4 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
          Support utilisateur
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Aide & Centre de Support
        </h1>
        <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
          Consultez les guides d'utilisation, posez vos questions à la communauté ou contactez notre équipe technique.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* FAQ Area (Left) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* FAQ Search bar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 dark:text-zinc-500" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une réponse dans la FAQ (ex: Mobile Money, facture...)"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Accordion Questions List */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-850/60 pb-3">
              <HelpCircle size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
                Questions Fréquentes (FAQ)
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-850/60">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="py-3.5">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-450 transition-colors py-1 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown 
                        size={16} 
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180 text-blue-600' : ''}`} 
                      />
                    </button>
                    
                    {openFaqIndex === idx && (
                      <p className="text-xs text-slate-550 dark:text-zinc-400 mt-2 leading-relaxed bg-slate-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-slate-100/50 dark:border-zinc-850/40 animate-in fade-in duration-200">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-550">
                  Aucun résultat ne correspond à votre recherche.
                </div>
              )}
            </div>
          </div>

          {/* Quick link support cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Documentation */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft hover:-translate-y-0.5 transition-all duration-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 flex items-center justify-center">
                <BookOpen size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Guide Utilisateur</h4>
              <p className="text-[10px] text-slate-450 dark:text-zinc-500 font-medium">Tutoriels pas-à-pas pour maîtriser l'interface.</p>
              <a href="#" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-block pt-1 uppercase tracking-wider">Lire les guides</a>
            </div>

            {/* API Ref */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft hover:-translate-y-0.5 transition-all duration-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileSpreadsheet size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Référence API</h4>
              <p className="text-[10px] text-slate-450 dark:text-zinc-500 font-medium">Intégrez la facturation et MoMo dans vos apps.</p>
              <a href="#" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-block pt-1 uppercase tracking-wider">Voir l'API</a>
            </div>

            {/* Téléphone */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft hover:-translate-y-0.5 transition-all duration-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PhoneCall size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Support Téléphonique</h4>
              <p className="text-[10px] text-slate-450 dark:text-zinc-500 font-medium">Assistance VIP pour les comptes abonnés.</p>
              <a href="#" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-block pt-1 uppercase tracking-wider">Nous appeler</a>
            </div>

          </div>

        </div>

        {/* Contact Support Form (Right) */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-850/60 pb-3 mb-4">
            <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
              Contacter l'Équipe
            </h3>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <p className="text-[11px] text-slate-450 dark:text-zinc-550 leading-relaxed font-medium">
              Une anomalie ? Un problème de configuration ? Envoyez un ticket de support direct à nos ingénieurs.
            </p>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Votre Adresse E-mail *</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="ex: jean.momo@gmail.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Sujet / Thématique</label>
              <select
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-850 dark:text-zinc-250 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="billing">Question sur la facturation</option>
                <option value="api">Problème d'API Orange Money / MTN</option>
                <option value="bug">Signaler un bug technique</option>
                <option value="other">Autre demande</option>
              </select>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Description de votre demande *</label>
              <textarea
                required
                rows={5}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Décrivez précisément votre problème ou question..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-850 dark:text-zinc-250 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={isSending}
              className={`w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 dark:bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer ${
                isSending ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Envoyer ma demande</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
