// reCAPTCHA v3 Utility
// Handles token generation for form submissions

// Get reCAPTCHA site key from environment
// You must set VITE_RECAPTCHA_SITE_KEY in your environment
// Get your own keys from: https://www.google.com/recaptcha/admin
export const RECAPTCHA_SITE_KEY = import.meta.env?.VITE_RECAPTCHA_SITE_KEY || '';

let isRecaptchaLoaded = false;

/**
 * Load the reCAPTCHA script dynamically
 */
export function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isRecaptchaLoaded) {
      resolve();
      return;
    }

    if (!RECAPTCHA_SITE_KEY) {
      // STRICT MODE: reCAPTCHA is REQUIRED
      console.error('[reCAPTCHA] RECAPTCHA_SITE_KEY is not configured - this is required!');
      reject(new Error('reCAPTCHA site key not configured'));
      return;
    }

    // Check if already loaded
    if (window.grecaptcha) {
      isRecaptchaLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isRecaptchaLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      console.error('[reCAPTCHA] Failed to load reCAPTCHA script');
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Execute reCAPTCHA and get a token
 * @param action - The action name (e.g., 'login', 'signup')
 * @returns Promise with the reCAPTCHA token
 */
export async function executeRecaptcha(action: string): Promise<string> {
  // Ensure reCAPTCHA is loaded first
  await loadRecaptchaScript();

  return new Promise((resolve, reject) => {
    // STRICT MODE: Check if site key is configured
    if (!RECAPTCHA_SITE_KEY) {
      const error = 'reCAPTCHA site key not configured';
      console.error(`[reCAPTCHA] ${error}`);
      reject(new Error(error));
      return;
    }

    // STRICT MODE: Check if reCAPTCHA is loaded
    if (!window.grecaptcha) {
      const error = 'reCAPTCHA script not loaded';
      console.error(`[reCAPTCHA] ${error}`);
      reject(new Error(error));
      return;
    }

    // Wait for reCAPTCHA to be ready
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then((token: string) => {
          if (!token) {
            reject(new Error('reCAPTCHA failed to generate token'));
            return;
          }
          resolve(token);
        })
        .catch((error: any) => {
          console.error('[reCAPTCHA] Execution error:', error);
          reject(error);
        });
    });
  });
}