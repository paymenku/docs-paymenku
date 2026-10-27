import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';

const OUT = 'content/docs/api';
const TMP = '.generated-api';

// Nama folder dari tag OpenAPI dipetakan ke slug yang stabil dan rapi.
const FOLDERS = {
  buattransaksi: { slug: 'transaksi', title: 'Transaksi' },
  statusriwayat: { slug: 'status', title: 'Status & riwayat' },
  kanalfee: { slug: 'kanal', title: 'Kanal & fee' },
  paymentlink: { slug: 'payment-link', title: 'Payment link' },
  aksitransaksi: { slug: 'aksi', title: 'Aksi transaksi' },
  wallet: { slug: 'wallet', title: 'Wallet' },
  webhooks: { slug: 'webhook', title: 'Webhook' },
};

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

// Urutan halaman mengikuti urutan operasi di openapi.yaml.
const spec = YAML.parse(fs.readFileSync('openapi.yaml', 'utf8'));
const operationOrder = [];
for (const item of Object.values(spec.paths ?? {})) {
  for (const op of Object.values(item)) {
    if (op?.operationId) operationOrder.push(op.operationId);
  }
}
const rank = (operationId) => {
  const index = operationOrder.indexOf(operationId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

fs.rmSync(TMP, { recursive: true, force: true });
fs.rmSync(OUT, { recursive: true, force: true });

const openapi = createOpenAPI({ input: ['./openapi.yaml'] });

await generateFiles({
  input: openapi,
  output: TMP,
  per: 'operation',
  groupBy: 'tag',
  includeDescription: true,
  addGeneratedComment: false,
});

fs.mkdirSync(OUT, { recursive: true });

const groups = [];
for (const entry of fs.readdirSync(TMP, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const mapped = FOLDERS[normalize(entry.name)] ?? {
    slug: normalize(entry.name),
    title: entry.name,
  };

  const source = path.join(TMP, entry.name);
  const destination = path.join(OUT, mapped.slug);
  fs.mkdirSync(destination, { recursive: true });

  const files = fs
    .readdirSync(source)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => path.basename(file, '.mdx'))
    .sort((a, b) => rank(a) - rank(b));

  for (const name of files) {
    fs.copyFileSync(path.join(source, `${name}.mdx`), path.join(destination, `${name}.mdx`));
  }

  fs.writeFileSync(
    path.join(destination, 'meta.json'),
    `${JSON.stringify({ title: mapped.title, pages: files }, null, 2)}\n`,
  );

  groups.push({ slug: mapped.slug, title: mapped.title, rank: rank(files[0]) });
}

groups.sort((a, b) => a.rank - b.rank);

// Halaman ringkasan referensi bukan hasil generate; disalin dari template.
fs.copyFileSync('scripts/templates/api-index.mdx', path.join(OUT, 'index.mdx'));

fs.writeFileSync(
  path.join(OUT, 'meta.json'),
  `${JSON.stringify({ title: 'Referensi API', pages: ['index', ...groups.map((g) => g.slug)] }, null, 2)}\n`,
);

fs.rmSync(TMP, { recursive: true, force: true });

console.log(`Referensi API: ${groups.length} grup, ${operationOrder.length} operasi`);
for (const group of groups) console.log(`- ${group.slug} (${group.title})`);
