# Convenções i18n — WA-AKG

## Infraestrutura (já existente — NÃO modificar)

- `src/i18n/config.ts` — locales: `"en" | "id" | "pt-BR"`, labels, intl tags.
- `src/i18n/translate.ts` — motor de tradução (merge + fallback en + interpolação `{var}`).
- `src/i18n/react.tsx` — `I18nProvider` + `useTranslation()` (client).
- `src/i18n/server.ts` — `getT()` / `getServerLocale()` (server components async).
- `src/i18n/format.ts` — `formatNumber(value, locale)` e `formatCurrency(value, locale)` (IDR).
- Dicionários: `src/i18n/dictionaries/{en,id,pt-BR}/<namespace>.ts` + `index.ts` (não editar index.ts).

## Como traduzir um componente client

```tsx
import { useTranslation } from "@/i18n/react";

export function Foo() {
    const { t, locale } = useTranslation();
    return <h1>{t("billing.title")}</h1>;
}
```

Em handlers (toasts): `toast.success(t("billing.checkoutOk"))`.

## Como traduzir um componente server (async)

```tsx
import { getT } from "@/i18n/server";

export default async function Page() {
    const t = await getT();
    return <h1>{t("landing.title")}</h1>;
}
```

## Regras

1. Extrair TODAS as strings visíveis ao usuário: JSX text, placeholders, títulos, toasts, aria-labels, cabeçalhos de tabela, estados vazios, textos de confirmação/diálogo, labels de botão.
2. NÃO traduzir: marca "WA-AKG", valores de API/DB (plan IDs, status), JIDs do WhatsApp, mensagens de log/console, comentários de código.
3. Chaves: namespace no topo, aninhadas por feature, ex.: `t("billing.usage.daily")`. Objetos em pt: usar chaves descritivas em inglês.
4. Todos os 3 arquivos de dicionário (`en`, `id`, `pt-BR`) devem ter o MESMO conjunto de chaves.
   - `en`: inglês (texto original atual do código).
   - `id`: Bahasa Indonesia natural.
   - `pt-BR`: português brasileiro natural.
5. Manter `as const;` e `export default <ns>;` no dicionário.
6. Números: substituir `x.toLocaleString("id-ID")` por `formatNumber(x, locale)` de `@/i18n/format` (locale vem do `useTranslation()`). Moeda: `formatCurrency(x, locale)`.
7. Nomes de planos que vêm do banco/plans.ts (ex: plan.name) NÃO devem ser traduzidos no componente — exibem como vêm.
8. Comportamento do código inalterado — só textos saem do dicionário.
9. Cada namespace tem DONO único — não edite namespaces/arquivos de outras áreas.
10. Não rodar build/tsc (validação final é do integrador).
