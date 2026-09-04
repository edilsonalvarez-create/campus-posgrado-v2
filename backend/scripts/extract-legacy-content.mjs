// Extrae TEMPLATE / BOOKS / AULAS del artefacto legado campus-posgrado.html
// y los cursos nativos + Master IEP, y los deja como JSON para el seed.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const REPO = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(__dirname, '..', 'db', 'seed-data');

// El artefacto legado vive fuera del repo v2.
const LEGACY_CANDIDATES = [
  process.env.LEGACY_HTML || '',
  path.resolve(REPO, '..', 'campus-posgrado-ia', 'campus-posgrado.html'),
  path.resolve(REPO, '..', 'Documentos excel seguro', 'campus-posgrado-ia', 'campus-posgrado.html'),
].filter(Boolean);

const legacyPath = LEGACY_CANDIDATES.find((p) => fs.existsSync(p));
if (!legacyPath) {
  console.error('No se encontró campus-posgrado.html. Rutas probadas:\n' + LEGACY_CANDIDATES.join('\n'));
  process.exit(1);
}
console.log('Artefacto legado:', legacyPath);
const html = fs.readFileSync(legacyPath, 'utf8');

// Extrae un objeto literal `var NAME = { ... }` balanceando llaves y respetando strings.
function extractObjectLiteral(src, varName) {
  const re = new RegExp('var\\s+' + varName + '\\s*=\\s*', 'g');
  const m = re.exec(src);
  if (!m) throw new Error('No se encontró var ' + varName);
  const start = m.index + m[0].length;
  if (src[start] !== '{') throw new Error(varName + ' no empieza con {');
  let depth = 0;
  let inStr = null;
  let esc = false;
  for (let j = start; j < src.length; j++) {
    const c = src[j];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === inStr) { inStr = null; }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(start, j + 1);
    }
  }
  throw new Error('Llaves sin balancear en ' + varName);
}

function evalLiteral(code, name) {
  const ctx = {};
  vm.createContext(ctx);
  return vm.runInContext('(' + code + ')', ctx, { filename: name, timeout: 5000 });
}

const TEMPLATE = evalLiteral(extractObjectLiteral(html, 'TEMPLATE'), 'TEMPLATE');
const BOOKS = evalLiteral(extractObjectLiteral(html, 'BOOKS'), 'BOOKS');
const AULAS = evalLiteral(extractObjectLiteral(html, 'AULAS'), 'AULAS');

let nativeCurriculum = {};
try { nativeCurriculum = require('../native-curriculum.js'); } catch (e) { console.warn('native-curriculum.js:', e.message); }

fs.mkdirSync(OUT, { recursive: true });
const write = (f, obj) => {
  fs.writeFileSync(path.join(OUT, f), JSON.stringify(obj, null, 2));
  console.log('  ->', f, Array.isArray(obj) ? '(' + obj.length + ')' : '(' + Object.keys(obj).length + ' claves)');
};
write('template.json', TEMPLATE);
write('books.json', BOOKS);
write('aulas.json', AULAS);
write('native-curriculum.json', nativeCurriculum);
// master-iep-data.js YA NO se usa: era contenido fabricado (3 asignaturas inventadas,
// sin relación con el documento oficial del Máster). Las 11 asignaturas + TFM reales
// se siembran ahora desde TEMPLATE con títulos del documento oficial (ver db/seed.js).

const aulaStats = Object.entries(AULAS).map(([k, v]) => ({
  aula: k.slice(0, 40),
  unidades: (v.units || []).length,
  lecciones: (v.units || []).reduce((n, u) => n + (u.lessons || []).length, 0),
  conCuerpo: (v.units || []).reduce((n, u) => n + (u.lessons || []).filter((l) => l.body && l.body.length).length, 0),
  examenes: (v.units || []).filter((u) => u.exam && u.exam.length).length,
}));
console.log('\nRESUMEN AULAS:');
console.table(aulaStats);
console.log(
  'TEMPLATE módulos:', (TEMPLATE.modules || []).length,
  '| recursos:', (TEMPLATE.modules || []).reduce((n, m) => n + (m.resources || []).length, 0),
);
console.log('BOOKS:', Object.keys(BOOKS).length);
console.log(
  'Totales AULAS -> lecciones:', aulaStats.reduce((n, a) => n + a.lecciones, 0),
  '| con cuerpo:', aulaStats.reduce((n, a) => n + a.conCuerpo, 0),
  '| exámenes:', aulaStats.reduce((n, a) => n + a.examenes, 0),
);
