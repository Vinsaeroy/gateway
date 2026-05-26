import primbon from "primbon-scraper";

export const artiNama = async (nama) => {
  try {
    const res = await primbon.artiNama(nama);

    if (typeof res === "string") return res;

    if (res?.status && res?.result?.arti) {
      return res.result.arti;
    }

    throw new Error(res?.message || "Gagal mengambil arti nama.");
  } catch (error) {
    console.error("[PRIMBON ERROR]", error);
    throw error;
  }
};
