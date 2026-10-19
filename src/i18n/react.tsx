"use client";

import * as React from "react";
import { defaultLocale, type Locale } from "./config";
import { createTranslate, mergeDict, type Dict, type TranslateFn } from "./translate";
import en from "./dictionaries/en";
import idDict from "./dictionaries/id";
import ptBR from "./dictionaries/pt-BR";

const dictionaries: Record<Locale, Dict> = {
    en,
    id: idDict,
    "pt-BR": ptBR,
};

interface I18nContextValue {
    locale: Locale;
    t: TranslateFn;
}

const I18nContext = React.createContext<I18nContextValue>({
    locale: defaultLocale,
    t: createTranslate(en, en, defaultLocale),
});

export function I18nProvider({
    locale: initialLocale = defaultLocale,
    children,
}: {
    locale?: Locale;
    children: React.ReactNode;
}) {
    const [locale] = React.useState<Locale>(initialLocale);

    const value = React.useMemo<I18nContextValue>(() => {
        const dict = dictionaries[locale] as Record<string, unknown> as ReturnType<() => Dict>;
        const merged = mergeDict(dict as never, dictionaries.en as never) as unknown as Dict;
        return {
            locale,
            t: createTranslate(merged, dictionaries.en, locale),
        };
    }, [locale]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
    return React.useContext(I18nContext);
}

export type { Locale, TranslateFn };
