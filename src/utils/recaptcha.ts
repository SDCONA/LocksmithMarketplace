// reCAPTCHA v3 Utility
// Handles token generation for form submissions

// This will be loaded from the environment
export const RECAPTCHA_SITE_KEY = import.meta.env?.VITE_RECAPTCHA_SITE_KEY || '';

// Debug logging
if (RECAPTCHA_SITE_KEY) {
  console.log('[reCAPTCHA] Site key configured:', RECAPTCHA_SITE_KEY.substring(0, 10) + '...');
} else {
  console.log('[reCAPTCHA] Running in development mode - reCAPTCHA disabled. To enable, set VITE_RECAPTCHA_SITE_KEY in .env file.');
}

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
      // Skip loading if not configured - graceful degradation
      resolve(); // Don't fail, just skip
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
      console.error('Failed to load reCAPTCHA script');
      resolve(); // Don't fail the app, just skip reCAPTCHA
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
    // Check if site key is configured
    if (!RECAPTCHA_SITE_KEY) {
      resolve(''); // Return empty string if not configured
      return;
    }

    // Check if reCAPTCHA is loaded
    if (!window.grecaptcha) {
      resolve(''); // Return empty string if not loaded
      return;
    }

    // Wait for reCAPTCHA to be ready
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then((token: string) => {
          resolve(token);
        })
        .catch((error: any) => {
          console.error('reCAPTCHA execution error:', error);
          resolve(''); // Return empty string on error instead of rejecting
        });
    });
  });
}

// TypeScript declaration for grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}