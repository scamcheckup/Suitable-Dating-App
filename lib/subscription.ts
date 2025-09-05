import { supabase } from './supabase';
import { updateUserProfile } from './auth';
import { 
  initializePayment, 
  verifyPayment, 
  subscribeCustomer, 
  cancelSubscription,
  generatePaymentReference,
  SUBSCRIPTION_PLANS 
} from './paystack';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  paystack_subscription_code?: string;
  paystack_customer_code?: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  subscription_id?: string;
  paystack_reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  payment_method: string;
  created_at: string;
}

// Create subscription record in database
export const createSubscriptionRecord = async (
  userId: string,
  planId: string,
  paystackData?: any
): Promise<{ subscription: UserSubscription | null; error: any }> => {
  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    const currentDate = new Date();
    const endDate = new Date();
    
    if (plan.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        paystack_subscription_code: paystackData?.subscription_code,
        paystack_customer_code: paystackData?.customer_code,
        status: 'active',
        current_period_start: currentDate.toISOString(),
        current_period_end: endDate.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update user premium status
    await updateUserProfile(userId, { is_premium: true });

    return { subscription: data, error: null };
  } catch (error) {
    return { subscription: null, error };
  }
};

// Create payment record
export const createPaymentRecord = async (
  userId: string,
  reference: string,
  amount: number,
  subscriptionId?: string
): Promise<{ payment: PaymentRecord | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        paystack_reference: reference,
        amount,
        currency: 'NGN',
        status: 'pending',
        payment_method: 'paystack',
      })
      .select()
      .single();

    if (error) throw error;
    return { payment: data, error: null };
  } catch (error) {
    return { payment: null, error };
  }
};

// Update payment status
export const updatePaymentStatus = async (
  reference: string,
  status: 'success' | 'failed'
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('payments')
      .update({ status })
      .eq('paystack_reference', reference);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Get user's active subscription
export const getUserSubscription = async (userId: string): Promise<{ subscription: UserSubscription | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return { subscription: data, error: null };
  } catch (error) {
    return { subscription: null, error };
  }
};

// Process premium upgrade
export const processPremiumUpgrade = async (
  userId: string,
  userEmail: string,
  planId: string
): Promise<{ success: boolean; paymentUrl?: string; error?: string }> => {
  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      return { success: false, error: 'Invalid plan selected' };
    }

    const reference = generatePaymentReference(userId);
    
    // Create payment record
    await createPaymentRecord(userId, reference, plan.amount);

    // Initialize payment with Paystack
    const paymentData = {
      email: userEmail,
      amount: plan.amount,
      currency: 'NGN',
      reference,
      callback_url: `${window.location.origin}/payment/callback`,
      metadata: {
        user_id: userId,
        plan_id: planId,
        plan_name: plan.name,
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    };

    const response = await initializePayment(paymentData);

    if (response.status && response.data?.authorization_url) {
      return { 
        success: true, 
        paymentUrl: response.data.authorization_url 
      };
    } else {
      return { 
        success: false, 
        error: response.message || 'Failed to initialize payment' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'An unexpected error occurred' 
    };
  }
};

// Verify and complete payment
export const verifyAndCompletePayment = async (reference: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify payment with Paystack
    const verification = await verifyPayment(reference);

    if (!verification.status || verification.data?.status !== 'success') {
      await updatePaymentStatus(reference, 'failed');
      return { success: false, error: 'Payment verification failed' };
    }

    // Update payment status
    await updatePaymentStatus(reference, 'success');

    // Get payment record to get user and plan info
    const { data: payment } = await supabase
      .from('payments')
      .select('user_id, amount')
      .eq('paystack_reference', reference)
      .single();

    if (!payment) {
      return { success: false, error: 'Payment record not found' };
    }

    // Determine plan based on amount
    const plan = SUBSCRIPTION_PLANS.find(p => p.amount === payment.amount);
    if (!plan) {
      return { success: false, error: 'Invalid plan amount' };
    }

    // Create subscription record
    const { subscription, error } = await createSubscriptionRecord(
      payment.user_id,
      plan.id,
      {
        customer_code: verification.data?.customer?.customer_code,
        subscription_code: verification.data?.reference,
      }
    );

    if (error) {
      return { success: false, error: 'Failed to create subscription' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Cancel user subscription
export const cancelUserSubscription = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { subscription } = await getUserSubscription(userId);
    
    if (!subscription) {
      return { success: false, error: 'No active subscription found' };
    }

    // Cancel with Paystack if we have subscription code
    if (subscription.paystack_subscription_code) {
      await cancelSubscription(subscription.paystack_subscription_code, '');
    }

    // Update subscription status in database
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscription.id);

    if (error) throw error;

    // Update user premium status
    await updateUserProfile(userId, { is_premium: false });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to cancel subscription' };
  }
};

// Check and update expired subscriptions
export const checkExpiredSubscriptions = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    // Get expired subscriptions
    const { data: expiredSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('id, user_id')
      .eq('status', 'active')
      .lt('current_period_end', now);

    if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      // Update expired subscriptions
      const subscriptionIds = expiredSubscriptions.map(sub => sub.id);
      const userIds = expiredSubscriptions.map(sub => sub.user_id);

      await supabase
        .from('user_subscriptions')
        .update({ status: 'expired' })
        .in('id', subscriptionIds);

      // Update users' premium status
      for (const userId of userIds) {
        await updateUserProfile(userId, { is_premium: false });
      }
    }
  } catch (error) {
    console.error('Failed to check expired subscriptions:', error);
  }
};