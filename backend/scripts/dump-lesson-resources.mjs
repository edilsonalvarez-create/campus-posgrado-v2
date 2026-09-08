// Genera seed-data/RECURSOS_POR_LECCION.md: el listado, por asignatura y lección,
// de los recursos que cada lección recibe tras el weave del seed
// (weaveLessonResources sobre template.json). Diffable y revisable en el repo,
// sin tener que ejecutar la siembra — responde al hallazgo N-7 de la auditoría
// ("44/66 lecciones no muestran sus recursos en el fichero de contenido").
//
// Reproduce 1:1 la lógica de db/seed.js. Ejecutar tras tocar template.json o
// los `recursos` inline de una lección:  node scripts/dump-lesson-resources.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'db', 'seed-data');
const TEMPLATE = JSON.parse(readFileSync(join(DATA, 'template.json'), 'utf8'));
const byNumeral = Object.fromEntries((TEMPLATE.modules || []).map((m) => [m.numeral, m]));

// --- copiado 1:1 de db/seed.js ---
function curatedToRecurso(r) {
  const entry = { titulo: r.n, autor: r.s || undefined, canal: r.s || undefined, url: r.u || undefined };
  return r.t === 'video'
    ? { kind: 'videos', item: { titulo: entry.titulo, canal: entry.canal, url: entry.url } }
    : { kind: 'libros', item: { titulo: entry.titulo, autor: entry.autor, url: entry.url } };
}
function weaveLessonResources(lecciones, curated) {
  const pool = (curated || []).filter((r) => r.u).map(curatedToRecurso);
  if (!pool.length) return lecciones;
  return lecciones.map((l, idx) => {
    const have = l.recursos || {};
    const libros = [...(have.libros || [])];
    const videos = [...(have.videos || [])];
    const urls = new Set([...libros, ...videos].map((x) => x.url).filter(Boolean));
    let k = idx;
    let guard = 0;
    while (libros.length + videos.length < 2 && guard < pool.length * 3) {
      const pick = pool[k % pool.length];
      k += 1;
      guard += 1;
      if (pick.item.url && urls.has(pick.item.url)) continue;
      if (pick.item.url) urls.add(pick.item.url);
      (pick.kind === 'videos' ? videos : libros).push(pick.item);
    }
    const direct = pool[idx % pool.length];
    if (direct.item.url && !urls.has(direct.item.url)) {
      urls.add(direct.item.url);
      (direct.kind === 'videos' ? videos : libros).push(direct.item);
    }
    return { ...l, recursos: { libros, videos } };
  });
}
// --- fin copia ---

const NUMERALS = { i: 'I', ii: 'II', iii: 'III', iv: 'IV', v: 'V', vi: 'VI', vii: 'VII', viii: 'VIII', ix: 'IX', x: 'X', xi: 'XI' };

let md = `# Recursos por lección — Máster IEP

Generado por \`scripts/dump-lesson-resources.mjs\`. Cada lección recibe **≥2 recursos**:
los \`recursos\` que trae inline en su fichero \`master-*-lecciones.js\` más los que el
seed le teje desde \`template.json\` (\`weaveLessonResources\`). Este fichero deja ese
resultado a la vista sin ejecutar la siembra. Re-genéralo tras tocar \`template.json\`
o un \`recursos\` inline.

`;

let warn = 0;
for (const [slug, NUM] of Object.entries(NUMERALS)) {
  let mod;
  try {
    mod = require(`../db/seed-data/master-${slug}-lecciones.js`);
  } catch {
    continue;
  }
  const woven = weaveLessonResources(mod.lecciones, (byNumeral[NUM] || {}).resources);
  md += `## Asignatura ${NUM} (\`master-${slug}\`)\n\n`;
  woven.forEach((l, i) => {
    const r = l.recursos || { libros: [], videos: [] };
    const n = (r.libros || []).length + (r.videos || []).length;
    const inline = mod.lecciones[i].recursos ? ' · _(algún recurso venía inline)_' : '';
    md += `**L${i + 1}. ${l.title}** — ${n} recurso(s)${inline}\n\n`;
    for (const b of r.libros || []) md += `- 📖 ${b.titulo}${b.autor ? ` — ${b.autor}` : ''}${b.url ? ` <${b.url}>` : ''}\n`;
    for (const v of r.videos || []) md += `- 🎬 ${v.titulo}${v.canal ? ` — ${v.canal}` : ''}${v.url ? ` <${v.url}>` : ''}\n`;
    md += '\n';
    if (n < 2) {
      warn += 1;
      md += `> ⚠️ Solo ${n} recurso(s): el \`template.json\` de esta asignatura no tiene suficientes. Añadir recursos curados.\n\n`;
    }
  });
}

writeFileSync(join(DATA, 'RECURSOS_POR_LECCION.md'), md);
console.log(`RECURSOS_POR_LECCION.md generado.${warn ? ` ${warn} lección(es) con <2 recursos — revisar.` : ' Todas las lecciones con ≥2.'}`);
