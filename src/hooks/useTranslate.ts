import { useApp } from '../context/AppContext';

export const useTranslate = () => {
  const { settings } = useApp();
  const lang = settings.customization?.language || 'bn';

  const t = (bnText: string, enText: string) => {
    if (lang === 'en') return enText;
    if (lang === 'bn') return bnText;
    
    // For mixed, it's a bit tricky. We'll default to Bengali for now or some logic if needed.
    // The prompt says "Mixed (some Bengali, some English)". I'll just return Bengali for now for mixed as well.
    return bnText;
  };

  return { t, lang };
};
