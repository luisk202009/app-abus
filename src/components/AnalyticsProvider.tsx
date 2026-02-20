import { useEffect, type ReactNode } from "react";

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  useEffect(() => {
    // Initialize dataLayer for GTM
    window.dataLayer = window.dataLayer || [];

    // --- Google Tag Manager (placeholder) ---
    // Replace YOUR_GTM_ID with your actual GTM container ID
    const gtmId = "YOUR_GTM_ID";
    if (gtmId !== "YOUR_GTM_ID") {
      const gtmScript = document.createElement("script");
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(gtmScript);
    }

    // --- Meta Pixel (placeholder) ---
    // Replace YOUR_PIXEL_ID with your actual Meta Pixel ID
    const pixelId = "YOUR_PIXEL_ID";
    if (pixelId !== "YOUR_PIXEL_ID") {
      const fbScript = document.createElement("script");
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    console.log("[Albus Analytics] Provider initialized (GTM & Meta Pixel placeholders ready)");
  }, []);

  return <>{children}</>;
};
