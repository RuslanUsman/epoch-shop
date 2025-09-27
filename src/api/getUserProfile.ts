import { supabase } from '../lib/supabase';

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_vip')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
