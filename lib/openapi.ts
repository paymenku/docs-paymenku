import spec from '../openapi.json';
import { createOpenAPI } from 'fumadocs-openapi/server';

// Dokumen diberikan sebagai objek, bukan path, supaya halaman referensi tidak
// membaca berkas saat request. Ini membuat build tetap jalan di runtime yang
// tidak punya filesystem (Cloudflare Workers) dan di Vercel.
export const openapi = createOpenAPI({
  input: { './openapi.yaml': spec as never },
});
