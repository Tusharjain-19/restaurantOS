import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // / to focus search (when not in input)
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const search = document.querySelector<HTMLInputElement>('[data-search-input]');
        search?.focus();
      }

      // Escape to close modals (handled by Radix, but also blur)
      if (e.key === 'Escape' && isInput) {
        (target as HTMLInputElement).blur();
      }

      // Ctrl shortcuts for POS
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n' && location.pathname !== '/pos') {
          e.preventDefault();
          navigate('/pos');
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, location.pathname]);
}
