// Configuração central de idiomas do sistema.
// Idioma é configurado GLOBALMENTE pelo SUPERADMIN em SystemConfig.language.

export const locales = ["en", "id", "pt-BR"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: unknown): value is Locale {
    return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Labels exibidos no seletor de idioma das configurações. */
export const localeLabels: Record<Locale, string> = {
    en: "English",
    id: "Bahasa Indonesia",
    "pt-BR": "Português (Brasil)",
};

/** Tag BCP-47 para Intl. */
export const intlLocale: Record<Locale, string> = {
    en: "en-US",
    id: "id-ID",
    "pt-BR": "pt-BR",
};
