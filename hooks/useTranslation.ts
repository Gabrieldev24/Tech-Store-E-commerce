'use client';

import { useLanguage } from '@/lib/context/LanguageContext';
import { translations } from '@/lib/translations';

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: string, ...args: any[]): string => {
    const translationObj = translations[language];
    let translation = (translationObj as any)[key];
    
    if (typeof translation === 'function') {
      return translation(...args);
    }
    
    return translation || key;
  };
  
  return { t, language };
}
