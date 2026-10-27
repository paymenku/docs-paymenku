import Link from 'next/link';

const endpoints = [
  { method: 'POST', path: '/transaction/create', label: 'Buat transaksi' },
  { method: 'GET', path: '/check-status/{order_id}', label: 'Cek status' },
  { method: 'GET', path: '/payment-channels', label: 'Kanal aktif' },
  { method: 'GET', path: '/wallet/balance', label: 'Saldo' },
];

const features = [
  {
    title: 'Satu API untuk semua kanal',
    body: 'QRIS, Virtual Account, e-wallet, dan gerai ritel memakai kontrak yang sama. Kanal aktif diambil dari API, bukan ditanam di kode.',
  },
  {
    title: 'Status resmi lewat webhook',
    body: 'Setiap perubahan status dikirim bertanda tangan HMAC-SHA256. Idempoten per trx_id, aman untuk percobaan ulang.',
  },
  {
    title: 'Sandbox tanpa KYC',
    body: 'Kunci sk_test_ membuat transaksi SBOX tanpa perpindahan dana, lengkap dengan simulator pembayaran.',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-5xl px-6 pt-20 pb-16 sm:pt-28">
        <div className="flex items-center gap-3 text-sm font-medium text-fd-muted-foreground">
          <img
            src="/logo.png"
            alt="Paymenku Docs"
            width={119}
            height={40}
            className="h-10 w-auto dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="Paymenku Docs"
            width={119}
            height={40}
            className="hidden h-10 w-auto dark:block"
          />
          <span className="rounded-full border px-2 py-0.5 text-xs">v1.0</span>
        </div>

        <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Terima pembayaran di Indonesia lewat satu API.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-fd-muted-foreground">
          REST, HTTPS, dan JSON. Buat transaksi, tampilkan instruksi pembayaran,
          lalu terima status resmi lewat webhook.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/docs/mulai-cepat"
            className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Mulai cepat
          </Link>
          <Link
            href="/docs/api"
            className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
          >
            Referensi API
          </Link>
        </div>

        <div className="mt-14 rounded-xl border bg-fd-card">
          <div className="border-b px-5 py-3 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
            Base URL
          </div>
          <pre className="overflow-x-auto px-5 py-4 text-sm">
            <code>https://paymenku.com/api/v1</code>
          </pre>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border bg-fd-border sm:grid-cols-2">
          {endpoints.map((item) => (
            <div key={item.path} className="bg-fd-card px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="w-12 text-xs font-semibold text-fd-primary">{item.method}</span>
                <code className="text-sm">{item.path}</code>
              </div>
              <p className="mt-2 pl-15 text-sm text-fd-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-fd-muted/40">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-16 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title}>
              <h2 className="text-base font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
