import { LandingNav } from "@/components/landing/landing-nav";
import { SITE_NAME } from "@/lib/site";

export const metadata = { title: `Terms of Service | ${SITE_NAME}` };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1 pt-36 pb-24">
        <div className="container max-w-3xl mx-auto px-4 md:px-6 prose dark:prose-invert">
          <h1>Syarat &amp; Ketentuan</h1>
          <p>
            Dengan menggunakan {SITE_NAME}, kamu setuju untuk memakai layanan sesuai
            hukum yang berlaku dan kebijakan WhatsApp.
          </p>
          <h2>Penggunaan yang dilarang</h2>
          <ul>
            <li>Spam, penipuan, atau pesan massal tanpa izin penerima.</li>
            <li>Konten ilegal, melanggar hak cipta, atau merugikan pihak lain.</li>
            <li>Aktivitas yang melanggar Ketentuan Layanan WhatsApp.</li>
          </ul>
          <h2>Tanpa garansi</h2>
          <p>
            Layanan disediakan &quot;apa adanya&quot;. Risiko pemblokiran nomor oleh
            WhatsApp tetap ada; gunakan fitur anti-ban dan kirim secara wajar.
          </p>
          <h2>Pembayaran</h2>
          <p>
            Langganan berbayar diproses via QRIS. Masa aktif sesuai plan yang dipilih.
          </p>
        </div>
      </main>
    </div>
  );
}
