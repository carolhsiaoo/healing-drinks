import { useEffect } from 'react';
import { audioService } from '../services/audioService';

export function useExternalLinkHandler() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        // Check if it's an external link
        const isExternal = !link.href.startsWith(window.location.origin) && 
                          !link.href.startsWith('/') &&
                          !link.href.startsWith('#');
        
        if (isExternal) {
          console.log('[ExternalLinkHandler] External link clicked:', link.href);
          // Always pause music for external links
          // The visibility/focus events will handle resuming when coming back
          audioService.handleExternalLinkClick();
        }
      }
    };

    // Add event listener to capture all link clicks
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);
}