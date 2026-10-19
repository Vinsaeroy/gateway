import { intlLocale, type Locale } from "./config";

/** Formata número no locale do sistema (ex: 1.234). */
export function formatNumber(value: number, locale: Locale): string {
    return value.toLocaleString(intlLocale[locale]);
}

/**
 * Formata moeda (IDR, gateway QRIS indonésio) no locale do sistema.
 * Valor monetário permanece em Rupiah; apenas formatação/moeda localizadas.
 */
export function formatCurrency(value: number, locale: Locale): string {
    return new Intl.NumberFormat(intlLocale[locale], {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}
