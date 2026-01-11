
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { IntegrationSettings } from '../types';

export const MarketingScripts: React.FC = () => {
  const location = useLocation();
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);

  // 1. Load Settings
  useEffect(() => {
    const fetchSettings = async () => {
        const data = await dbService.getSettings();
        setSettings(data);
    };
    fetchSettings();
  }, []);

  // 2. Google Analytics (GA4) Injection
  useEffect(() => {
    if (settings?.googleAnalyticsId) {
      const scriptId = 'ga-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`;
        document.head.appendChild(script);

        const configScript = document.createElement('script');
        configScript.id = 'ga-config-script';
        configScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${settings.googleAnalyticsId}');
        `;
        document.head.appendChild(configScript);
      }
    }
  }, [settings?.googleAnalyticsId]);

  // 3. Google AdSense Script Injection
  useEffect(() => {
    if (settings?.googleAdSenseId) {
        const scriptId = 'adsense-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.async = true;
            script.crossOrigin = "anonymous";
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.googleAdSenseId}`;
            document.head.appendChild(script);
        }
    }
  }, [settings?.googleAdSenseId]);

  // 4. Facebook Pixel Injection & PageView Tracking
  useEffect(() => {
    if (settings?.facebookPixelId) {
      // Init Script
      const scriptId = 'fb-pixel-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${settings.facebookPixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
      } else {
        // If script already exists, just track page view on mount
        if (typeof window !== 'undefined' && (window as any).fbq) {
             (window as any).fbq('track', 'PageView');
        }
      }
    }
  }, [settings?.facebookPixelId]);

  // 5. Facebook Pixel Route Change Tracking
  useEffect(() => {
    if (settings?.facebookPixelId && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [location.pathname, settings?.facebookPixelId]);

  // 6. Google Search Console Verification
  useEffect(() => {
      if (settings?.googleSearchConsoleCode) {
          const metaId = 'gsc-verification';
          let meta = document.getElementById(metaId) as HTMLMetaElement;
          
          if (!meta) {
              meta = document.createElement('meta');
              meta.id = metaId;
              meta.name = 'google-site-verification';
              document.head.appendChild(meta);
          }
          
          meta.content = settings.googleSearchConsoleCode;
      }
  }, [settings?.googleSearchConsoleCode]);

  return null;
};
