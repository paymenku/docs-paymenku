import { source } from '@/lib/source';

export const dynamic = 'force-dynamic';

const groups: { title: string; urls: string[] }[] = [
  {
    title: 'Mulai di sini',
    urls: ['/docs/pengenalan', '/docs/mulai-cepat'],
  },
  {
    title: 'Panduan',
    urls: [
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
    ],
  },
  {
    title: 'Referensi API',
    urls: [
      '/docs/api',
      '/docs/api/transaksi/createTransaction',
      '/docs/api/status/checkStatus',
      '/docs/api/status/listTransactions',
      '/docs/api/aksi/cancelTransaction',
      '/docs/api/aksi/refundTransaction',
      '/docs/api/kanal/listPaymentChannels',
      '/docs/api/kanal/calculateFee',
      '/docs/api/kanal/getPaymentInstruction',
      '/docs/api/payment-link/createPaymentLink',
      '/docs/api/payment-link/showPaymentLink',
      '/docs/api/wallet/getWalletBalance',
      '/docs/api/wallet/getWalletPendingBalance',
      '/docs/api/webhook/webhookPaymentStatusUpdated',
    ],
  },
];

export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const desc = new Map(source.getPages().map((page) => [page.url, page.data.description ?? '']));

  const lines: string[] = [];

  lines.push('# Paymenku API');
  lines.push('');
  lines.push(
    '> Paymenku adalah payment gateway untuk bisnis di Indonesia. API-nya menerima pembayaran ' +
      'lewat QRIS, Virtual Account, e-wallet, dan gerai ritel; status resmi dikirim melalui webhook.',
  );
  lines.push('');
  lines.push(
    'Dokumentasi ini berbahasa Indonesia dan ditujukan untuk integrator manusia maupun agen AI. ' +
      'Setiap halaman tersedia sebagai Markdown dengan menambahkan `.md` pada URL-nya, ' +
      'misalnya `/docs/webhook.md`.',
  );
  lines.push('');
  lines.push('## Fakta penting');
  lines.push('');
  lines.push('- Base URL: `https://paymenku.com/api/v1` — live dan sandbox memakai URL yang sama.');
  lines.push(
    '- Autentikasi: `Authorization: Bearer sk_live_...` (produksi, butuh KYC) atau ' +
      '`sk_test_...` (sandbox, tanpa dana nyata). Prefix lain ditolak `401`.',
  );
  lines.push(
    '- Envelope tidak seragam: transaksi/kanal/payment link memakai `status`, sedangkan ' +
      'fee/instruction/wallet memakai `success`. Periksa kode HTTP juga.',
  );
  lines.push(
    '- Nominal dikirim sebagai angka, dibalas sebagai string desimal (`"15305.00"`). ' +
      'Parse sebagai desimal, bukan float.',
  );
  lines.push(
    '- Status: `pending`, `paid`, `expired`, `failed`, `cancelled`, `refunded`. ' +
      'Hanya `paid` yang boleh memicu pemenuhan pesanan.',
  );
  lines.push(
    '- Webhook adalah sumber status resmi. Tanda tangan: ' +
      '`HMAC-SHA256(timestamp + "." + raw_body, webhook_secret)` pada header ' +
      '`X-PaymenKu-Signature`; timestamp di `X-PaymenKu-Timestamp`.',
  );
  lines.push('- Rate limit bawaan 120 permintaan/menit per merchant; hormati `Retry-After` pada `429`.');
  lines.push(
    '- `Idempotency-Key` melindungi percobaan ulang selama 24 jam. `reference_id` adalah ' +
      'identitas pesanan dan dipakai mencocokkan webhook.',
  );
  lines.push(
    '- Payment link menolak kunci sandbox (`403`). Open Payment, ringkasan saldo, dan saldo ' +
      'gabungan belum tersedia dan tidak didokumentasikan.',
  );
  lines.push(
    '- Pembatalan (`/transaction/cancel`) hanya untuk transaksi `pending`; refund ' +
      '(`/transaction/refund`) hanya untuk transaksi `paid`. Di produksi pembatalan ' +
      'tersedia untuk sebagian transaksi QRIS dan refund untuk sebagian transaksi e-wallet; ' +
      'transaksi sandbox diproses lokal.',
  );
  lines.push(
    '- Waktu pada payload webhook dan respons API dapat memakai zona berbeda. Parse sebagai ' +
      'timestamp, jangan membandingkan string waktu.',
  );
  lines.push('');

  for (const group of groups) {
    lines.push(`## ${group.title}`);
    lines.push('');
    for (const url of group.urls) {
      const page = source.getPage(url.replace(/^\/docs\/?/, '').split('/').filter(Boolean));
      if (!page) continue;
      const description = desc.get(url);
      lines.push(`- [${page.data.title}](${origin}${url})${description ? `: ${description}` : ''}`);
    }
    lines.push('');
  }

  lines.push('## Berkas untuk mesin');
  lines.push('');
  lines.push(`- [llms-full.txt](${origin}/llms-full.txt): seluruh panduan dan referensi API dalam satu berkas.`);
  lines.push(`- [openapi.yaml](${origin}/openapi.yaml): kontrak OpenAPI 3.1 mentah, sumber kebenaran parameter dan respons.`);
  lines.push(`- [llms.txt](${origin}/llms.txt): berkas indeks ini.`);
  lines.push('');
  lines.push('## Sitemap halaman');
  lines.push('');
  lines.push(
    'Panduan di bawah tersedia sebagai Markdown per halaman. Halaman referensi API ' +
      'tidak punya Markdown per halaman — gunakan llms-full.txt atau openapi.yaml.',
  );
  lines.push('');
  for (const page of source.getPages()) {
    if (page.url.startsWith('/docs/api')) continue;
    lines.push(`- ${origin}${page.url}.md`);
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
