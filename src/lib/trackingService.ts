// Albus Conversion Tracking Service
// Centralizes event logging for GTM, Meta Pixel, and console

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

export const trackEvent = (eventName: string, metadata?: Record<string, unknown>) => {
  // Console log for development
  console.log(`[Albus Track] ${eventName}`, metadata || {});

  // GTM dataLayer
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...metadata });
  }

  // Meta Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, metadata);
  }
};
