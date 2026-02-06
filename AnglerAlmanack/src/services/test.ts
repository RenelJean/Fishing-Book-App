import { supabase } from './supabaseClient';

export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('trophies')
      .select('count()', { count: 'exact' });
    
    if (error) throw error;
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}