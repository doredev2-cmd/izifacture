'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import StatsCards from '../components/stats-cards';
import InteractiveChart from '../components/interactive-chart';
import RecentInvoices from '../components/recent-invoices';

// Import our pages/components
import InvoicesPage from '../components/invoices-page';
import CreateInvoice from '../components/create-invoice';
import InvoiceDetail from '../components/invoice-detail';
import ClientsPage from '../components/clients-page';
import TransactionsPage from '../components/transactions-page';
import WalletPage from '../components/wallet-page';
import BudgetsPage from '../components/budgets-page';
import ReportsPage from '../components/reports-page';
import SettingsPage from '../components/settings-page';
import HelpPage from '../components/help-page';
import AdminDashboard from '../components/admin-dashboard';
import LandingPage from '../components/landing-page';

import { 
  Company, 
  Client, 
  Invoice, 
  Transaction,
  mockCompanies, 
  mockInvoices, 
  mockClients, 
  mockTransactions,
  formatFCFA 
} from '../lib/data';
import { supabase } from '../lib/supabase';
import { Calendar, Bell, Users, TrendingUp, Info, CheckCircle, AlertTriangle, X, Eye, EyeOff, Download } from 'lucide-react';

interface AppNotification {
  id: string;
  text: string;
  date: string;
  read: boolean;
  type: string;
}

export default function DashboardPage() {
  // App-wide state with localStorage check
  const defaultEmptyCompany: Company = { id: '', name: 'Veuillez ajouter une entreprise', email: '', logo: '🏢', currency: 'FCFA', address: '' };
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company>(defaultEmptyCompany);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [dashboardStartDate, setDashboardStartDate] = useState('');
  const [dashboardEndDate, setDashboardEndDate] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('client');

  // Authentication State
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Validate user with server to ensure they aren't deleted/blocked
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          await supabase.auth.signOut();
          setUser(null);
          setRole('client');
        } else {
          setUser({
            id: user.id,
            name: user.user_metadata?.name || 'Utilisateur',
            email: user.email || ''
          });
          
          // Admin email and metadata verification
          if (user.email === 'doredev2@gmail.com' || user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user.user_metadata?.role === 'admin') {
            setRole('admin');
          } else {
            setRole('client');
          }
        }
      }
      setIsAuthLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Utilisateur',
          email: session.user.email || ''
        });
        
        // Admin email verification
        if (session.user.email === 'doredev2@gmail.com' || session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || session.user.user_metadata?.role === 'admin') {
          setRole('admin');
        } else {
          setRole('client');
        }
      } else {
        setUser(null);
        setRole('client');
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      showToast("Veuillez entrer votre adresse email pour réinitialiser le mot de passe.", "error");
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes('rate limit')) {
        showToast("Trop de tentatives. Veuillez patienter 15 à 30 minutes avant de réessayer.", "error");
      } else {
        showToast(`Erreur : ${error.message}`, "error");
      }
    } else {
      showToast("Un lien de réinitialisation vous a été envoyé par email.", "success");
      setIsResetMode(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast("Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setIsSubmitting(false);
      showToast("Erreur Vercel : Variables d'environnement Supabase introuvables. Ajoutez-les dans le dashboard Vercel.", "error");
      return;
    }
    
    try {
      if (isLoginMode) {
        // Sign In
        // Vérification Rate Limiting (5 tentatives / 30 min)
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60000).toISOString();
        const { data: recentAttempts } = await supabase
          .from('login_attempts')
          .select('id, successful')
          .eq('email', loginEmail)
          .gte('attempt_time', thirtyMinsAgo)
          .order('attempt_time', { ascending: false });

        if (recentAttempts && recentAttempts.length >= 5) {
          const firstSuccessIndex = recentAttempts.findIndex((a: any) => a.successful);
          const failedCount = firstSuccessIndex === -1 ? recentAttempts.length : firstSuccessIndex;
          if (failedCount >= 5) {
            throw new Error('Vous avez dépassé le nombre maximal de tentatives de connexion. Pour votre sécurité, votre compte est temporairement verrouillé. Veuillez réessayer dans 30 minutes ou utiliser la fonction "Mot de passe oublié" si nécessaire.');
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword
        });
        
        // Enregistrement de la tentative
        await supabase.from('login_attempts').insert({
          email: loginEmail,
          successful: !error
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email ou mot de passe incorrect.');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Veuillez confirmer votre adresse email avant de vous connecter.');
          }
          throw error;
        }
        
        showToast(`Bienvenue de retour !`, "success");
      } else {
        // Sign Up
        if (!loginName) {
          throw new Error("Veuillez entrer votre nom complet.");
        }
        
        const { data, error } = await supabase.auth.signUp({
          email: loginEmail,
          password: loginPassword,
          options: {
            data: { name: loginName },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('Un compte existe déjà avec cette adresse email.');
          }
          if (error.message.includes('Password should be at least')) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
          }
          if (error.message.includes('rate limit')) {
            throw new Error('Trop de tentatives. Veuillez patienter 15 à 30 minutes avant de réessayer.');
          }
          throw error;
        }
        
        if (data.user && data.session === null) {
          showToast("Compte créé ! Vous devez confirmer votre email via le lien reçu avant de pouvoir vous connecter.", "info");
          setIsLoginMode(true);
          setLoginPassword('');
        } else {
          showToast("Compte créé avec succès !", "success");
        }
      }
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast("Vous avez été déconnecté.", "info");
  };

  const handleAddCompany = async (newCompany: Company) => {
    try {
      const companyWithUser = { ...newCompany, userId: user?.id };
      const { data: dbCompany, error } = await supabase.from('companies').insert([companyWithUser]).select().single();
      if (error) throw error;
      
      const finalCompany = { ...newCompany, ...dbCompany };
      setCompanies([...companies, finalCompany]);
      if (activeCompany.id === '') {
        setActiveCompany(finalCompany);
      }
      showToast(`Entreprise "${finalCompany.name}" créée avec succès.`, 'success');
    } catch (error: any) {
      console.error('Supabase insert error:', error);
      alert(`Erreur création entreprise détaillée : ${error.message || JSON.stringify(error)}`);
      showToast(`Erreur création entreprise: ${error.message}`, 'error');
    }
  };

  const handleEditCompany = async (updatedCompany: Company) => {
    try {
      const { data: dbCompany, error } = await supabase.from('companies').update(updatedCompany).eq('id', updatedCompany.id).select().single();
      if (error) throw error;
      
      const finalCompany = { ...updatedCompany, ...dbCompany };
      setCompanies(companies.map(c => c.id === finalCompany.id ? finalCompany : c));
      if (activeCompany.id === finalCompany.id) {
        setActiveCompany(finalCompany);
      }
      showToast(`Entreprise "${finalCompany.name}" mise à jour avec succès.`, 'success');
    } catch (error: any) {
      console.warn('Supabase update error:', error);
      showToast(`Erreur mise à jour entreprise: ${error.message}`, 'error');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (companies.length <= 1) {
      showToast("Impossible de supprimer la seule entreprise restante.", "error");
      return;
    }
    try {
      // Delete associated invoices first to respect foreign key constraints
      const { error: invError } = await supabase.from('invoices').delete().eq('companyId', id);
      if (invError) throw invError;

      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
      const filtered = companies.filter(c => c.id !== id);
      setCompanies(filtered);
      if (activeCompany.id === id) {
        setActiveCompany(filtered[0]);
      }
      showToast("Entreprise supprimée avec succès.", "info");
    } catch (error: any) {
      showToast(`Erreur de suppression : ${error.message}`, 'error');
    }
  };
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Mobile money toggles
  const [omActive, setOmActive] = useState(true);
  const [mtnActive, setMtnActive] = useState(true);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: '1', text: "Facture #INV-2026-001 payée via Orange Money (2 500 000 GNF)", date: "Il y a 2 heures", read: false, type: 'success' },
    { id: '2', text: "Nouveau client Sékou Condé créé avec succès", date: "Il y a 5 heures", read: false, type: 'info' },
    { id: '3', text: "Facture #INV-2026-003 en retard (Koffi Mensah - 8 000 000 FCFA)", date: "Hier", read: true, type: 'warning' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Helper for toasts
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Toast Auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Initialisation du Local Storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOm = localStorage.getItem('izi_om_active');
      const storedMtn = localStorage.getItem('izi_mtn_active');
      const storedNotifications = localStorage.getItem('izi_notifications');

      if (storedOm) setOmActive(JSON.parse(storedOm));
      if (storedMtn) setMtnActive(JSON.parse(storedMtn));
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    }

    // Date initialization
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const today = new Date();
    const formatted = today.toLocaleDateString('fr-FR', options);
    setCurrentDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  // Fetch Supabase data quand user / role est disponible
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const storedActiveCompanyId = typeof window !== 'undefined' ? localStorage.getItem('izi_active_company_id') : null;

        const promises = [];
        
        // Isolation des données (sauf pour admin)
        if (role !== 'admin') {
          promises.push(supabase.from('companies').select('*').eq('userId', user.id));
          promises.push(supabase.from('clients').select('*').eq('userId', user.id));
          promises.push(supabase.from('invoices').select('*').eq('userId', user.id));
          promises.push(supabase.from('transactions').select('*').eq('userId', user.id));
        } else {
          promises.push(supabase.from('companies').select('*'));
          promises.push(supabase.from('clients').select('*'));
          promises.push(supabase.from('invoices').select('*'));
          promises.push(supabase.from('transactions').select('*'));
        }

        const responses = await Promise.all(promises);
        
        const companiesData = responses[0]?.data;
        const clientsData = responses[1]?.data;
        const invoicesData = responses[2]?.data;
        const transactionsData = responses[3]?.data;

        if (responses[0]?.data && responses[0].data.length > 0) {
          const comps = responses[0].data;
          setCompanies(comps);
          // try to restore active from localstorage
          const savedActive = localStorage.getItem('izi_active_company_id');
          if (savedActive) {
            try {
              const parsed = JSON.parse(savedActive);
              const found = comps.find((c: any) => c.id === parsed);
              if (found) {
                setActiveCompany(found);
              } else {
                setActiveCompany(comps[0]);
              }
            } catch (e) {
              setActiveCompany(comps[0]);
            }
          } else {
            setActiveCompany(comps[0]);
          }
        } else if (user) {
          // Auto-create a default company if none exists
          const defaultCompanyId = `co-${Date.now()}`;
          const newCompany: Company = {
            id: defaultCompanyId,
            name: 'Mon Entreprise',
            email: user.email || '',
            currency: 'GNF',
            address: 'Adresse non définie',
            logo: '🏢'
          };
          const companyWithUser = { ...newCompany, userId: user.id };
          const { data: dbCompany, error: createErr } = await supabase.from('companies').insert([companyWithUser]).select().single();
          if (!createErr && dbCompany) {
            const finalCompany = { ...newCompany, ...dbCompany };
            setCompanies([finalCompany]);
            setActiveCompany(finalCompany);
          } else {
            setCompanies([]);
            setActiveCompany(defaultEmptyCompany);
          }
        } else {
          setCompanies([]);
          setActiveCompany(defaultEmptyCompany);
        }

        if (clientsData) setClients(clientsData);
        if (invoicesData) setInvoices(invoicesData);
        if (transactionsData) setTransactions(transactionsData);
        
      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id, role]);

  // Note: we removed localstorage syncing for database models (companies, invoices, clients, transactions)
  // because we will directly mutate Supabase, but we keep active company preference in local storage.
  useEffect(() => {
    if (typeof window !== 'undefined' && activeCompany?.id) {
      localStorage.setItem('izi_active_company_id', JSON.stringify(activeCompany.id));
    }
  }, [activeCompany?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('izi_om_active', JSON.stringify(omActive));
    }
  }, [omActive]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('izi_mtn_active', JSON.stringify(mtnActive));
    }
  }, [mtnActive]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('izi_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Sync active company from updated companies list
  const handleUpdateCompany = async (updatedCompany: Company) => {
    try {
      const companyWithUser = { ...updatedCompany, userId: user?.id };
      const { data: dbCompany, error } = await supabase.from('companies').upsert([companyWithUser]).select().single();
      if (error) throw error;
      const finalCompany = { ...updatedCompany, ...dbCompany };
      setActiveCompany(finalCompany);
      setCompanies(companies.map(c => c.id === finalCompany.id ? finalCompany : c));
    } catch (error: any) {
      showToast(`Erreur mise à jour entreprise : ${error.message}`, 'error');
    }
  };

  // Filter invoices based on active company
  const companyInvoices = invoices.filter(inv => {
    if (inv.companyId) {
      return inv.companyId === activeCompany.id;
    }
    if (activeCompany.id === 'co-1') {
      return inv.clientEmail.endsWith('.gn') || inv.invoiceNumber.includes('001') || inv.invoiceNumber.includes('004') || inv.invoiceNumber.includes('007');
    } else if (activeCompany.id === 'co-2') {
      return inv.clientEmail.endsWith('.ci') || inv.clientEmail.includes('cansaas') || inv.invoiceNumber.includes('002') || inv.invoiceNumber.includes('008');
    } else {
      return inv.clientEmail.endsWith('.ml') || inv.clientEmail.endsWith('.sn') || inv.clientEmail.endsWith('.cm');
    }
  });

  // Date parsing helper
  const parseDDMMYYYY = (str: string) => {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return null;
  };

  // Filter company invoices based on selected dashboard date range
  const filteredDashboardInvoices = companyInvoices.filter(inv => {
    const invDate = parseDDMMYYYY(inv.issueDate);
    if (!invDate) return true;
    
    if (dashboardStartDate) {
      const start = new Date(dashboardStartDate);
      start.setHours(0, 0, 0, 0);
      if (invDate < start) return false;
    }
    
    if (dashboardEndDate) {
      const end = new Date(dashboardEndDate);
      end.setHours(23, 59, 59, 999);
      if (invDate > end) return false;
    }
    
    return true;
  });

  // Calculate top clients based on filtered dashboard invoices
  const clientSummary = filteredDashboardInvoices.reduce((acc: { [key: string]: { name: string; email: string; totalPaid: number } }, inv) => {
    if (!acc[inv.clientName]) {
      acc[inv.clientName] = { name: inv.clientName, email: inv.clientEmail, totalPaid: 0 };
    }
    if (inv.status === 'paid') {
      acc[inv.clientName].totalPaid += inv.amount;
    }
    return acc;
  }, {});

  const topClients = Object.values(clientSummary)
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 4);

  // Handlers for Invoice management
  const handleSaveInvoice = async (savedInv: Invoice) => {
    const exists = invoices.some(inv => inv.id === savedInv.id);
    const oldInv = invoices.find(inv => inv.id === savedInv.id);
    try {
      const { data: dbInv, error } = await supabase.from('invoices').upsert({
        id: savedInv.id,
        userId: user?.id,
        companyId: savedInv.companyId || activeCompany.id,
        invoiceNumber: savedInv.invoiceNumber,
        clientId: savedInv.clientId,
        clientName: savedInv.clientName,
        clientEmail: savedInv.clientEmail,
        issueDate: savedInv.issueDate,
        dueDate: savedInv.dueDate,
        items: savedInv.items,
        subtotal: savedInv.subtotal,
        taxAmount: savedInv.taxAmount,
        discountAmount: savedInv.discountAmount || 0,
        amount: savedInv.amount,
        status: savedInv.status,
        paymentMethod: savedInv.paymentMethod
      }).select().single();
      if (error) throw error;
      
      const finalInv = { ...savedInv, ...dbInv };

      // Gérer la transaction liée
      if (savedInv.status === 'paid') {
        const isMethodOrange = savedInv.paymentMethod?.includes('Orange');
        const isMethodMTN = savedInv.paymentMethod?.includes('MTN');
        const finalMethod = (isMethodOrange ? 'Orange Money' : isMethodMTN ? 'MTN Money' : 'Virement') as any;

        if (!oldInv || oldInv.status !== 'paid') {
          // Créer une nouvelle transaction
          const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            userId: user?.id,
            date: new Date().toLocaleDateString('fr-FR'),
            description: `Encaissement Facture ${savedInv.invoiceNumber}`,
            type: 'credit',
            method: finalMethod,
            amount: savedInv.amount,
            status: 'completed',
            invoiceId: savedInv.id,
            invoiceNumber: savedInv.invoiceNumber
          };
          const { error: txErr } = await supabase.from('transactions').insert([newTx]);
          if (txErr) throw txErr;
          setTransactions(prev => [newTx, ...prev]);
        } else if (oldInv.status === 'paid' && (oldInv.amount !== savedInv.amount || oldInv.paymentMethod !== savedInv.paymentMethod)) {
          // Mettre à jour la transaction existante
          const { error: txErr } = await supabase.from('transactions').update({
            amount: savedInv.amount,
            method: finalMethod
          }).eq('invoiceId', savedInv.id);
          if (txErr) throw txErr;
          setTransactions(prev => prev.map(t => t.invoiceId === savedInv.id ? { ...t, amount: savedInv.amount, method: finalMethod } : t));
        }
      } else if (oldInv && oldInv.status === 'paid') {
        // Supprimer la transaction si la facture n'est plus payée
        const { error: txErr } = await supabase.from('transactions').delete().eq('invoiceId', savedInv.id);
        if (txErr) throw txErr;
        setTransactions(prev => prev.filter(t => t.invoiceId !== savedInv.id));
      }

      if (exists) {
        setInvoices(invoices.map(inv => inv.id === finalInv.id ? finalInv : inv));
        showToast(`✅ La facture ${finalInv.invoiceNumber} a été mise à jour et le portefeuille a été actualisé !`, 'success');
      } else {
        setInvoices([finalInv, ...invoices]);
        showToast(`✅ Excellente nouvelle ! La facture ${finalInv.invoiceNumber} a été générée et sauvegardée en toute sécurité.`, 'success');
        
        // Auto add notification
        const newNotif = {
          id: `notif-${Date.now()}`,
          text: `Nouvelle facture ${finalInv.invoiceNumber} générée pour ${finalInv.clientName}`,
          date: "À l'instant",
          read: false,
          type: 'info'
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
      setActiveTab('invoices');
      setSelectedInvoice(null);
      return true;
    } catch (error: any) {
      showToast(`❌ Échec de l'enregistrement en ligne. Détail : ${error.message}`, 'error');
      return false;
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      
      // La base de données gère la suppression en cascade via foreign key ON DELETE CASCADE.
      // Nous mettons simplement à jour l'état local pour être cohérent.
      setTransactions(prev => prev.filter(t => t.invoiceId !== id));
      
      const deletedInv = invoices.find(inv => inv.id === id);
      setInvoices(invoices.filter(inv => inv.id !== id));
      showToast(`Facture ${deletedInv?.invoiceNumber || ''} supprimée. Le portefeuille a été ajusté.`, 'info');
      setActiveTab('invoices');
      setSelectedInvoice(null);
    } catch (error: any) {
      showToast(`Erreur suppression facture : ${error.message}`, 'error');
    }
  };
  
  const handleAddTransaction = async (newTx: Transaction) => {
    try {
      const txWithUser = { ...newTx, userId: user?.id };
      const { data: dbTx, error } = await supabase.from('transactions').insert([txWithUser]).select().single();
      if (error) throw error;
      const finalTx = { ...newTx, ...dbTx };
      setTransactions(prev => [finalTx, ...prev]);
      
      // Log notification
      const newNotif = {
        id: `notif-${Date.now()}`,
        text: `${finalTx.description} (${formatFCFA(finalTx.amount, activeCompany.currency)}) via ${finalTx.method}`,
        date: "À l'instant",
        read: false,
        type: finalTx.type === 'credit' ? 'success' : 'info'
      };
      setNotifications(prev => [newNotif, ...prev]);
      
      if (newTx.type === 'credit') {
        showToast(`Dépôt de ${formatFCFA(newTx.amount, activeCompany.currency)} effectué avec succès !`, 'success');
      } else {
        showToast(`Retrait de ${formatFCFA(newTx.amount, activeCompany.currency)} effectué avec succès !`, 'success');
      }
    } catch (error: any) {
      showToast(`Erreur transaction : ${error.message}`, 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: Invoice['status']) => {
    try {
      const oldInv = invoices.find(inv => inv.id === id);
      if (!oldInv) return;

      const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', id);
      if (error) throw error;

      if (newStatus === 'paid' && oldInv.status !== 'paid') {
        // Enregistrer la transaction d'encaissement
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          userId: user?.id,
          date: new Date().toLocaleDateString('fr-FR'),
          description: `Encaissement Facture ${oldInv.invoiceNumber}`,
          type: 'credit',
          method: (oldInv.paymentMethod?.includes('Orange') ? 'Orange Money' : oldInv.paymentMethod?.includes('MTN') ? 'MTN Money' : 'Virement') as any,
          amount: oldInv.amount,
          status: 'completed',
          invoiceId: oldInv.id,
          invoiceNumber: oldInv.invoiceNumber
        };
        await handleAddTransaction(newTx);
      } else if (newStatus !== 'paid' && oldInv.status === 'paid') {
        // Supprimer la transaction si le statut passe de payé à autre chose
        const { error: txErr } = await supabase.from('transactions').delete().eq('invoiceId', id);
        if (txErr) throw txErr;
        setTransactions(prev => prev.filter(t => t.invoiceId !== id));
        showToast(`Statut de la facture ${oldInv.invoiceNumber} mis à jour : ${newStatus}. Le portefeuille a été actualisé.`, 'info');
      } else {
        showToast(`Statut de la facture ${oldInv.invoiceNumber} mis à jour : ${newStatus}`, 'info');
      }

      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
      
      // Update selected invoice reference
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error: any) {
      showToast(`Erreur mise à jour du statut : ${error.message}`, 'error');
    }
  };

  // Handlers for Client management
  const handleAddClient = async (newCli: Client) => {
    try {
      const clientWithUser = { ...newCli, userId: user?.id };
      const { data: dbCli, error } = await supabase.from('clients').insert([clientWithUser]).select().single();
      if (error) throw error;
      const finalCli = { ...newCli, ...dbCli };
      setClients([...clients, finalCli]);
      showToast(`Client "${finalCli.name}" ajouté avec succès.`, 'success');
      
      // Notification
      const newNotif = {
        id: `notif-${Date.now()}`,
        text: `Nouveau client ${newCli.name} ajouté à la base de données.`,
        date: "À l'instant",
        read: false,
        type: 'info'
      };
      setNotifications(prev => [newNotif, ...prev]);
    } catch (error: any) {
      showToast(`Erreur ajout client : ${error.message}`, 'error');
    }
  };

  const handleEditClient = async (updatedCli: Client) => {
    try {
      const { data: dbCli, error } = await supabase.from('clients').update(updatedCli).eq('id', updatedCli.id).select().single();
      if (error) throw error;
      const finalCli = { ...updatedCli, ...dbCli };
      setClients(clients.map(cli => cli.id === finalCli.id ? finalCli : cli));
      showToast(`Fiche client de "${finalCli.name}" modifiée.`, 'success');
      
      // Update client names & emails in invoices list for consistency
      setInvoices(invoices.map(inv => {
        if (inv.clientId === updatedCli.id) {
          return {
            ...inv,
            clientName: updatedCli.name,
            clientEmail: updatedCli.email
          };
        }
        return inv;
      }));
    } catch (error: any) {
      showToast(`Erreur modification client : ${error.message}`, 'error');
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      const deletedCli = clients.find(c => c.id === id);
      setClients(clients.filter(cli => cli.id !== id));
      showToast(`Client "${deletedCli?.name || ''}" supprimé.`, 'info');
    } catch (error: any) {
      showToast(`Erreur suppression client : ${error.message}`, 'error');
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast("Toutes les notifications ont été marquées comme lues.", 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast("Historique des notifications vidé.", 'info');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 transition-colors duration-200">
        <div className="animate-spin text-blue-600 dark:text-blue-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    );
  }

  if (user === null) {
    if (showLanding) {
      return <LandingPage onStart={() => setShowLanding(false)} />;
    }

    return (
      <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-12 transition-colors duration-200 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>

        {/* Dynamic Toast Container for Auth */}
        {toast && (
          <div className="fixed top-6 right-6 z-55 max-w-sm w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-premium flex items-start gap-3.5 animate-in slide-in-from-top-6 duration-200 text-slate-800 dark:text-zinc-100">
            <div className={`p-2 rounded-xl text-white shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-blue-600'
            }`}>
              {toast.type === 'success' ? <CheckCircle size={18} /> : toast.type === 'error' ? <AlertTriangle size={18} /> : <Info size={18} />}
            </div>
            <div className="pt-0.5">
              <h4 className="text-xs font-bold">{toast.type === 'success' ? 'Succès' : toast.type === 'error' ? 'Erreur' : 'Information'}</h4>
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="relative z-10 max-w-md w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] border border-white/40 dark:border-zinc-800/50 shadow-2xl">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center transform -translate-y-12 mb-[-2rem] overflow-hidden bg-white shadow-lg border border-slate-100">
              <img src="/logo.jpg" alt="Izi-Facture Logo" className="w-full h-full object-contain p-2" />
            </div>
            <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isLoginMode ? 'IZI-FACTURE' : 'Créer un compte'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 font-medium">
              {isLoginMode 
                ? 'Connectez-vous pour accéder à votre espace' 
                : 'Commencez à facturer comme un pro'}
            </p>
          </div>

          {isResetMode ? (
            <form className="mt-8 space-y-4" onSubmit={handleResetPassword}>
              <div className="space-y-2 relative group">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pl-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ex: henry@izi-facture.com"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full py-3.5 px-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? 'Envoi...' : 'Réinitialiser le mot de passe'}
                </span>
              </button>
              
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsResetMode(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={handleAuth}>
              {!isLoginMode && (
              <div className="space-y-2 relative group">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pl-1">
                  Nom complet
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="ex: Doré Henry Konan"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 relative group">
              <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pl-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ex: henry@izi-facture.com"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 relative group">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                  Mot de passe
                </label>
                {isLoginMode && (
                  <span 
                    onClick={() => setIsResetMode(true)}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                  >
                    Mot de passe oublié ?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full py-3.5 px-4 mt-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement...
                  </>
                ) : (
                  isLoginMode ? 'Accéder à mon espace' : 'Créer mon compte'
                )}
              </span>
            </button>
            </form>
          )}

          <div className="text-center pt-6">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setLoginPassword('');
                if (isLoginMode) {
                  setLoginName('');
                }
              }}
              className="text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isLoginMode 
                ? <>Nouveau sur iziFacture ? <span className="text-blue-600 dark:text-blue-400">S'inscrire</span></> 
                : <>Déjà un compte ? <span className="text-blue-600 dark:text-blue-400">Se connecter</span></>}
            </button>
            
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800/50 w-full overflow-hidden">
              <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl py-2.5 px-3 shadow-inner border border-slate-100 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
                <div className="animate-marquee hover:[animation-play-state:paused] w-full">
                  <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent text-[13px] italic font-bold tracking-wide drop-shadow-sm">
                    ✨ izi-facture est une initiative de Henry Konan Dore ; Email : doredev2@gmail.com ✨
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc] dark:bg-zinc-950 transition-colors duration-200">
      
      {/* Dynamic Toast Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 max-w-sm w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-premium flex items-start gap-3.5 animate-in slide-in-from-bottom-6 duration-200 text-slate-800 dark:text-zinc-100">
          <div className={`p-2 rounded-xl text-white shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-blue-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : toast.type === 'error' ? <AlertTriangle size={16} /> : <Info size={16} />}
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">
              {toast.type === 'success' ? 'Succès' : toast.type === 'error' ? 'Alerte' : 'Information'}
            </h4>
            <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-zinc-300">
              {toast.message}
            </p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white shrink-0 p-1 rounded-lg">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar 
        companies={companies}
        onAddCompany={handleAddCompany}
        onEditCompany={handleEditCompany}
        onDeleteCompany={handleDeleteCompany}
        activeCompany={activeCompany} 
        setActiveCompany={setActiveCompany} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        role={role}
        setRole={setRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clients={clients}
        invoices={companyInvoices}
        onSelectInvoice={(inv) => {
          setSelectedInvoice(inv);
          setActiveTab('invoice-detail');
        }}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto w-full max-w-[1600px] mx-auto">
        
        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
            <div className="animate-spin text-blue-600 dark:text-blue-500">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 animate-pulse">Chargement de vos données...</p>
          </div>
        ) : (
          <>
            {/* Dynamic Tab Renderer */}
            {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-zinc-800/60 relative">
              <div>
                <div className="text-xs font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
                  Tableau de Bord
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  Aperçu de votre activité
                </h1>
                {/* Interactive Date Range Pickers */}
                <div className="flex items-center gap-2.5 flex-wrap text-xs font-semibold mt-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300">
                    <Calendar size={13} className="text-slate-400" />
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mr-1">Du</span>
                    <input 
                      type="date"
                      value={dashboardStartDate}
                      onChange={(e) => setDashboardStartDate(e.target.value)}
                      className="bg-transparent border-none outline-none focus:ring-0 text-[11px] text-slate-700 dark:text-zinc-300 w-[100px] font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300">
                    <Calendar size={13} className="text-slate-400" />
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mr-1">Au</span>
                    <input 
                      type="date"
                      value={dashboardEndDate}
                      onChange={(e) => setDashboardEndDate(e.target.value)}
                      className="bg-transparent border-none outline-none focus:ring-0 text-[11px] text-slate-700 dark:text-zinc-300 w-[100px] font-medium"
                    />
                  </div>
                  {(dashboardStartDate || dashboardEndDate) && (
                    <button
                      type="button"
                      onClick={() => { setDashboardStartDate(''); setDashboardEndDate(''); }}
                      className="text-[10px] font-bold text-rose-600 dark:text-rose-455 hover:underline px-1.5 cursor-pointer"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                {/* Guide d'utilisation Download */}
                <a 
                  href="/guide-izi-facture.html" 
                  download="Guide_Utilisation_Izi_Facture.html"
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl text-xs font-bold transition-colors border border-blue-200/50 dark:border-blue-800/30"
                >
                  <Download size={15} /> Guide d'utilisation
                </a>

                {/* Quick stats indicator (toggles Wallet Tab) */}
                <button 
                  onClick={() => setActiveTab('wallet')}
                  className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer shadow-sm"
                >
                  <div className={`w-2 h-2 rounded-full animate-pulse ${omActive || mtnActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="font-bold text-slate-700 dark:text-zinc-350">
                    {(omActive && mtnActive) ? 'Orange Money & MTN actifs' : (omActive || mtnActive) ? 'MoMo partiel actif' : 'MoMo inactifs'}
                  </span>
                </button>
                
                {/* Notifications Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all relative cursor-pointer"
                  >
                    <Bell size={18} />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-900" />
                    )}
                  </button>

                  {/* Notifications Popover Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-2xl shadow-premium z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800 dark:text-zinc-100">
                      <div className="p-4 border-b border-slate-100 dark:border-zinc-850 flex items-center justify-between">
                        <span className="text-xs font-bold">Notifications</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={markAllNotificationsAsRead}
                            className="text-[10px] font-bold text-blue-650 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Tout lire
                          </button>
                          <span className="text-slate-300">•</span>
                          <button 
                            onClick={clearNotifications}
                            className="text-[10px] font-bold text-rose-600 dark:text-rose-450 hover:underline cursor-pointer"
                          >
                            Vider
                          </button>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-slate-50 dark:divide-zinc-850/60 max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-3.5 flex items-start gap-2.5 transition-colors ${n.read ? 'opacity-70 bg-white dark:bg-zinc-900' : 'bg-blue-50/10 dark:bg-blue-950/5'}`}
                            >
                              <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                                n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-rose-500' : 'bg-blue-500'
                              }`} />
                              <div className="space-y-0.5">
                                <p className="text-xs leading-normal font-medium text-slate-700 dark:text-zinc-300">
                                  {n.text}
                                </p>
                                <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold block">{n.date}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-450 dark:text-zinc-550">
                            Aucune notification.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard 4 Stats Cards */}
            <StatsCards invoices={filteredDashboardInvoices} currency={activeCompany.currency} />

            {/* Chart and Table / Side panels grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Invoices Table & Chart Section */}
              <div className="xl:col-span-2 space-y-6">
                {/* Embedded recent invoices table in dashboard */}
                <RecentInvoices 
                  invoices={filteredDashboardInvoices} 
                  currency={activeCompany.currency} 
                  onCreateInvoiceClick={() => {
                    setSelectedInvoice(null);
                    setActiveTab('create-invoice');
                  }}
                  onInvoiceClick={(inv) => {
                    setSelectedInvoice(inv);
                    setActiveTab('invoice-detail');
                  }}
                  onEditInvoiceClick={(inv) => {
                    setSelectedInvoice(inv);
                    setActiveTab('create-invoice');
                  }}
                  onDeleteInvoice={handleDeleteInvoice}
                  onStatusChange={handleStatusChange}
                  showToast={showToast}
                />
                
                <InteractiveChart currency={activeCompany.currency} />
              </div>

              {/* Side panels (Top Clients & Activities) */}
              <div className="space-y-6">
                
                {/* Top Clients Panel */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                        Meilleurs Clients
                      </h3>
                      <p className="text-[11px] text-slate-455 dark:text-zinc-500 font-medium mt-0.5">
                        Classés par volumes payés
                      </p>
                    </div>
                    <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg text-blue-650 dark:text-blue-400">
                      <Users size={16} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {topClients.length > 0 ? (
                      topClients.map((client, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/40 dark:bg-zinc-950/10 border border-slate-100/50 dark:border-zinc-850 hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-850 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center">
                              {client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                {client.name}
                              </h4>
                              <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold truncate block max-w-[140px]">
                                {client.email}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                              {formatFCFA(client.totalPaid, activeCompany.currency)}
                            </div>
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mt-0.5">
                              Encaissé
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-450 dark:text-zinc-500">
                        Aucun paiement enregistré pour le moment.
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activities Timeline */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                        Activités Récentes
                      </h3>
                      <p className="text-[11px] text-slate-455 dark:text-zinc-500 font-medium mt-0.5">
                        Flux d'événements en direct
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg text-emerald-650 dark:text-emerald-400">
                      <TrendingUp size={16} />
                    </div>
                  </div>

                  {/* Timeline list */}
                  <div className="relative border-l border-slate-200 dark:border-zinc-800 pl-4 ml-2 space-y-5.5 py-1">
                    {(() => {
                      const parsedActivities = filteredDashboardInvoices
                        .map(inv => {
                          let title = '';
                          let color = 'bg-blue-500';
                          let ringColor = 'ring-blue-50/50 dark:ring-blue-950/50';
                          let subtitle = `Client : ${inv.clientName} • Émise le ${inv.issueDate}`;

                          if (inv.status === 'paid') {
                            title = `Facture ${inv.invoiceNumber} payée`;
                            color = 'bg-emerald-500';
                            ringColor = 'ring-emerald-50/50 dark:ring-emerald-950/50';
                          } else if (inv.status === 'sent') {
                            title = `Facture ${inv.invoiceNumber} envoyée`;
                            color = 'bg-blue-500';
                            ringColor = 'ring-blue-50/50 dark:ring-blue-950/50';
                          } else if (inv.status === 'draft') {
                            title = `Facture ${inv.invoiceNumber} créée`;
                            color = 'bg-slate-400 dark:bg-zinc-500';
                            ringColor = 'ring-slate-100/50 dark:ring-zinc-800/50';
                            subtitle = `Enregistrée comme brouillon • Le ${inv.issueDate}`;
                          } else if (inv.status === 'overdue') {
                            title = `Facture ${inv.invoiceNumber} en retard`;
                            color = 'bg-rose-500';
                            ringColor = 'ring-rose-50/50 dark:ring-rose-950/50';
                            subtitle = `Montant en retard • Échéance : ${inv.dueDate}`;
                          } else if (inv.status === 'cancelled') {
                            title = `Facture ${inv.invoiceNumber} annulée`;
                            color = 'bg-zinc-500';
                            ringColor = 'ring-zinc-100/50 dark:ring-zinc-800/50';
                          }

                          return {
                            id: inv.id,
                            title,
                            subtitle,
                            color,
                            ringColor,
                            dateObj: parseDDMMYYYY(inv.issueDate) || new Date()
                          };
                        })
                        .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
                        .slice(0, 5);

                      if (parsedActivities.length === 0) {
                        return (
                          <div className="text-center py-4 text-xs text-slate-450 dark:text-zinc-550 font-medium">
                            Aucune activité enregistrée pour cette période.
                          </div>
                        );
                      }

                      return parsedActivities.map((act) => (
                        <div key={act.id} className="relative">
                          <span className={`absolute -left-[20.5px] top-1 ${act.color} w-2.5 h-2.5 rounded-full ring-4 ${act.ringColor}`} />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-snug">
                              {act.title}
                            </p>
                            <p className="text-[10px] text-slate-455 dark:text-zinc-500 font-semibold mt-0.5">
                              {act.subtitle}
                            </p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Factures (Invoices List) Tab */}
        {activeTab === 'invoices' && (
          <InvoicesPage 
            invoices={companyInvoices} 
            activeCompany={activeCompany}
            currency={activeCompany.currency}
            onCreateInvoiceClick={() => {
              setSelectedInvoice(null);
              setActiveTab('create-invoice');
            }}
            onInvoiceClick={(inv) => {
              setSelectedInvoice(inv);
              setActiveTab('invoice-detail');
            }}
          />
        )}

        {/* Créer / Modifier Facture Tab */}
        {activeTab === 'create-invoice' && (
          <CreateInvoice 
            companies={companies}
            clients={clients}
            activeCompany={activeCompany}
            invoiceToEdit={selectedInvoice}
            onSave={handleSaveInvoice}
            onCancel={() => {
              setSelectedInvoice(null);
              setActiveTab('invoices');
            }}
            showToast={showToast}
          />
        )}

        {/* Détail Facture Tab */}
        {activeTab === 'invoice-detail' && selectedInvoice && (
          <InvoiceDetail 
            invoice={selectedInvoice}
            companies={companies}
            activeCompany={activeCompany}
            onBack={() => {
              setSelectedInvoice(null);
              setActiveTab('invoices');
            }}
            onEdit={(inv) => {
              setSelectedInvoice(inv);
              setActiveTab('create-invoice');
            }}
            onDelete={handleDeleteInvoice}
            onStatusChange={handleStatusChange}
            showToast={showToast}
          />
        )}

        {/* Clients Page Tab */}
        {activeTab === 'clients' && (
          <ClientsPage 
            clients={clients}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
          />
        )}

        {/* Transactions Page Tab */}
        {activeTab === 'transactions' && (
          <TransactionsPage transactions={transactions} currency={activeCompany.currency} />
        )}

        {/* Portefeuille Page Tab */}
        {activeTab === 'wallet' && (
          <WalletPage 
            currency={activeCompany.currency} 
            setActiveTab={setActiveTab} 
            showToast={showToast} 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {/* Budgets Page Tab */}
        {activeTab === 'budgeting' && (
          <BudgetsPage currency={activeCompany.currency} />
        )}

        {/* Rapports Page Tab */}
        {activeTab === 'reports' && (
          <ReportsPage invoices={companyInvoices} currency={activeCompany.currency} />
        )}

        {/* Paramètres Tab */}
        {activeTab === 'settings' && (
          <SettingsPage 
            activeCompany={activeCompany}
            onUpdateCompany={handleUpdateCompany}
            omActive={omActive}
            setOmActive={setOmActive}
            mtnActive={mtnActive}
            setMtnActive={setMtnActive}
            showToast={showToast}
          />
        )}

        {/* Aide & Support Tab */}
        {activeTab === 'help' && (
          <HelpPage showToast={showToast} />
        )}

        {/* Administration Tab */}
        {activeTab === 'admin' && role === 'admin' && (
          <AdminDashboard showToast={showToast} />
        )}

          </>
        )}
      </main>
    </div>
  );
}
