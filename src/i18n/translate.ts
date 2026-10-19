import type { Locale } from "./config";

export type DictNode = { [key: string]: string | DictNode };
export type Dict = { [namespace: string]: DictNode };

/** Merge recursivo: fallback preenche chaves ausentes em primary. */
export function mergeDict(primary: DictNode, fallback: DictNode): DictNode {
    const out: DictNode = { ...fallback };
    for (const [k, v] of Object.entries(primary)) {
        const fb = out[k];
        if (typeof v === "object" && v !== null && typeof fb === "object" && fb !== null) {
            out[k] = mergeDict(v, fb);
        } else {
            out[k] = v;
        }
    }
    return out;
}

function lookup(dict: DictNode, path: string[]): string | undefined {
    let node: string | DictNode | undefined = dict;
    for (const seg of path) {
        if (typeof node !== "object" || node === null) return undefined;
        node = node[seg];
    }
    return typeof node === "string" ? node : undefined;
}

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * Resolve chave dot-separated ("billing.title") no dicionário.
 * Fallback: dicionário do idioma → en → própria chave.
 * Interpolação: placeholders {name} no texto.
 */
export function createTranslate(dict: Dict, fallback: Dict, locale: Locale): TranslateFn {
    return (key, params) => {
        const path = key.split(".");
        const raw = lookup(dict, path) ?? lookup(fallback, path) ?? key;
        if (!params) return raw;
        return raw.replace(/\{(\w+)\}/g, (m, name) =>
            params[name] !== undefined ? String(params[name]) : m
        );
    };
}
