import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateExpirationDate } from '@/lib/subscription';

// Ce webhook est appelé par l'agrégateur de paiement (ex: CinetPay, PayCard, API Orange Money directe)
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Log basic info for debugging (in production, secure this)
    console.log('Webhook reçu:', payload);

    // TODO: VERIFICATION DE SIGNATURE (HMAC / Token)
    // Extraire la signature depuis les headers (ex: request.headers.get('x-signature'))
    // et vérifier que le payload correspond bien à votre secret API.
    
    // Structure simulée d'un webhook générique
    const { 
      transaction_id, 
      status, 
      amount, 
      currency, 
      method, 
      user_id, 
      plan_name, 
      duration 
    } = payload;

    if (!transaction_id || !user_id || !status) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    // Prévenir les doubles traitements (idempotence)
    const { data: existingTx } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_id', transaction_id)
      .single();

    if (existingTx) {
      return NextResponse.json({ message: 'Transaction déjà traitée' }, { status: 200 });
    }

    // 1. Enregistrer la transaction
    const { error: txError } = await supabase.from('payments').insert([{
      user_id,
      transaction_id,
      amount,
      currency: currency || 'GNF',
      method: method || 'Mobile Money',
      status: status === 'success' ? 'completed' : 'failed'
    }]);

    if (txError) {
      console.error('Erreur insertion paiement:', txError);
      return NextResponse.json({ error: 'Erreur interne de base de données' }, { status: 500 });
    }

    // 2. Si le paiement est un succès, activer/mettre à jour l'abonnement
    if (status === 'success') {
      const startDate = new Date();
      // duration attendue : 'monthly', 'quarterly', 'annual'
      const endDate = calculateExpirationDate(startDate, duration || 'monthly');

      // Chercher si l'utilisateur a déjà un abonnement actif
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id, end_date')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSub) {
        // Mise à jour de l'abonnement existant
        // Si l'abonnement est toujours actif, on ajoute la nouvelle durée à la fin actuelle
        const currentEnd = new Date(existingSub.end_date);
        let newStartDate = startDate;
        
        if (currentEnd > startDate) {
            newStartDate = currentEnd;
        }
        
        const finalEndDate = calculateExpirationDate(newStartDate, duration || 'monthly');

        await supabase.from('subscriptions').update({
          plan_name: plan_name || 'Pro',
          status: 'active',
          start_date: startDate.toISOString(), // on met à jour la date de début au paiement actuel
          end_date: finalEndDate.toISOString()
        }).eq('id', existingSub.id);
      } else {
        // Création d'un nouvel abonnement
        await supabase.from('subscriptions').insert([{
          user_id,
          plan_name: plan_name || 'Pro',
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }]);
      }
    }

    return NextResponse.json({ message: 'Webhook traité avec succès' }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur Webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
