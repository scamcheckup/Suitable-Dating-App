interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

interface PaymentData {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  currency: string;
  reference: string;
  callback_url?: string;
  metadata?: any;
  channels?: string[];
  plan?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number; // in kobo
  interval: 'monthly' | 'yearly';
  description: string;
  features: string[];
}

const PAYSTACK_CONFIG: PaystackConfig = {
  publicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_925d0ff30ca190ce05f37de36cd008db6e94817b',
  secretKey: process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY || 'sk_test_24•••••2de',
  baseUrl: 'https://api.paystack.co',
};

// Subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    amount: 250000, // ₦2,500 in kobo
    interval: 'monthly',
    description: 'Monthly premium subscription',
    features: [
      'Unlimited daily matches',
      'Advanced filters',
      'See who liked you',
      'Priority matching',
      'Read receipts'
    ]
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    amount: 2500000, // ₦25,000 in kobo
    interval: 'yearly',
    description: 'Yearly premium subscription (Save 17%)',
    features: [
      'Unlimited daily matches',
      'Advanced filters',
      'See who liked you',
      'Priority matching',
      'Read receipts',
      'Save 17% compared to monthly'
    ]
  }
];

// Generate unique payment reference
export const generatePaymentReference = (userId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `suitable_${userId.substring(0, 8)}_${timestamp}_${random}`;
};

// Initialize payment
export const initializePayment = async (paymentData: PaymentData): Promise<PaystackResponse> => {
  try {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      status: false,
      message: 'Failed to initialize payment',
    };
  }
};

// Verify payment
export const verifyPayment = async (reference: string): Promise<PaystackResponse> => {
  try {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      status: false,
      message: 'Failed to verify payment',
    };
  }
};

// Create subscription plan on Paystack
export const createSubscriptionPlan = async (plan: SubscriptionPlan): Promise<PaystackResponse> => {
  try {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: plan.name,
        amount: plan.amount,
        interval: plan.interval,
        description: plan.description,
        currency: 'NGN',
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      status: false,
      message: 'Failed to create subscription plan',
    };
  }
};

// Subscribe customer to plan
export const subscribeCustomer = async (
  email: string,
  planCode: string,
  authorization: string
): Promise<PaystackResponse> => {
  try {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: email,
        plan: planCode,
        authorization,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      status: false,
      message: 'Failed to create subscription',
    };
  }
};

// Cancel subscription
export const cancelSubscription = async (code: string, token: string): Promise<PaystackResponse> => {
  try {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/subscription/disable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        token,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      status: false,
      message: 'Failed to cancel subscription',
    };
  }
};

// Get customer subscriptions
export const getCustomerSubscriptions = async (customerCode: string): Promise<PaystackResponse> => {
  try {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/customer/${customerCode}/subscription`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      status: false,
      message: 'Failed to get subscriptions',
    };
  }
};

// Format amount from kobo to naira
export const formatAmount = (amountInKobo: number): string => {
  const naira = amountInKobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(naira);
};

// Web payment popup (for web platform)
export const openPaystackPopup = (paymentData: PaymentData, onSuccess: (reference: string) => void, onClose: () => void) => {
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.src = 'https://js.paystack.co/v1/inline.js';
  script.onload = () => {
    const handler = (window as any).PaystackPop.setup({
      key: PAYSTACK_CONFIG.publicKey,
      email: paymentData.email,
      amount: paymentData.amount,
      currency: paymentData.currency,
      ref: paymentData.reference,
      metadata: paymentData.metadata,
      callback: (response: any) => {
        onSuccess(response.reference);
      },
      onClose: onClose,
    });
    handler.openIframe();
  };
  document.head.appendChild(script);
};