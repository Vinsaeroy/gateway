import Link from "next/link";
import { LandingNav } from "@/components/landing/landing-nav";
import { SITE_NAME } from "@/lib/site";

export const metadata = { title: `Privacy Policy | ${SITE_NAME}` };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1 pt-36 pb-24">
        <div className="container max-w-3xl mx-auto px-4 md:px-6 prose dark:prose-invert">
          <h1>Kebijakan Privasi</h1>
          <p>
            {SITE_NAME} adalah WhatsApp Gateway self-hosted. Data sesi, pesan, dan
            kontak diproses untuk menjalankan layanan yang kamu konfigurasikan dan
            tidak dijual ke pihak ketiga.
          </p>
          <h2>Data yang diproses</h2>
          <ul>
            <li>Kredensial sesi WhatsApp (disimpan terenkripsi di database milikmu).</li>
            <li>Pesan dan kontak yang melewati gateway, sesuai pengaturanmu.</li>
            <li>Data akun (email, nama) untuk autentikasi dashboard.</li>
          </ul>
          <h2>Penyimpanan</h2>
          <p>
            Karena bersifat self-hosted, kamu sebagai operator bertanggung jawab atas
            keamanan server dan database tempat data disimpan.
          </p>
          <h2>Kontak</h2>
          <p>
            Pertanyaan terkait data? Lihat repositori atau hubungi admin melalui{" "}
            <Link href="/">halaman utama</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
