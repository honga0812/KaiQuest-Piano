/**
 * Safari & iPadOS Public Share and Fullscreen URL Utilities
 * Resolves Google Cloud Run 401 Unauthorized errors when opening outside AI Studio
 */

export const PUBLIC_SHARED_APP_URL =
  'https://ais-pre-pniba4ma62jrlqxnkf3ljy-444990881338.asia-northeast1.run.app';

/**
 * Returns a public-safe URL that will never throw HTTP 401 Unauthorized in iPad Safari
 */
export function getPublicShareUrl(): string {
  if (typeof window === 'undefined') {
    return PUBLIC_SHARED_APP_URL;
  }

  const currentHref = window.location.href;

  // If running in development container (ais-dev), convert to public preview (ais-pre)
  if (currentHref.includes('ais-dev-')) {
    return currentHref.replace(/ais-dev-([a-zA-Z0-9_-]+)\.run\.app/, 'ais-pre-$1.run.app');
  }

  // If already on ais-pre or custom domain or localhost, use current URL
  return currentHref;
}

/**
 * Checks if the current page is running inside an ais-dev URL which may cause 401 in Safari
 */
export function isDevUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('ais-dev-');
}

/**
 * Checks if current browser is Apple Safari (iPadOS / iOS / macOS)
 */
export function isSafariOrApple(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isApple =
    /iPad|iPhone|iPod|Macintosh/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isApple;
}
