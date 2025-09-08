// d:\Mini\Finance\src\services\paymentService.js
// Handles Razorpay checkout integration

import { supabase } from '../lib/supabase';

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payments`;
const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Load Razorpay checkout script once
let razorpayScriptLoaded = false;
async function loadRazorpayScript() {
  if (razorpayScriptLoaded) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => { razorpayScriptLoaded = true; resolve(true); };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Check if payment system is properly configured
function isPaymentSystemConfigured() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  
  // Check if we have valid configuration (not just placeholder values)
  return supabaseUrl && 
         supabaseKey && 
         razorpayKey &&
         !supabaseUrl.includes('your_') &&
         !supabaseKey.includes('your_') &&
         !razorpayKey.includes('your_');
}

// Create order on backend (via invoke to avoid CORS)
export async function createOrder({ amount, userId, expenseId, description }) {
  try {
    // Check if payment system is properly configured
    if (!isPaymentSystemConfigured()) {
      throw new Error('Payment system not configured. Running in demo mode.');
    }

    const { data, error } = await supabase.functions.invoke('payments', {
      body: { amount, userId, expenseId, description, currency: 'INR' },
      headers: { 'Content-Type': 'application/json' },
    });

    if (error) {
      throw new Error(error.message || 'Failed to create order');
    }

    // When our function returns { success, order }
    if (data?.success && data?.order) return data;

    // When our minimal function returns Razorpay order directly
    if (data?.id) return { success: true, order: data };

    throw new Error('Unexpected response from payments function');
  } catch (err) {
    console.error('createOrder error:', err);
    throw err;
  }
}

// Open Razorpay Checkout and verify payment
export async function payWithRazorpay({ order, user, expense }) {
  // Check if payment system is properly configured
  if (!isPaymentSystemConfigured()) {
    throw new Error('Payment gateway not configured. Running in demo mode.');
  }

  const scriptOk = await loadRazorpayScript();
  if (!scriptOk) throw new Error('Failed to load Razorpay');

  return new Promise((resolve, reject) => {
    const options = {
      key: RZP_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'ExpenseAI',
      description: expense?.description || 'Expense Payment',
      order_id: order.id,
      prefill: {
        name: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      },
      notes: {
        expenseId: expense?.id || '',
        userId: user?.id || ''
      },
      theme: { color: '#22c55e' },
      handler: async (response) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token || ANON_KEY;
          const { data, error } = await supabase.functions.invoke('payments', {
            body: { action: 'verify', ...response },
            headers: { 'Content-Type': 'application/json' },
          });
          if (error || !data?.success) return reject(new Error((error?.message) || data?.message || 'Verification failed'));
          resolve(data);
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });
}