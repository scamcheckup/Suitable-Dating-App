interface VerificationResponse {
  success: boolean;
  message: string;
}

const KUDISMS_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_KUDISMS_API_KEY || '',
  endpoint: process.env.EXPO_PUBLIC_KUDISMS_API_ENDPOINT || '',
  senderId: process.env.EXPO_PUBLIC_KUDISMS_SENDER_ID || 'Suitable',
};

export const startPhoneVerification = async (phoneNumber: string): Promise<VerificationResponse> => {
  try {
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code temporarily (in production, use Redis or similar)
    localStorage.setItem(`verification_${phoneNumber}`, verificationCode);
    localStorage.setItem(`verification_${phoneNumber}_timestamp`, Date.now().toString());
    
    // Send SMS via Kudisms (placeholder implementation)
    const message = `Your Suitable verification code is: ${verificationCode}. Valid for 10 minutes.`;
    
    // For now, we'll simulate the SMS sending
    // In production, you would make an actual API call to Kudisms
    console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
    
    return {
      success: true,
      message: 'Verification code sent successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to send verification code',
    };
  }
};

export const verifyPhoneCode = async (phoneNumber: string, code: string): Promise<VerificationResponse> => {
  try {
    const storedCode = localStorage.getItem(`verification_${phoneNumber}`);
    const timestamp = localStorage.getItem(`verification_${phoneNumber}_timestamp`);
    
    if (!storedCode || !timestamp) {
      return {
        success: false,
        message: 'No verification code found. Please request a new one.',
      };
    }
    
    // Check if code is expired (10 minutes)
    const codeAge = Date.now() - parseInt(timestamp);
    if (codeAge > 10 * 60 * 1000) {
      localStorage.removeItem(`verification_${phoneNumber}`);
      localStorage.removeItem(`verification_${phoneNumber}_timestamp`);
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      };
    }
    
    if (storedCode === code) {
      // Clean up stored code
      localStorage.removeItem(`verification_${phoneNumber}`);
      localStorage.removeItem(`verification_${phoneNumber}_timestamp`);
      
      return {
        success: true,
        message: 'Phone number verified successfully',
      };
    } else {
      return {
        success: false,
        message: 'Invalid verification code. Please try again.',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to verify code',
    };
  }
};