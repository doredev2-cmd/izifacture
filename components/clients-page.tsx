'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  X, 
  UserPlus,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Client } from '../lib/data';

interface ClientsPageProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientsPage({
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient
}: ClientsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client>({
    id: '', name: '', email: '', phone: '', address: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter clients
  const filteredClients = clients.filter(cli => 
    cli.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cli.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cli.phone.includes(searchTerm) ||
    cli.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenAddModal = () => {
    setCurrentClient({ id: '', name: '', email: '', phone: '', address: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setCurrentClient(client);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient.name || !currentClient.email) {
      alert("Le nom et l'email sont obligatoires.");
      return;
    }

    if (isEditing) {
      onEditClient(currentClient);
    } else {
      const newClient = {
        ...currentClient,
        id: `cli-${Date.now()}`
      };
      onAddClient(newClient);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-widest">
            Base Clients
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Gestion de vos Clients
          </h1>
          <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
            Enregistrez, modifiez et suivez les fiches de vos clients professionnels.
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 dark:bg-blue-650 hover:bg-blue-700 text-white rounded-xl transition-all duration-150 shadow-md cursor-pointer"
        >
          <UserPlus size={16} />
          Nouveau Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 dark:text-zinc-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone, ville..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="text-xs text-slate-400 font-bold hidden md:block">
          {filteredClients.length} clients trouvés
        </div>
      </div>
      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-850 shadow-soft overflow-hidden animate-in fade-in duration-200">
        
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-850 bg-slate-50/30 dark:bg-zinc-950/10">
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[15%] min-w-[120px] whitespace-nowrap">ID Client</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[35%] min-w-[200px] whitespace-nowrap">Client</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[20%] min-w-[150px] whitespace-nowrap">Téléphone</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider w-[25%] min-w-[200px] whitespace-nowrap">Adresse géographique</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider text-right w-[5%] min-w-[80px] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850/70">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <tr 
                    key={client.id}
                    className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-350">
                        {client.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 flex items-center justify-center font-bold text-xs select-none">
                          {client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                            {client.name}
                          </div>
                          <div className="text-[10px] font-medium text-slate-400 dark:text-zinc-550 mt-0.5">
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-650 dark:text-zinc-400 whitespace-nowrap">
                      {client.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-650 dark:text-zinc-400 truncate max-w-[200px]">
                      {client.address || '-'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(client)}
                          title="Modifier la fiche"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={15} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(client.id)}
                          title="Supprimer le client"
                          className="p-1.5 text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs font-semibold text-slate-400 dark:text-zinc-550">
                    Aucun client ne correspond à vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info / Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-850 bg-slate-50/30 dark:bg-zinc-950/10 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-wider">
            Affichage de {filteredClients.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredClients.length)} sur {filteredClients.length} clients
          </span>

          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg bg-white dark:bg-zinc-900 transition-colors ${
                currentPage === 1 
                  ? 'text-slate-300 dark:text-zinc-700 border-slate-150 dark:border-zinc-850 cursor-not-allowed' 
                  : 'text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 cursor-pointer'
              }`}
            >
              Précédent
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg bg-white dark:bg-zinc-900 transition-colors ${
                currentPage === totalPages 
                  ? 'text-slate-300 dark:text-zinc-700 border-slate-150 dark:border-zinc-850 cursor-not-allowed' 
                  : 'text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 cursor-pointer'
              }`}
            >
              Suivant
            </button>
          </div>
        </div>

      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmit}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-premium animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-zinc-100"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-850/60 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Modifier la fiche client' : 'Ajouter un nouveau client'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white p-1 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nom */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Nom Complet / Entreprise Client *
                </label>
                <input
                  type="text"
                  required
                  value={currentClient.name}
                  onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
                  placeholder="ex: Kaba & Associés..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Adresse E-mail de facturation *
                </label>
                <input
                  type="email"
                  required
                  value={currentClient.email}
                  onChange={(e) => setCurrentClient({ ...currentClient, email: e.target.value })}
                  placeholder="ex: contact@kaba.com..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={currentClient.phone}
                  onChange={(e) => setCurrentClient({ ...currentClient, phone: e.target.value })}
                  placeholder="ex: +224 622 00 00 00..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Adresse Géographique
                </label>
                <textarea
                  value={currentClient.address}
                  onChange={(e) => setCurrentClient({ ...currentClient, address: e.target.value })}
                  placeholder="ex: Sandervalia, Kaloum, Conakry, Guinée..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-850/60">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-zinc-450 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer"
              >
                {isEditing ? 'Sauvegarder' : 'Créer le client'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-premium animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-zinc-100">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={18} />
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-550 dark:text-zinc-450 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer ce client ? Toutes ses factures existantes ne seront pas supprimées mais sa fiche ne sera plus accessible dans vos formulaires.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-zinc-450 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteClient(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
