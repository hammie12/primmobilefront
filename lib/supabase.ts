import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Add helper functions for payment transactions
export const checkExistingTransaction = async (transactionId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select('transaction_id')
    .eq('transaction_id', transactionId)
    .single();

  // Handle "no rows returned" error differently than other errors
  if (error && error.code === 'PGRST116') {
    return false;
  }

  if (error) {
    console.error('Error checking transaction:', error);
    throw error;
  }

  return true;
};

export const checkExistingPayment = async (transactionId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id, status, booking_id, amount, payment_method, transaction_id')
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { exists: false, data: null };
      }
      throw error;
    }

    return { exists: true, data };
  } catch (error) {
    console.error('Error checking payment:', error);
    throw error;
  }
};

export const createOrRetrievePayment = async (paymentData: {
  transaction_id: string;
  booking_id: string;
  amount: number;
  payment_method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
  [key: string]: any;
}): Promise<PaymentResponse> => {
  try {
    // First check if payment exists
    const { exists, data: existingPayment } = await checkExistingPayment(paymentData.transaction_id);
    
    if (exists) {
      // Payment already exists, return it with success status
      return {
        data: existingPayment,
        error: null
      };
    }

    // If payment doesn't exist, try to create it
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        transaction_id: paymentData.transaction_id,
        booking_id: paymentData.booking_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) {
      // Handle race condition where payment was created between our check and insert
      if (error.code === '23505') {
        const { data: racePayment } = await checkExistingPayment(paymentData.transaction_id);
        return {
          data: racePayment,
          error: null
        };
      }

      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          status: 500
        }
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to create payment record',
        code: error.code || 'UNKNOWN_ERROR',
        status: 500
      }
    };
  }
};

export const updatePaymentStatus = async (
  transactionId: string,
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
): Promise<PaymentResponse> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          status: 500
        }
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Payment status update error:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to update payment status',
        code: error.code || 'UNKNOWN_ERROR',
        status: 500
      }
    };
  }
};

// Update the type definition
export type PaymentResponse = {
  data: {
    id: string;
    booking_id: string;
    amount: number;
    payment_method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transaction_id: string;
    created_at?: string;
    updated_at?: string;
  } | null;
  error: {
    message: string;
    code: string;
    status: number;
  } | null;
};
