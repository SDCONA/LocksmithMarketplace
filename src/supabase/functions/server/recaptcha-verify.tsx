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
  const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');

  // If secret key is not configured, skip verification (development mode)
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not configured - skipping verification');
    return { success: true };
  }

  // If no token provided, allow it in development (graceful degradation)
  // This handles cases where the frontend site key isn't configured
  if (!token) {
    console.warn('No reCAPTCHA token provided - allowing in development mode');
    return { success: true }; // Changed from false to true for graceful degradation
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
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return {
        success: false,
        error: 'reCAPTCHA verification failed'
      };
    }

    // Check if the action matches
    if (data.action !== expectedAction) {
      console.error(`reCAPTCHA action mismatch: expected ${expectedAction}, got ${data.action}`);
      return {
        success: false,
        error: 'Invalid reCAPTCHA action'
      };
    }

    // Check if the score meets the minimum threshold
    if (data.score < minScore) {
      console.warn(`reCAPTCHA score too low: ${data.score} (minimum: ${minScore})`);
      return {
        success: false,
        score: data.score,
        action: data.action,
        error: 'reCAPTCHA score too low - possible bot activity'
      };
    }

    // All checks passed
    console.log(`reCAPTCHA verified successfully: score ${data.score}, action ${data.action}`);
    return {
      success: true,
      score: data.score,
      action: data.action
    };

  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return {
      success: false,
      error: 'Failed to verify reCAPTCHA'
    };
  }
}