'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  FileText, 
  PieChart, 
  Settings, 
  HelpCircle, 
  Moon, 
  Sun, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Building2,
  Users,
  ArrowRight,
  Edit,
  Trash2,
  Plus,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { Company, Client, Invoice, mockCompanies } from '../lib/data';

interface SidebarProps {
  companies: Company[];
  onAddCompany: (company: Company) => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (id: string) => void;
  activeCompany: Company;
  setActiveCompany: (company: Company) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  role: 'admin' | 'client';
  setRole: (role: 'admin' | 'client') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  clients: Client[];
  invoices: Invoice[];
  onSelectInvoice?: (invoice: Invoice) => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  isSubActive?: boolean;
  subscription?: any;
  subDaysLeft?: number;
  onOpenSubscription?: () => void;
}

export default function Sidebar({ 
  companies,
  onAddCompany,
  onEditCompany,
  onDeleteCompany,
  activeCompany, 
  setActiveCompany, 
  isOpen, 
  setIsOpen,
  role,
  setRole,
  activeTab,
  setActiveTab,
  clients,
  invoices,
  onSelectInvoice,
  user,
  onLogout,
  isSubActive,
  subscription,
  subDaysLeft,
  onOpenSubscription
}: SidebarProps) {
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Company management state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showDeleteCompanyConfirm, setShowDeleteCompanyConfirm] = useState<string | null>(null);
  const [compFormName, setCompFormName] = useState('');
  const [compFormEmail, setCompFormEmail] = useState('');
  const [compFormLogo, setCompFormLogo] = useState('🏢');
  const [compFormCurrency, setCompFormCurrency] = useState('GNF');
  const [compFormAddress, setCompFormAddress] = useState('');
  const [compFormRccm, setCompFormRccm] = useState('');
  const [compFormNif, setCompFormNif] = useState('');

  const handleOpenAddCompany = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCompany(null);
    setCompFormName('');
    setCompFormEmail('');
    setCompFormLogo('🏢');
    setCompFormCurrency('GNF');
    setCompFormAddress('');
    setCompFormRccm('');
    setCompFormNif('');
    setShowCompanyModal(true);
    setShowCompanyDropdown(false);
  };

  const handleOpenEditCompany = (e: React.MouseEvent, company: Company) => {
    e.stopPropagation();
    setEditingCompany(company);
    setCompFormName(company.name);
    setCompFormEmail(company.email || '');
    setCompFormLogo(company.logo);
    setCompFormCurrency(company.currency);
    setCompFormAddress(company.address);
    setCompFormRccm(company.rccm || '');
    setCompFormNif(company.nif || '');
    setShowCompanyModal(true);
    setShowCompanyDropdown(false);
  };

  const handleOpenDeleteCompany = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setShowDeleteCompanyConfirm(id);
    setShowCompanyDropdown(false);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compFormName || !compFormAddress || !compFormEmail) {
      alert("Le nom, l'adresse et l'email sont obligatoires.");
      return;
    }

    if (editingCompany) {
      const updated: Company = {
        ...editingCompany,
        name: compFormName,
        email: compFormEmail,
        logo: compFormLogo,
        currency: compFormCurrency,
        address: compFormAddress,
        rccm: compFormRccm,
        nif: compFormNif
      };
      onEditCompany(updated);
    } else {
      const created: Company = {
        id: `co-${Date.now()}`,
        name: compFormName,
        email: compFormEmail,
        logo: compFormLogo,
        currency: compFormCurrency,
        address: compFormAddress,
        rccm: compFormRccm,
        nif: compFormNif
      };
      onAddCompany(created);
    }
    setShowCompanyModal(false);
  };
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Dark Mode based on localStorage or preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Close search results dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', name: 'Factures', icon: FileText },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'transactions', name: 'Transactions', icon: Receipt },
    { id: 'wallet', name: 'Portefeuille', icon: Wallet },
    { id: 'budgeting', name: 'Budgets', icon: PieChart },
    { id: 'reports', name: 'Rapports', icon: PieChart },
  ];

  const bottomItems = [
    { id: 'help', name: 'Aide & Support', icon: HelpCircle },
    { id: 'settings', name: 'Paramètres', icon: Settings },
    ...(role === 'admin' ? [{ id: 'admin', name: 'Administration', icon: ShieldAlert }] : []),
  ];

  // Perform search
  const searchResults = {
    pages: menuItems.concat(bottomItems).filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    clients: clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery)
    ),
    invoices: invoices.filter(i => 
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  const hasSearchResults = 
    searchQuery.trim() !== '' && 
    (searchResults.pages.length > 0 || searchResults.clients.length > 0 || searchResults.invoices.length > 0);

  const handleSearchResultClick = (type: 'page' | 'client' | 'invoice', item: any) => {
    setSearchQuery('');
    setShowSearchResults(false);
    setIsOpen(false);
    
    if (type === 'page') {
      setActiveTab(item.id);
    } else if (type === 'client') {
      setActiveTab('clients');
    } else if (type === 'invoice') {
      if (onSelectInvoice) {
        onSelectInvoice(item);
      } else {
        setActiveTab('invoices');
      }
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-2xl rounded-lg overflow-hidden">
            {activeCompany.logo.startsWith('data:image') ? (
              <img src={activeCompany.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              activeCompany.logo
            )}
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            {activeCompany.name}
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 lg:sticky lg:z-10
        w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800
        flex flex-col h-full transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header / Logo & Company Switcher */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-850 relative">
          <div 
            onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-xl shadow-inner overflow-hidden">
                {activeCompany.logo.startsWith('data:image') ? (
                  <img src={activeCompany.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  activeCompany.logo
                )}
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-sm text-slate-800 dark:text-zinc-200 leading-tight truncate w-32">
                  {activeCompany.name}
                </h2>
                <span className="text-[10px] text-slate-400 dark:text-zinc-550 font-medium">
                  Entreprise active
                </span>
              </div>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showCompanyDropdown ? 'rotate-180' : ''}`} />
          </div>
          {/* Company Switcher Dropdown */}
          {showCompanyDropdown && (
            <div className="absolute left-6 right-6 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-premium z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider border-b border-slate-55 dark:border-zinc-850/60 flex justify-between items-center">
                <span>Mes Entreprises</span>
                <button 
                  onClick={handleOpenAddCompany}
                  className="text-[10px] font-extrabold text-blue-600 dark:text-blue-455 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={10} /> Ajouter
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-850/40">
                {companies.map((company) => (
                  <div 
                    key={company.id}
                    className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors group
                      ${activeCompany.id === company.id ? 'bg-blue-50/20 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80'}
                    `}
                  >
                    <button
                      onClick={() => {
                        setActiveCompany(company);
                        setShowCompanyDropdown(false);
                      }}
                      className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-lg overflow-hidden">
                        {company.logo.startsWith('data:image') ? (
                          <img src={company.logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          company.logo
                        )}
                      </div>
                      <div className="truncate w-24">
                        <div className="text-xs font-semibold truncate">{company.name}</div>
                        <div className="text-[10px] text-slate-455 dark:text-zinc-500 font-bold">{company.currency}</div>
                      </div>
                    </button>
                    
                    {/* Hover actions for company */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEditCompany(e, company)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-455 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Modifier l'entreprise"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={(e) => handleOpenDeleteCompany(e, company.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Supprimer l'entreprise"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Search Input */}
        <div className="px-6 py-4 relative" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Rechercher..." 
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-slate-350 dark:focus:border-zinc-750 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 hover:text-slate-655"
              >
                ✕
              </button>
            )}
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 dark:text-zinc-550 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-1 py-0.5 rounded">
              ⌘F
            </span>
          </div>

          {/* Floating Search Results Dropdown */}
          {showSearchResults && searchQuery.trim() !== '' && (
            <div className="absolute left-6 right-6 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-premium z-50 py-2.5 overflow-y-auto max-h-72 animate-in fade-in slide-in-from-top-1 duration-100 text-xs">
              {hasSearchResults ? (
                <div className="space-y-3">
                  {/* Pages Matches */}
                  {searchResults.pages.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[9px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
                        Pages
                      </div>
                      {searchResults.pages.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearchResultClick('page', item)}
                          className="w-full flex items-center justify-between px-4 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-all font-medium"
                        >
                          <span className="truncate">{item.name}</span>
                          <ArrowRight size={11} className="text-slate-300" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Client Matches */}
                  {searchResults.clients.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[9px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
                        Clients
                      </div>
                      {searchResults.clients.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearchResultClick('client', item)}
                          className="w-full flex items-center justify-between px-4 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-all font-medium"
                        >
                          <div className="truncate">
                            <div className="font-semibold truncate">{item.name}</div>
                            <div className="text-[9px] text-slate-450 dark:text-zinc-500 truncate">{item.email}</div>
                          </div>
                          <ArrowRight size={11} className="text-slate-300" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Invoice Matches */}
                  {searchResults.invoices.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[9px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest">
                        Factures
                      </div>
                      {searchResults.invoices.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearchResultClick('invoice', item)}
                          className="w-full flex items-center justify-between px-4 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-all font-medium"
                        >
                          <div className="truncate">
                            <div className="font-semibold">{item.invoiceNumber}</div>
                            <div className="text-[9px] text-slate-450 dark:text-zinc-500 truncate">{item.clientName}</div>
                          </div>
                          <ArrowRight size={11} className="text-slate-300" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 text-center text-slate-450 dark:text-zinc-500">
                  Aucun résultat pour "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
            Menu Principal
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'invoices' && (activeTab === 'create-invoice' || activeTab === 'invoice-detail'));
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border text-left cursor-pointer
                  ${isActive 
                    ? 'bg-blue-50/40 text-blue-650 border-blue-100/60 dark:bg-zinc-800/40 dark:text-blue-400 dark:border-zinc-700/40 font-bold shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-zinc-400 dark:hover:text-white border-transparent'}
                `}
              >
                <item.icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'} />
                {item.name}
              </button>
            );
          })}

          {/* Subscription Widget */}
          {user && role !== 'admin' && (
            <div className="mx-3 mt-6 mb-2 p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <ShieldAlert size={40} />
              </div>
              <div className="relative z-10">
                <h4 className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSubActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  Abonnement {subscription?.planName || 'Gratuit'}
                </h4>
                {isSubActive ? (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3 font-medium">
                    {subDaysLeft} jours restants
                  </p>
                ) : (
                  <p className="text-xs text-rose-500 font-bold mb-3">
                    Expiré ou limité
                  </p>
                )}
                <button
                  onClick={onOpenSubscription}
                  className="w-full py-1.5 bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-900 transition-colors shadow-sm"
                >
                  {isSubActive ? 'Gérer mon plan' : 'S\'abonner'}
                </button>
              </div>
            </div>
          )}

          <div className="pt-6 px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
            Support & Réglages
          </div>
          {bottomItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border text-left cursor-pointer
                  ${isActive 
                    ? 'bg-blue-50/40 text-blue-655 border-blue-100/60 dark:bg-zinc-800/40 dark:text-blue-400 dark:border-zinc-700/40 font-bold shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-zinc-400 dark:hover:text-white border-transparent'}
                `}
              >
                <item.icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/50 dark:bg-zinc-950/30 rounded-xl border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              {darkMode ? (
                <Moon size={18} className="text-blue-500" />
              ) : (
                <Sun size={18} className="text-amber-500" />
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-350">
                Mode Sombre
              </span>
            </div>
            
            <button 
              onClick={toggleDarkMode}
              className={`
                relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                ${darkMode ? 'bg-blue-600' : 'bg-slate-250 dark:bg-zinc-800'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out
                  ${darkMode ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Profile User Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/20">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-1">
              <div className="flex items-center gap-3 truncate">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-zinc-900" />
                </div>
                <div className="text-left truncate">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">
                    {user ? user.name : 'Utilisateur'}
                  </h4>
                  <p className="text-[10px] text-slate-450 dark:text-zinc-500 truncate font-medium">
                    {user ? user.email : ''}
                  </p>
                </div>
              </div>
              
              {/* Logout button */}
              <button 
                onClick={onLogout}
                className="p-1.5 text-slate-450 hover:text-rose-600 dark:hover:text-rose-450 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Se déconnecter"
              >
                <LogOut size={16} />
              </button>
            </div>
            
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Rôle</span>
              {/* Interactive Badge to toggle role */}
              <div 
                className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  role === 'admin' 
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                }`}
                title={`Rôle actuel: ${role === 'admin' ? 'Administrateur' : 'Client'}`}
              >
                {role === 'admin' ? 'Admin' : 'Client'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCompanySubmit}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-premium animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-zinc-100"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-850/60 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCompany ? "Modifier l'entreprise" : 'Créer une nouvelle entreprise'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowCompanyModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white p-1 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Logo upload or emoji */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Logo</label>
                  <div className="relative w-full h-[38px] rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-blue-500 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setCompFormLogo(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title="Changer le logo"
                    />
                    {compFormLogo.startsWith('data:image') ? (
                      <img src={compFormLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-lg">{compFormLogo}</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider">Upload</span>
                    </div>
                  </div>
                </div>

                {/* Raison sociale */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Raison Sociale *</label>
                  <input
                    type="text"
                    required
                    value={compFormName}
                    onChange={(e) => setCompFormName(e.target.value)}
                    placeholder="Nom de l'entreprise"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* E-mail de l'entreprise */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">E-mail de facturation *</label>
                <input
                  type="email"
                  required
                  value={compFormEmail}
                  onChange={(e) => setCompFormEmail(e.target.value)}
                  placeholder="contact@entreprise.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Devise */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Devise principale</label>
                <select
                  value={compFormCurrency}
                  onChange={(e) => setCompFormCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="GNF">Franc Guinéen (GNF)</option>
                  <option value="FCFA">Franc CFA (FCFA)</option>
                  <option value="USD">Dollar Américain (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              {/* Adresse */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Adresse complète *</label>
                <input
                  type="text"
                  required
                  value={compFormAddress}
                  onChange={(e) => setCompFormAddress(e.target.value)}
                  placeholder="ex: Dixinn, Conakry"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* RCCM */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">RCCM</label>
                  <input
                    type="text"
                    value={compFormRccm}
                    onChange={(e) => setCompFormRccm(e.target.value)}
                    placeholder="N° Registre Commerce"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {/* NIF */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">NIF</label>
                  <input
                    type="text"
                    value={compFormNif}
                    onChange={(e) => setCompFormNif(e.target.value)}
                    placeholder="Identifiant fiscal"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-850/60">
              <button
                type="button"
                onClick={() => setShowCompanyModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-zinc-450 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer"
              >
                {editingCompany ? 'Sauvegarder' : 'Créer l\'entreprise'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Company Confirm Modal */}
      {showDeleteCompanyConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-premium animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-zinc-100">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="text-rose-500" size={18} />
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-550 dark:text-zinc-450 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement cette entreprise ? Cette action est irréversible et changera l'entreprise active par défaut.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteCompanyConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-zinc-450 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteCompany(showDeleteCompanyConfirm);
                  setShowDeleteCompanyConfirm(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
