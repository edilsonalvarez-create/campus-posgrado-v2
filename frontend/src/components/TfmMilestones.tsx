import { useState } from 'react';
import { useTfm, useTfmEnroll, useSubmitMilestone, type TfmMilestone } from '../hooks/useEvaluation';
import { RubricView } from './RubricView';

const URL_RE = /^https?:\/\/\S+$/i;
const STATUS_LABEL: Record<string, string> = {
  submitted: 'Entregado · en revisión',
  changes_requested: 'Cambios solicitados',
  approved: 'Aprobado',
};

export function TfmMilestones() {
  const { data: tfm, isLoading } = useTfm();
  const enroll = useTfmEnroll();

  if (isLoading) return <p className="text-gray-500">Cargando TFM…</p>;
  if (!tfm) return <p className="text-gray-500">No se pudo cargar el TFM.</p>;

  if (!tfm.enrollment) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
          El Proyecto Fin de Programa se desarrolla en 4 hitos con rúbrica y un director asignado. Al inscribirte se
          abre el proceso.
        </p>
        <button
          onClick={() => enroll.mutate()}
          disabled={enroll.isPending}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          {enroll.isPending ? 'Abriendo…' : 'Inscribirme en el TFM'}
        </button>
      </div>
    );
  }

  const approved = tfm.milestones.filter((m) => m.submission?.status === 'approved').length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-gray-900 dark:text-white">
          {approved}/4 hitos aprobados · nota ponderada {tfm.weightedScore}/100
        </span>
        <span className="text-gray-500">
          Director: {tfm.enrollment.directorName || 'sin asignar'} · estado {tfm.enrollment.status}
        </span>
      </div>
      <ol className="space-y-4">
        {tfm.milestones.map((m, i) => (
          <MilestoneCard key={m.slug} m={m} index={i} prevApproved={i === 0 || tfm.milestones[i - 1].submission?.status === 'approved'} />
        ))}
      </ol>
    </div>
  );
}

function MilestoneCard({ m, index, prevApproved }: { m: TfmMilestone; index: number; prevApproved: boolean }) {
  const submit = useSubmitMilestone();
  const s = m.submission;
  const locked = !prevApproved && !s;
  const [open, setOpen] = useState(index === 0 || s?.status === 'changes_requested');
  const [content, setContent] = useState(s?.content || '');
  const [repoUrl, setRepoUrl] = useState(s?.repoUrl || '');
  const [videoUrl, setVideoUrl] = useState(s?.defenseVideoUrl || '');

  const badge =
    s?.status === 'approved'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      : s?.status === 'changes_requested'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        : s
          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';

  return (
    <li className={`border rounded-lg ${locked ? 'border-dashed border-gray-300 dark:border-gray-700 opacity-60' : 'border-gray-200 dark:border-gray-700'}`}>
      <button onClick={() => !locked && setOpen((o) => !o)} className="w-full text-left px-4 py-3 flex items-center justify-between gap-3">
        <span className="font-medium text-gray-900 dark:text-white text-sm">
          {locked ? '🔒 ' : ''}
          {m.title} <span className="text-gray-400">· {m.weight}%</span>
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${badge}`}>
          {s ? STATUS_LABEL[s.status] : locked ? 'Requiere el hito anterior' : 'Pendiente'}
          {s?.grade != null ? ` · ${s.grade}/100` : ''}
        </span>
      </button>

      {open && !locked && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{m.description}</p>
          {m.templateUrl && (
            <a href={m.templateUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline block mb-2">
              Plantilla del hito ↗
            </a>
          )}
          <details className="mb-3">
            <summary className="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400">Ver rúbrica</summary>
            <RubricView slug={m.rubricSlug} snapshot={s?.rubric || undefined} />
          </details>

          {s?.directorNote && (
            <p className="mb-3 text-sm border-l-2 border-amber-400 pl-2 text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Nota del director: </span>
              {s.directorNote}
            </p>
          )}
          {s?.feedback && (
            <p className="mb-3 text-sm border-l-2 border-emerald-400 pl-2 text-gray-700 dark:text-gray-300">{s.feedback}</p>
          )}

          {s?.status === 'approved' ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">✅ Hito aprobado.</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate({
                  slug: m.slug,
                  content: content.trim(),
                  repoUrl: URL_RE.test(repoUrl.trim()) ? repoUrl.trim() : undefined,
                  defenseVideoUrl: m.requiresVideo && URL_RE.test(videoUrl.trim()) ? videoUrl.trim() : undefined,
                });
              }}
              className="space-y-2"
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Documento del hito (o resumen + enlace al documento)…"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Repositorio / documento (URL)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              {m.requiresVideo && (
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enlace al vídeo de defensa (10 min) — obligatorio"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              )}
              <button
                type="submit"
                disabled={submit.isPending || (content.trim().length < 30 && !URL_RE.test(repoUrl.trim()))}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-1.5 rounded-lg"
              >
                {submit.isPending ? 'Enviando…' : s ? 'Reenviar hito' : 'Entregar hito'}
              </button>
            </form>
          )}
        </div>
      )}
    </li>
  );
}
