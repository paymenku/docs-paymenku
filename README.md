# Paymenku API — Dokumentasi

Situs dokumentasi API [Paymenku](https://paymenku.com), dibangun dengan
[Fumadocs](https://fumadocs.dev) (Next.js). Seluruh konten panduan berbahasa
Indonesia; halaman referensi API dibuat dari `openapi.yaml` lewat
`fumadocs-openapi`, sehingga parameter dan contoh respons mengikuti kontrak
yang sama dengan server.

## Menjalankan

```bash
npm ci
npm run dev      # http://localhost:3000
npm run build    # build produksi
npm start        # menjalankan hasil build
```

## Struktur

| Path | Isi |
|---|---|
| `content/docs/` | Konten panduan (MDX) |
| `content/docs/meta.json` | Urutan sidebar |
| `content/docs/api/` | Halaman referensi hasil generate, **jangan diedit manual** |
| `openapi.yaml` | Kontrak API — satu sumber kebenaran |
| `lib/openapi.ts` | Instance OpenAPI server |
| `components/api-page.tsx` | Komponen playground `OpenAPIPage` |
| `scripts/generate-docs.mjs` | Generator halaman referensi dari `openapi.yaml` |
| `app/` | Route Next.js, layout, pencarian, llms.txt |

## Halaman panduan

- `pengenalan.mdx` — gambaran umum, envelope, siklus status
- `mulai-cepat.mdx` — transaksi pertama dalam empat langkah
- `sdk.mdx` — SDK PHP, Node.js, dan Go
- `autentikasi.mdx`, `batas-permintaan.mdx`, `idempotensi.mdx`
- `transaksi/` — buat transaksi dan panduan per kanal (VA, QRIS, e-wallet,
  gerai ritel, status)
- `kanal-fee.mdx`, `payment-link.mdx`, `wallet.mdx`
- `webhook.mdx` — verifikasi tanda tangan dan aturan penanganan
- `galat.mdx` — kode HTTP dan kebijakan percobaan ulang

## Memperbarui referensi API

Ubah `openapi.yaml`, lalu:

```bash
npm run generate
npm run build
```

Generator menulis ulang `content/docs/api/`. Nama folder dipetakan dari tag
OpenAPI; bila tag berubah, sesuaikan `content/docs/api/meta.json`.

## Berkas untuk agen AI

| URL | Isi |
|---|---|
| `/llms.txt` | Indeks terkurasi: fakta penting, daftar halaman, dan tautan berkas mesin |
| `/llms-full.txt` | Seluruh panduan + referensi endpoint lengkap dalam satu berkas |
| `/openapi.yaml` | Kontrak OpenAPI 3.1 mentah |
| `/docs/<halaman>.md` | Markdown per halaman panduan |

`/llms-full.txt` menggabungkan panduan dari `content/docs` dengan referensi
endpoint yang dihasilkan `scripts/generate-api-markdown.mjs` dari
`openapi.yaml` — termasuk parameter, body, dan contoh respons. Jalankan
`npm run generate` setelah mengubah kontrak agar ketiganya ikut diperbarui.

## Deploy

### Vercel

Tidak perlu konfigurasi tambahan. Impor repo, framework terdeteksi sebagai
Next.js, build `npm run build`, output `.next`. Tidak ada environment variable
yang wajib.

### Cloudflare Workers (OpenNext)

Cloudflare Pages memakai adapter `next-on-pages` yang sudah deprecated. Jalur
yang didukung adalah Workers lewat `@opennextjs/cloudflare`.

```bash
npm i -D @opennextjs/cloudflare wrangler
npx opennextjs-cloudflare build
npx wrangler deploy
```

`wrangler.jsonc` dan `open-next.config.ts` sudah disertakan. Ukuran Worker
hasil build sekitar **6 MiB gzip**, jadi butuh paket Workers **Paid** (batas
paket gratis 3 MiB). Middleware (`proxy.ts`) berjalan, tetapi OpenNext
menandainya eksperimental.



## Catatan

- `/docs` dialihkan ke `/docs/pengenalan` lewat `next.config.mjs`.
- Playground mengirim permintaan dari browser. Gunakan kunci sandbox di sana,
  jangan kunci live.
- Tema memakai warna brand `#6C3CE1`; mode terang dan gelap sama-sama aktif.
