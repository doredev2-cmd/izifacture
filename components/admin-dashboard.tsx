'use client';

import React, { useState, useEffect } from 'react';
import { Users, Lock, Unlock, KeyRound, ShieldAlert, CheckCircle, Search, RefreshCw, Trash2, ArrowUpCircle, ArrowDownCircle, CreditCard, Activity, DollarSign } from 'lucide-react';
import { listAllUsers, toggleBlockUser, changeUserPassword, deleteUser, promoteToAdmin } from '../app/actions/admin';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_banned: boolean;
  is_admin?: boolean;
}

export default function AdminDashboard({ showToast }: { showToast: (msg: string, type: 'success'|'error'|'info') => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'subscriptions'>('users');
  
  // Password change state
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete state
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [userToBlock, setUserToBlock] = useState<AdminUser | null>(null);
  const [userToPromote, setUserToPromote] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { users: fetchedUsers, error } = await listAllUsers();
    if (error) {
      showToast(error, 'error');
    } else {
      setUsers(fetchedUsers || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = (user: AdminUser) => {
    setUserToBlock(user);
  };

  const executeToggleBlock = async () => {
    if (!userToBlock) return;
    showToast(`En cours...`, 'info');
    const { success, error } = await toggleBlockUser(userToBlock.id, !userToBlock.is_banned);
    
    if (success) {
      showToast(`Utilisateur ${userToBlock.is_banned ? 'débloqué' : 'bloqué'} avec succès.`, 'success');
      fetchUsers();
      setUserToBlock(null);
    } else {
      showToast(`Erreur : ${error}`, 'error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;

    setIsChangingPassword(true);
    const { success, error } = await changeUserPassword(selectedUserForPassword.id, newPassword);
    setIsChangingPassword(false);

    if (success) {
      showToast(`Mot de passe changé pour ${selectedUserForPassword.email}`, 'success');
      setSelectedUserForPassword(null);
      setNewPassword('');
    } else {
      showToast(`Erreur : ${error}`, 'error');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    showToast(`Suppression en cours...`, 'info');
    const { success, error } = await deleteUser(userToDelete.id);
    if (success) {
      showToast(`Utilisateur supprimé avec succès.`, 'success');
      setUserToDelete(null);
      fetchUsers();
    } else {
      showToast(`Erreur : ${error}`, 'error');
    }
  };

  const handlePromote = (user: AdminUser) => {
    setUserToPromote(user);
  };

  const executePromote = async () => {
    if (!userToPromote) return;
    
    showToast(`Mise à jour en cours...`, 'info');
    const { success, error } = await promoteToAdmin(userToPromote.id, !userToPromote.is_admin);
    if (success) {
      showToast(`Droits mis à jour avec succès.`, 'success');
      fetchUsers();
      setUserToPromote(null);
    } else {
      showToast(`Erreur : ${error}`, 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div>
          <div className="text-xs font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={14} className="text-rose-500" /> Espace Administrateur
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Gestion des Utilisateurs
          </h1>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'users' 
            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2"><Users size={16} /> Utilisateurs</div>
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'subscriptions' 
            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2"><CreditCard size={16} /> Abonnements</div>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par email ou nom..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 px-4">
            Total : {users.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-zinc-950/50 text-slate-500 dark:text-zinc-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200/60 dark:border-zinc-800/60">
              <tr>
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Email</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Inscription</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-slate-700 dark:text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Chargement des utilisateurs...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 font-bold flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.is_admin && (
                          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 border-2 border-white dark:border-zinc-900" title="Administrateur">
                            <ShieldAlert size={10} />
                          </div>
                        )}
                      </div>
                      {user.name}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-zinc-400">{user.email}</td>
                    <td className="p-4">
                      {user.is_banned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-950/45">
                          <Lock size={12} /> Bloqué
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-950/45">
                          <CheckCircle size={12} /> Actif
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-zinc-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1 sm:space-x-2">
                      <button
                        onClick={() => setSelectedUserForPassword(user)}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg text-xs font-bold transition-colors"
                        title="Changer le mot de passe"
                      >
                        <KeyRound size={14} /> <span className="hidden sm:inline">Mdp</span>
                      </button>
                      <button
                        onClick={() => handlePromote(user)}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold transition-colors"
                        title={user.is_admin ? "Retirer droits admin" : "Nommer Admin"}
                      >
                        {user.is_admin ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                      </button>
                      <button
                        onClick={() => handleToggleBlock(user)}
                        className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          user.is_banned 
                            ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400'
                        }`}
                        title={user.is_banned ? "Débloquer" : "Bloquer"}
                      >
                        {user.is_banned ? <Unlock size={14} /> : <Lock size={14} />}
                      </button>
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors"
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Mock KPIs for subscriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 p-5 rounded-2xl shadow-soft">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">2 400 000 GNF</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Revenus ce mois</p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 p-5 rounded-2xl shadow-soft">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                  <Activity size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">14</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Abonnements actifs</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 p-5 rounded-2xl shadow-soft">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                  <ShieldAlert size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">3</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Abonnements expirés</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-soft overflow-hidden">
             <div className="p-4 border-b border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/50">
               <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Derniers paiements (Simulation)</h3>
             </div>
             <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-zinc-950/50 text-slate-500 dark:text-zinc-400 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Montant</th>
                    <th className="p-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-slate-700 dark:text-zinc-300">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                    <td className="p-4 font-mono text-xs">TX_OM_12345</td>
                    <td className="p-4 font-bold">Pro</td>
                    <td className="p-4 text-emerald-600 font-bold">90 000 GNF</td>
                    <td className="p-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-950/45">Payé</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                    <td className="p-4 font-mono text-xs">TX_MTN_67890</td>
                    <td className="p-4 font-bold">Business</td>
                    <td className="p-4 text-emerald-600 font-bold">300 000 GNF</td>
                    <td className="p-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-950/45">Payé</span></td>
                  </tr>
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* Modal Changement Mot de Passe */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handlePasswordChange} className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-premium border border-slate-100 dark:border-zinc-800 flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
              <h2 className="font-bold text-slate-800 dark:text-white">Nouveau mot de passe</h2>
              <button 
                type="button"
                onClick={() => setSelectedUserForPassword(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Vous allez forcer le changement de mot de passe pour <strong>{selectedUserForPassword.email}</strong>.
              </p>
              <input 
                type="text" 
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe (min 6 car.)"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="p-5 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
              <button 
                type="button"
                onClick={() => setSelectedUserForPassword(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300"
              >
                Annuler
              </button>
              <button 
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
              >
                {isChangingPassword ? 'Modification...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Confirmation de Suppression */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-premium">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="text-rose-500" size={18} />
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-550 dark:text-zinc-450 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur <strong>{userToDelete.email}</strong> ? Cette action est irréversible et lui retirera tout accès immédiatement.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-zinc-450 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation de Blocage */}
      {userToBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-premium">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {userToBlock.is_banned ? <Unlock className="text-emerald-500" size={18} /> : <Lock className="text-rose-500" size={18} />}
              Confirmer l'action
            </h3>
            <p className="text-xs text-slate-550 dark:text-zinc-450 leading-relaxed">
              Êtes-vous sûr de vouloir {userToBlock.is_banned ? 'débloquer' : 'bloquer'} l'utilisateur <strong>{userToBlock.email}</strong> ?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUserToBlock(null)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-zinc-450 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={executeToggleBlock}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all cursor-pointer ${
                  userToBlock.is_banned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {userToBlock.is_banned ? 'Débloquer' : 'Bloquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation de Rôle Admin */}
      {userToPromote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-premium">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="text-amber-500" size={18} />
              Confirmer le rôle
            </h3>
            <p className="text-xs text-slate-550 dark:text-zinc-450 leading-relaxed">
              Voulez-vous vraiment {userToPromote.is_admin ? 'retirer les droits d\'administrateur à' : 'nommer administrateur l\'utilisateur'} <strong>{userToPromote.email}</strong> ?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUserToPromote(null)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-zinc-450 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={executePromote}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
