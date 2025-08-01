import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-MMJBM8VXJ5', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};

export const trackEvent = (
  eventName: string,
  eventParams?: { [key: string]: any }
) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};