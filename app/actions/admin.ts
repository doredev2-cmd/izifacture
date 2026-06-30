'use server';

import { supabaseAdmin } from '../../lib/supabase-admin';

/**
 * Ensures the service role key is configured.
 */
function checkAdminSetup() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('La clé SUPABASE_SERVICE_ROLE_KEY est manquante dans .env.local. L\'administration des utilisateurs est impossible.');
  }
}

export async function listAllUsers() {
  try {
    checkAdminSetup();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    
    // We return a sanitized list to the client
    return {
      users: data.users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name || 'Sans Nom',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        is_banned: !!u.banned_until,
        is_admin: u.user_metadata?.role === 'admin'
      })),
      error: null
    };
  } catch (error: any) {
    console.error('Error listing users:', error);
    return { users: [], error: error.message };
  }
}

export async function toggleBlockUser(userId: string, shouldBlock: boolean) {
  try {
    checkAdminSetup();
    
    // In Supabase, banning a user is done by updating 'ban_duration'
    // 'none' unbans them. '8760h' (1 year) is a common way to ban them indefinitely.
    const banDuration = shouldBlock ? '87600h' : 'none';
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: banDuration
    });
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error toggling block user:', error);
    return { success: false, error: error.message };
  }
}

export async function changeUserPassword(userId: string, newPassword: string) {
  try {
    checkAdminSetup();
    
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
    }
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error changing user password:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteUser(userId: string) {
  try {
    checkAdminSetup();
    
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}

export async function promoteToAdmin(userId: string, isAdmin: boolean) {
  try {
    checkAdminSetup();
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: isAdmin ? 'admin' : 'client' }
    });
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error promoting user:', error);
    return { success: false, error: error.message };
  }
}
