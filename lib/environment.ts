// Environment configuration and validation
export const ENV_CONFIG = {
  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Cloudflare R2
  R2_ENDPOINT: process.env.EXPO_PUBLIC_R2_ENDPOINT || '',
  R2_BUCKET: process.env.EXPO_PUBLIC_R2_BUCKET || '',
  R2_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_ACCESS_KEY || '',
  R2_SECRET_KEY: process.env.EXPO_PUBLIC_R2_SECRET_KEY || '',
  
  // Kudisms SMS
  KUDISMS_API_KEY: process.env.EXPO_PUBLIC_KUDISMS_API_KEY || '',
  KUDISMS_ENDPOINT: process.env.EXPO_PUBLIC_KUDISMS_API_ENDPOINT || '',
  KUDISMS_SENDER_ID: process.env.EXPO_PUBLIC_KUDISMS_SENDER_ID || 'Suitable',
};

export const validateEnvironment = (): { valid: boolean; missing: string[] } => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'R2_ENDPOINT',
    'R2_BUCKET',
    'R2_ACCESS_KEY',
    'R2_SECRET_KEY',
  ];
  
  const missing = required.filter(key => !ENV_CONFIG[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
};

export const getEnvironmentStatus = () => {
  const validation = validateEnvironment();
  
  return {
    supabase: {
      configured: !!(ENV_CONFIG.SUPABASE_URL && ENV_CONFIG.SUPABASE_ANON_KEY),
      url: ENV_CONFIG.SUPABASE_URL ? '✅ Configured' : '❌ Missing',
      key: ENV_CONFIG.SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing',
    },
    r2: {
      configured: !!(ENV_CONFIG.R2_ENDPOINT && ENV_CONFIG.R2_BUCKET && ENV_CONFIG.R2_ACCESS_KEY && ENV_CONFIG.R2_SECRET_KEY),
      endpoint: ENV_CONFIG.R2_ENDPOINT ? '✅ Configured' : '❌ Missing',
      bucket: ENV_CONFIG.R2_BUCKET ? '✅ Configured' : '❌ Missing',
      credentials: (ENV_CONFIG.R2_ACCESS_KEY && ENV_CONFIG.R2_SECRET_KEY) ? '✅ Configured' : '❌ Missing',
    },
    sms: {
      configured: !!(ENV_CONFIG.KUDISMS_API_KEY && ENV_CONFIG.KUDISMS_ENDPOINT),
      apiKey: ENV_CONFIG.KUDISMS_API_KEY ? '✅ Configured' : '❌ Missing (Optional)',
      endpoint: ENV_CONFIG.KUDISMS_ENDPOINT ? '✅ Configured' : '❌ Missing (Optional)',
    },
    overall: validation.valid,
    missing: validation.missing,
  };
};