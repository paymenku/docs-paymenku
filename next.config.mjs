import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    // Host build hanya punya RAM terbatas; biarkan Next memakai satu worker.
    cpus: 1,
  },
  async redirects() {
    return [
      // Halaman perkenalan berada di /docs/pengenalan; /docs diarahkan ke sana
      // agar tidak bergantung pada prerender catch-all kosong.
      { source: '/docs', destination: '/docs/pengenalan', permanent: false },
    ];
  },
};

export default withMDX(config);
