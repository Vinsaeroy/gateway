import en from "../src/i18n/dictionaries/en";
import id from "../src/i18n/dictionaries/id";
import pt from "../src/i18n/dictionaries/pt-BR";

function leaves(obj: any, prefix = ""): string[] {
    return Object.entries(obj).flatMap(([k, v]) =>
        typeof v === "object" && v !== null ? leaves(v, `${prefix}${k}.`) : [`${prefix}${k}`]
    );
}

const sets = { en: new Set(leaves(en)), id: new Set(leaves(id)), "pt-BR": new Set(leaves(pt)) };
let ok = true;
for (const loc of ["id", "pt-BR"] as const) {
    for (const k of sets.en) if (!sets[loc].has(k)) { console.log(`MISSING in ${loc}: ${k}`); ok = false; }
    for (const k of sets[loc]) if (!sets.en.has(k)) { console.log(`EXTRA in ${loc}: ${k}`); ok = false; }
}
console.log(`en=${sets.en.size} id=${sets.id.size} pt-BR=${sets["pt-BR"].size} parity=${ok ? "OK" : "FAIL"}`);
