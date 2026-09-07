import { useState } from 'react';
import { useCreateSubmission, useSubmissions } from '../hooks/useSubmissions';
import { RubricView } from './RubricView';

interface HandsOnSpec {
  referencePractice?: string;
  notebookTemplateUrl?: string | null;
  requiredArtifacts?: Array<{ label: string; type: string; hint?: string }>;
}

const URL_RE = /^https?:\/\/\S+$/i;

// Entrega de una práctica computacional (tracks hands-on III/VI/IX/X).
// Repo/notebook + enlaces a artefactos (sin subida de binarios: URLs externas).
export function HandsOnSubmission({
  resource,
  courseId,
  spec,
  rubricSlug,
}: {
  resource: { id: string; title: string };
  courseId: string;
  spec: HandsOnSpec;
  rubricSlug?: string;
}) {
  const { data: submissions = [] } = useSubmissions({ courseId });
  const mine = submissions.filter((s) => s.resourceId === resource.id);
  const create = useCreateSubmission();

  const artifacts = spec.requiredArtifacts || [];
  const [repoUrl, setRepoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);

  const filledLinks = artifacts
    .map((a, i) => ({ label: a.label, type: a.type, url: (links[i] || '').trim() }))
    .filter((x) => URL_RE.test(x.url));
  const canSubmit = URL_RE.test(repoUrl.trim()) || filledLinks.length > 0;

  return (
    <div>
      {spec.referencePractice && (
        <div className="mb-4 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-r text-sm text-gray-700 dark:text-gray-300">
          {spec.referencePractice}
        </div>
      )}

      {spec.notebookTemplateUrl ? (
        <a
          href={spec.notebookTemplateUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block mb-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          ▶ Abrir la plantilla de la práctica ↗
        </a>
      ) : (
        <p className="mb-4 text-xs text-gray-400">
          La plantilla de la práctica la publica el profesorado; si aún no está, monta el repositorio desde cero
          siguiendo el enunciado.
        </p>
      )}

      <p className="font-semibold text-gray-900 dark:text-white mb-2">Artefactos requeridos</p>
      <ul className="mb-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
        {artifacts.map((a, i) => (
          <li key={i} className="flex items-start gap-2">
            <span>{URL_RE.test((links[i] || '').trim()) ? '✅' : '⬜'}</span>
            <span>
              <span className="font-medium">{a.label}</span>
              {a.hint && <span className="text-gray-500 dark:text-gray-400"> — {a.hint}</span>}
            </span>
          </li>
        ))}
      </ul>

      {rubricSlug && (
        <details className="mb-4">
          <summary className="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400">
            Ver rúbrica de evaluación
          </summary>
          <RubricView slug={rubricSlug} />
        </details>
      )}

      {mine.length > 0 && (
        <div className="mb-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Tus entregas</p>
          <div className="space-y-3">
            {mine.map((s) => (
              <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs uppercase text-gray-500">
                    {new Date(s.submittedAt).toLocaleDateString('es-CO')} · {s.status}
                  </span>
                  {typeof s.grade === 'number' && (
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{s.grade}/100</span>
                  )}
                </div>
                {s.repoUrl && (
                  <a href={s.repoUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline block">
                    {s.repoUrl}
                  </a>
                )}
                {(s.files || []).map((f, i) => (
                  <a key={i} href={f.url} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline block">
                    {f.label}: {f.url}
                  </a>
                ))}
                {s.rubric && rubricSlug && <RubricView slug={rubricSlug} snapshot={s.rubric} />}
                {s.feedback && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{s.feedback}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {done ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-4 text-sm text-emerald-800 dark:text-emerald-200">
          ✅ Entrega enviada. El instructor la calificará contra la rúbrica.
          <button className="ml-2 underline" onClick={() => setDone(false)}>
            Enviar otra versión
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              {
                resourceId: resource.id,
                courseId,
                kind: 'handson',
                content: notes,
                repoUrl: repoUrl.trim() || undefined,
                files: filledLinks,
              },
              { onSuccess: () => setDone(true) },
            );
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Repositorio o notebook (GitHub, GitLab, Colab, Kaggle)
            </label>
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/tu-usuario/tu-repo"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
          {artifacts.map((a, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{a.label}</label>
              <input
                value={links[i] || ''}
                onChange={(e) => setLinks((s) => ({ ...s, [i]: e.target.value }))}
                placeholder="Enlace (URL)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
          ))}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notas para el evaluador (opcional): decisiones, limitaciones, cómo ejecutar…"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
          <button
            type="submit"
            disabled={!canSubmit || create.isPending}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium px-5 py-2 rounded-lg text-sm"
          >
            {create.isPending ? 'Enviando…' : 'Enviar entrega'}
          </button>
          {!canSubmit && <p className="text-xs text-gray-400">Añade al menos el repositorio o un enlace de artefacto.</p>}
        </form>
      )}
    </div>
  );
}
