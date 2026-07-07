import { supabase } from './supabase';
import { Subscription, PaymentRecord } from './data';

// Definition des prix des plans en GNF (mensuel)
export const SUBSCRIPTION_PLANS = {
  'Gratuit': { monthly: 0, quarterly: 0, annual: 0 },
  'Pro': { monthly: 90000, quarterly: 250000, annual: 950000 },
  'Business': { monthly: 300000, quarterly: 850000, annual: 3200000 }
};

export const SUBSCRIPTION_FEATURES = {
  'Gratuit': ['Création de factures limitées', 'Support de base'],
  'Pro': ['Factures illimitées', '3 utilisateurs', 'Devis & Bons de commande', 'Support prioritaire'],
  'Business': ['Tout du plan Pro', 'Utilisateurs illimités', 'Gestion de stock', 'API & Intégrations']
};

/**
 * Calcule la date d'expiration en fonction de la date de début et de la durée (mensuel, trimestriel, annuel)
 */
export function calculateExpirationDate(startDate: Date, duration: 'monthly' | 'quarterly' | 'annual'): Date {
  const endDate = new Date(startDate);
  if (duration === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (duration === 'quarterly') {
    endDate.setMonth(endDate.getMonth() + 3);
  } else if (duration === 'annual') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  return endDate;
}

/**
 * Récupère le statut d'abonnement actuel de l'utilisateur
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    planName: data.plan_name,
    status: data.status,
    startDate: data.start_date,
    endDate: data.end_date,
    createdAt: data.created_at
  } as Subscription;
}

/**
 * Vérifie si l'utilisateur a un abonnement actif
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  if (!sub) return false;
  if (sub.status !== 'active') return false;
  
  const endDate = new Date(sub.endDate);
  const now = new Date();
  
  // Mettre à jour le statut si expiré
  if (now > endDate) {
    await supabase.from('subscriptions').update({ status: 'expired' }).eq('id', sub.id);
    return false;
  }
  
  return true;
}

/**
 * Calcule le nombre de jours restants pour l'abonnement
 */
export function getDaysRemaining(endDateStr: string): number {
  if (!endDateStr) return 0;
  const endDate = new Date(endDateStr);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
