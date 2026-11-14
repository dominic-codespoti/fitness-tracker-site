import { STORE_LINKS } from '~/utils/storeLinks';

// Client-side store routing, iPhone-first (iOS users convert 3-5x better than Android, RevenueCat Nov 2026).
// - <html data-platform="ios|android|desktop"> lets CSS show only the visitor's own store badge on phones.
// - a[data-store-auto] links point at the visitor's store: Play on Android, the App Store everywhere else.
// - Every click on a[data-store] sends a GA4 `store_click` event with the store, placement and platform.

type Platform = 'ios' | 'android' | 'desktop';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __storeRouting?: boolean;
  }
}

const detect = (): Platform => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  // iPadOS reports itself as a Mac; touch support gives it away
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'desktop';
};

export const initStoreRouting = (): void => {
  if (window.__storeRouting) return;
  window.__storeRouting = true;

  const platform = detect();
  document.documentElement.dataset.platform = platform;

  document.querySelectorAll<HTMLAnchorElement>('a[data-store-auto]').forEach((a) => {
    const store = platform === 'android' ? 'android' : 'ios';
    a.href = STORE_LINKS[store];
    a.dataset.store = store;
  });

  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[data-store]');
    if (!link) return;
    window.gtag?.('event', 'store_click', {
      store: link.dataset.store,
      placement: link.dataset.placement ?? 'unknown',
      platform,
    });
  });
};
