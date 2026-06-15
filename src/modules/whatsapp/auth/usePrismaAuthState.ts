import { prisma } from "@/lib/prisma";
import { AuthenticationCreds, AuthenticationState, BufferJSON, initAuthCreds, proto, SignalDataTypeMap } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";
import crypto from "crypto";

// ============================================================
// ENKRIPSI AT-REST untuk kredensial Baileys (AuthState).
// ------------------------------------------------------------
// Kredensial sesi WhatsApp = kunci untuk "menjadi" akun WA itu. Kalau DB bocor
// dan creds disimpan plaintext, penyerang bisa membajak sesi WhatsApp.
// Maka kita enkripsi (AES-256-GCM) pakai kunci turunan AUTH_SECRET.
//
// Backward compatible:
//  - WRITE: selalu terenkripsi (kalau AUTH_SECRET ada).
//  - READ : kalau data ber-tanda __enc → decrypt; kalau tidak → plaintext lama.
//  Jadi sesi yang sudah ada TIDAK perlu scan ulang; otomatis ter-enkripsi saat
//  creds.update berikutnya.
//
// ⚠️ AUTH_SECRET harus STABIL. Kalau diganti, creds terenkripsi tak bisa dibaca
//    (sesi perlu scan ulang) — sama seperti sesi NextAuth.
// ============================================================
function encKey(): Buffer | null {
    const s = process.env.AUTH_SECRET;
    if (!s) return null;
    return crypto.createHash("sha256").update(s).digest(); // 32 bytes
}

function encryptValue(plaintext: string): Record<string, unknown> | null {
    const key = encKey();
    if (!key) return null; // tanpa AUTH_SECRET → simpan plaintext (jangan kunci diri sendiri)
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        __enc: 1,
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
        ct: ct.toString("base64"),
    };
}

function decryptValue(obj: any): string {
    const key = encKey();
    if (!key) throw new Error("AUTH_SECRET tidak diset, tidak bisa dekripsi auth state");
    const iv = Buffer.from(obj.iv, "base64");
    const tag = Buffer.from(obj.tag, "base64");
    const ct = Buffer.from(obj.ct, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

export const usePrismaAuthState = async (sessionId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {

    // Baca + (kalau perlu) dekripsi → kembalikan object BufferJSON-encoded.
    const readData = async (type: string, id: string) => {
        try {
            const key = `${type}-${id}`;
            const data = await prisma.authState.findUnique({
                where: { sessionId_key: { sessionId, key } }
            });
            if (!data || !data.value) return null;

            const raw = data.value as any;
            let serialized: any;
            if (raw && typeof raw === "object" && raw.__enc === 1) {
                serialized = JSON.parse(decryptValue(raw)); // object BufferJSON-encoded
            } else {
                serialized = raw; // plaintext legacy
            }
            // Revive Buffer dari format BufferJSON
            return JSON.parse(JSON.stringify(serialized), BufferJSON.reviver);
        } catch (error) {
            logger.error("Auth", 'Error reading auth state:', error);
            return null;
        }
    };

    // Tulis terenkripsi (atau plaintext kalau AUTH_SECRET tidak ada).
    const writeData = async (type: string, id: string, data: any) => {
        try {
            const key = `${type}-${id}`;
            const serialized = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
            const value = encryptValue(JSON.stringify(serialized)) || serialized;

            await prisma.authState.upsert({
                where: { sessionId_key: { sessionId, key } },
                create: { sessionId, key, value },
                update: { value }
            });
        } catch (error) {
             logger.error("Auth", 'Error writing auth state:', error);
        }
    };

    const removeData = async (type: string, id: string) => {
        try {
            const key = `${type}-${id}`;
             await prisma.authState.deleteMany({
                where: { sessionId, key }
            });
        } catch (error) {
            // ignore
        }
    }


    const creds: AuthenticationCreds = (await readData('creds', 'me')) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data: { [key: string]: SignalDataTypeMap[typeof type] } = {};
                    await Promise.all(ids.map(async id => {
                        let value = await readData(type, id);
                        if (type === 'app-state-sync-key' && value) {
                            // Pola resmi Baileys: bungkus ke AppStateSyncKeyData
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        if (value) {
                            data[id] = value;
                        }
                    }));
                    return data;
                },
                set: async (data) => {
                     const tasks: Promise<void>[] = [];
                    for (const category in data) {
                        const categoryData = data[category as keyof typeof data];
                        if (!categoryData) continue;
                        
                        for (const id in categoryData) {
                            const value = categoryData[id];
                             if (value) {
                                tasks.push(writeData(category, id, value));
                            } else {
                                tasks.push(removeData(category, id));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: async () => {
            await writeData('creds', 'me', creds);
        }
    }
}
