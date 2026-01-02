// reCAPTCHA v3 Server-side Verification Utility

/**
 * Verify a reCAPTCHA token with Google's API
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - The expected action (e.g., 'login', 'signup')
 * @param minScore - Minimum score threshold (0.0 to 1.0, default 0.5)
 * @returns Object with success status and details
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction: string,
  minScore: number = 0.5
): Promise<{
  success: boolean;
  score?: number;
  action?: string;
  error?: string;
}> {
  // Get the secret key from environment
  const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');

  // STRICT MODE: reCAPTCHA MUST be configured on server
  if (!secretKey) {
    console.error('[reCAPTCHA] RECAPTCHA_SECRET_KEY not configured - reCAPTCHA is REQUIRED!');
    return {
      success: false,
      error: 'reCAPTCHA not configured on server'
    };
  }

  // STRICT MODE: Token is REQUIRED
  if (!token) {
    console.error('[reCAPTCHA] No reCAPTCHA token provided');
    return { 
      success: false,
      error: 'reCAPTCHA token required'
    };
  }

  try {
    // Verify with Google's reCAPTCHA API
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    // Check if verification was successful
    if (!data.success) {
      const errorCodes = data['error-codes'] || [];
      console.error('[reCAPTCHA] Verification failed:', errorCodes);
      
      return {
        success: false,
        error: `reCAPTCHA verification failed: ${errorCodes.join(', ')}`
      };
    }

    // Check if the action matches
    if (data.action !== expectedAction) {
      console.error(`[reCAPTCHA] Action mismatch: expected ${expectedAction}, got ${data.action}`);
      return {
        success: false,
        error: 'Invalid reCAPTCHA action'
      };
    }

    // Check if the score meets the minimum threshold
    if (data.score < minScore) {
      console.warn(`[reCAPTCHA] Score too low: ${data.score} (minimum: ${minScore})`);
      return {
        success: false,
        score: data.score,
        action: data.action,
        error: 'reCAPTCHA score too low - possible bot activity'
      };
    }

    // All checks passed
    console.log(`[reCAPTCHA] ✅ Verification successful - action: ${data.action}, score: ${data.score}`);
    return {
      success: true,
      score: data.score,
      action: data.action
    };

  } catch (error) {
    console.error('[reCAPTCHA] Error verifying reCAPTCHA:', error);
    return {
      success: false,
      error: 'Failed to verify reCAPTCHA'
    };
  }
}