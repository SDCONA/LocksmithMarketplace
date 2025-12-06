/**
 * Utility function to copy text to clipboard with fallback
 * Handles cases where Clipboard API is blocked by permissions policy
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first (silently fail if blocked)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Silently fall through to execCommand fallback
      // Don't log the error since this is expected behavior in some environments
    }
  }

  // Fallback to older execCommand method
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      return true;
    } else {
      throw new Error('execCommand failed');
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}