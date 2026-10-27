import fs from 'node:fs';
import YAML from 'yaml';

const spec = YAML.parse(fs.readFileSync('openapi.yaml', 'utf8'));

/** Ambil objek schema, ikuti $ref dan allOf sederhana. */
function resolve(schema, depth = 0) {
  if (!schema || depth > 8) return schema ?? {};
  if (schema.$ref) {
    const path = schema.$ref.replace(/^#\//, '').split('/');
    let node = spec;
    for (const key of path) node = node?.[key];
    return resolve(node, depth + 1);
  }
  if (Array.isArray(schema.allOf)) {
    return Object.assign({}, ...schema.allOf.map((s) => resolve(s, depth + 1)));
  }
  return schema;
}

function cell(text) {
  return String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

function typeOf(schema) {
  const s = resolve(schema);
  if (s.type) return Array.isArray(s.type) ? s.type.join(' | ') : s.type;
  if (s.oneOf) return 'oneOf';
  if (s.anyOf) return 'anyOf';
  return '';
}

function fence(value) {
  return ['```json', JSON.stringify(value, null, 2), '```'].join('\n');
}

const lines = [];
lines.push('# Referensi API Paymenku');
lines.push('');
lines.push(
  'Kontrak lengkap seluruh endpoint. Semua permintaan dan balasan memakai JSON, ' +
    'kecuali disebut lain. Nominal uang dikirim sebagai angka dan dibalas sebagai string desimal.',
);
lines.push('');
lines.push(`Base URL: \`${spec.servers?.[0]?.url ?? 'https://paymenku.com/api/v1'}\``);
lines.push('');
lines.push('Autentikasi: `Authorization: Bearer <API_KEY>` pada setiap permintaan.');
lines.push('');
lines.push('## Envelope respons');
lines.push('');
lines.push('Transaksi, kanal, dan payment link:');
lines.push('');
lines.push(fence({ status: 'success', data: {} }));
lines.push('');
lines.push('Fee calculator, payment instruction, dan wallet:');
lines.push('');
lines.push(fence({ success: true, data: {} }));
lines.push('');
lines.push('Galat memakai `status: "error"` atau `success: false`, disertai `message`;');
lines.push('galat validasi menambahkan `errors` per field.');
lines.push('');

const methods = ['get', 'post', 'put', 'patch', 'delete'];

for (const [path, item] of Object.entries(spec.paths ?? {})) {
  for (const method of methods) {
    const op = item[method];
    if (!op) continue;

    lines.push('---');
    lines.push('');
    lines.push(`## ${method.toUpperCase()} ${path}`);
    lines.push('');

    if (op.summary) lines.push(`**${op.summary}**`, '');

    if (op.description) {
      lines.push(op.description.trim(), '');
    }

    if (op.deprecated) {
      lines.push('> **Deprecated.** Jangan dipakai untuk integrasi baru.', '');
    }

    const params = (op.parameters ?? []).map((p) => ({ ...p, schema: resolve(p.schema) }));
    if (params.length) {
      lines.push('### Parameter', '');
      lines.push('| Nama | Lokasi | Wajib | Tipe | Keterangan |');
      lines.push('|---|---|---|---|---|');
      for (const p of params) {
        lines.push(
          `| \`${p.name}\` | ${p.in} | ${p.required ? 'ya' : 'tidak'} | ${typeOf(
            p.schema,
          )} | ${cell(p.description)} |`,
        );
      }
      lines.push('');
    }

    const body = op.requestBody?.content?.['application/json'];
    if (body?.schema) {
      const schema = resolve(body.schema);
      lines.push('### Body permintaan', '');
      if (op.requestBody.required) lines.push('Body wajib dikirim.', '');
      if (Array.isArray(schema.required) && schema.required.length) {
        lines.push(`Field wajib: ${schema.required.map((r) => `\`${r}\``).join(', ')}`, '');
      }
      const props = Object.entries(schema.properties ?? {});
      if (props.length) {
        lines.push('| Field | Tipe | Wajib | Keterangan |');
        lines.push('|---|---|---|---|');
        for (const [name, raw] of props) {
          const prop = resolve(raw);
          const required = schema.required?.includes(name) ? 'ya' : 'tidak';
          const example = prop.examples?.[0] ?? prop.example;
          const desc = [cell(prop.description), example !== undefined ? `Contoh: \`${JSON.stringify(example)}\`` : '']
            .filter(Boolean)
            .join(' ');
          lines.push(`| \`${name}\` | ${typeOf(prop)} | ${required} | ${desc} |`);
        }
        lines.push('');
      }
      const example = body.examples && Object.values(body.examples)[0]?.value;
      if (example) {
        lines.push('Contoh body:', '', fence(example), '');
      }
    }

    const responses = Object.entries(op.responses ?? {});
    if (responses.length) {
      lines.push('### Respons', '');
      for (const [code, raw] of responses) {
        const resp = resolve(raw);
        lines.push(`#### ${code}`, '');
        if (resp.description) lines.push(cell(resp.description), '');

        const media = resp.content?.['application/json'];
        if (media?.example) {
          lines.push(fence(media.example), '');
        } else if (media?.examples) {
          for (const [name, ex] of Object.entries(media.examples).slice(0, 2)) {
            lines.push(`Contoh \`${name}\`${ex.summary ? ` — ${cell(ex.summary)}` : ''}:`, '');
            if (ex.value) lines.push(fence(ex.value), '');
          }
        }
      }
    }
  }
}

const markdown = lines.join('\n').replace(/\n{4,}/g, '\n\n\n');

fs.writeFileSync(
  'lib/api-reference.generated.ts',
  `// Dibuat otomatis oleh scripts/generate-api-markdown.mjs. Jangan diedit manual.\nexport const apiReferenceMarkdown = ${JSON.stringify(markdown)};\n`,
);

// Salinan publik agar agen AI bisa mengambil kontrak mentah.
fs.mkdirSync('public', { recursive: true });
fs.copyFileSync('openapi.yaml', 'public/openapi.yaml');

// Bentuk JSON dipakai lib/openapi.ts supaya runtime tidak perlu membaca berkas.
fs.writeFileSync('openapi.json', JSON.stringify(spec));

console.log('api-reference.generated.ts:', markdown.length, 'karakter');
console.log('public/openapi.yaml disalin');
