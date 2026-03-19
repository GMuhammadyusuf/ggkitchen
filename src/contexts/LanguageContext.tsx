'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

type Language = 'en' | 'uz';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => {},
    t: (key: string, fallback?: string) => fallback || key,
    isLoading: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('app-language') as Language) || 'en';
        }
        return 'en';
    });

    const { data: translations, isLoading } = useTranslations();

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('app-language', lang);
        }
    }, []);

    // Build lookup map: key -> { en, uz }
    const translationMap = useCallback(
        (key: string, fallback?: string): string => {
            if (!translations) return fallback || key;
            const entry = translations.find((t: any) => t.key === key);
            if (!entry) return fallback || key;
            return entry[language] || fallback || key;
        },
        [translations, language]
    );

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                t: translationMap,
                isLoading,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
