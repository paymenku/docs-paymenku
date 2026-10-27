import { source } from '@/lib/source';
import { apiReferenceMarkdown } from '@/lib/api-reference.generated';

export const dynamic = 'force-dynamic';

const guideOrder = [
  '/docs/pengenalan',
  '/docs/mulai-cepat',
  '/docs/autentikasi',
  '/docs/batas-permintaan',
  '/docs/idempotensi',
  '/docs/transaksi',
  '/docs/transaksi/virtual-account',
  '/docs/transaksi/qris',
  '/docs/transaksi/e-wallet',
  '/docs/transaksi/gerai-ritel',
  '/docs/transaksi/aksi',
  '/docs/transaksi/status',
  '/docs/kanal-fee',
  '/docs/payment-link',
  '/docs/wallet',
  '/docs/webhook',
  '/docs/galat',
];

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const byUrl = new Map(source.getPages().map((page) => [page.url, page]));

  const parts: string[] = [];

  parts.push(
    [
      '# Paymenku API — dokumentasi lengkap',
      '',
      '> Paymenku adalah payment gateway untuk bisnis di Indonesia: QRIS, Virtual Account, e-wallet, ' +
        'dan gerai ritel. API memakai REST, HTTPS, dan JSON.',
      '',
      'Berkas ini menggabungkan seluruh panduan dan referensi endpoint. ' +
        `Kontrak OpenAPI 3.1 mentah tersedia di ${origin}/openapi.yaml.`,
      '',
      'Base URL: `https://paymenku.com/api/v1`',
      '',
      'Autentikasi: `Authorization: Bearer <API_KEY>` — `sk_live_` untuk produksi (butuh KYC), ' +
        '`sk_test_` untuk sandbox.',
      '',
    ].join('\n'),
  );

  for (const url of guideOrder) {
    const page = byUrl.get(url);
    if (!page) continue;
    const text = (await page.data.getText('processed')).trim();
    if (!text) continue;

    parts.push(`\n---\n\n# ${page.data.title}\n\nSumber: ${origin}${page.url}\n\n${text}\n`);
  }

  parts.push(`\n---\n\n${apiReferenceMarkdown}\n`);

  return new Response(parts.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
