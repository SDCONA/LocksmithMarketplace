// reCAPTCHA v3 Utility
// Handles token generation for form submissions

// USING GOOGLE TEST KEYS FOR DEVELOPMENT
// These test keys work on ALL domains including Figma Make
// ⚠️ IMPORTANT: Replace with real keys before production deployment!
// Get real keys from: https://www.google.com/recaptcha/admin
const HARDCODED_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // ← Google's official test site key (always passes)

// This will be loaded from the environment OR use the hardcoded key
export const RECAPTCHA_SITE_KEY = import.meta.env?.VITE_RECAPTCHA_SITE_KEY || HARDCODED_SITE_KEY;

// Debug logging
if (RECAPTCHA_SITE_KEY) {
  console.log('[reCAPTCHA] Site key configured:', RECAPTCHA_SITE_KEY.substring(0, 10) + '...');
  if (RECAPTCHA_SITE_KEY === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI') {
    console.warn('[reCAPTCHA] ⚠️ USING TEST KEYS - Replace with real keys for production!');
  }
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
  console.log(`[reCAPTCHA] Executing for action: ${action}`);
  
  // Ensure reCAPTCHA is loaded first
  await loadRecaptchaScript();

  return new Promise((resolve, reject) => {
    // Check if site key is configured
    if (!RECAPTCHA_SITE_KEY) {
      console.log('[reCAPTCHA] No site key configured - skipping verification');
      resolve(''); // Return empty string if not configured
      return;
    }

    // Check if reCAPTCHA is loaded
    if (!window.grecaptcha) {
      console.warn('[reCAPTCHA] Script not loaded - skipping verification');
      resolve(''); // Return empty string if not loaded
      return;
    }

    // Wait for reCAPTCHA to be ready
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then((token: string) => {
          console.log('[reCAPTCHA] Token received successfully');
          resolve(token);
        })
        .catch((error: any) => {
          console.error('[reCAPTCHA] Execution error:', error);
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