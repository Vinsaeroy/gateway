import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale, type Locale } from "./config";
import { createTranslate, mergeDict, type Dict, type TranslateFn } from "./translate";
import en from "./dictionaries/en";
import idDict from "./dictionaries/id";
import ptBR from "./dictionaries/pt-BR";

const dictionaries: Record<Locale, Dict> = {
    en,
    id: idDict,
    "pt-BR": ptBR,
};

// Cache curto em memória: evitar leitura de DB a cada request.
// Ao trocar idioma nas configurações, o efeito aparece em ~30s ou no restart.
let cached: { locale: Locale; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

export async function getServerLocale(): Promise<Locale> {
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.locale;
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: "default" },
            select: { language: true },
        });
        const locale = isLocale(config?.language) ? config.language : defaultLocale;
        cached = { locale, at: Date.now() };
        return locale;
    } catch {
        return cached?.locale ?? defaultLocale;
    }
}

/** Tradução para componentes server: const t = await getT(); t("landing.title") */
export async function getT(): Promise<TranslateFn> {
    const locale = await getServerLocale();
    const merged = mergeDict(dictionaries[locale] as never, dictionaries.en as never) as unknown as Dict;
    return createTranslate(merged, dictionaries.en, locale);
}

/** Dicionário completo do idioma atual (mesclado com en) para uso direto. */
export async function getDict(): Promise<Dict> {
    const locale = await getServerLocale();
    return mergeDict(dictionaries[locale] as never, dictionaries.en as never) as unknown as Dict;
}

export type { Locale, TranslateFn };
