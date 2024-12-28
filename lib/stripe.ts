import { supabase } from './supabase';

export const createSetupIntent = async () => {
  try {
    const { data, error } = await supabase.rpc('create_setup_intent');
    
    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }
    
    if (!data?.clientSecret) {
      console.error('No client secret in response:', data);
      throw new Error('Invalid response from Stripe');
    }
    
    return { clientSecret: data.clientSecret };
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw error;
  }
};

export const deletePaymentMethod = async (paymentMethodId: string) => {
  try {
    const { data, error } = await supabase.rpc('delete_payment_method', {
      payment_method_id: paymentMethodId
    });
    
    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};