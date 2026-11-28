import { useEffect, useState } from "react";

import { loadJSON, saveJSON, STORAGE_KEYS } from "./storage";
import type { Level, TriageResult } from "./triage";

export type EvaluationEntry = {
  id: string;
  date: string;
  score: number;
  level: Level;
  /** Indice de santé : 100 = au mieux, 0 = au plus bas. */
  index: number;
};

// Score maximal théorique du moteur de triage (symptôme 3 + durée 2 + intensité 3 + fièvre 2 + antécédents 2 + âge 1).
const MAX_SCORE = 13;
const MAX_ENTRIES = 60;

/** Transforme le score de triage en indice de santé (0 à 100). */
export function healthIndex(
  result: Pick<TriageResult, "score" | "level">,
): number {
  const raw = Math.round(100 - (result.score / MAX_SCORE) * 100);
  const bounded = Math.max(0, Math.min(100, raw));
  return result.level === "urgence" ? Math.min(bounded, 25) : bounded;
}

/* ------------------------------------------------------------------ */
/*  Store réactif minimal (même principe que language.ts)              */
/* ------------------------------------------------------------------ */

let entries: EvaluationEntry[] = [];
const listeners = new Set<(list: EvaluationEntry[]) => void>();
const emit = () => listeners.forEach((listener) => listener(entries));

loadJSON<EvaluationEntry[]>(STORAGE_KEYS.evaluations, []).then((saved) => {
  const ids = new Set(saved.map((entry) => entry.id));
  entries = [...saved, ...entries.filter((entry) => !ids.has(entry.id))];
  emit();
});

export function addEvaluation(result: TriageResult) {
  const entry: EvaluationEntry = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    score: result.score,
    level: result.level,
    index: healthIndex(result),
  };
  entries = [...entries, entry].slice(-MAX_ENTRIES);
  saveJSON(STORAGE_KEYS.evaluations, entries);
  emit();
}

export function clearEvaluations() {
  entries = [];
  saveJSON(STORAGE_KEYS.evaluations, entries);
  emit();
}

export function useEvaluations(): EvaluationEntry[] {
  const [list, setList] = useState(entries);

  useEffect(() => {
    setList(entries);
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  return list;
}

/* ------------------------------------------------------------------ */
/*  Courbes et analyse                                                 */
/* ------------------------------------------------------------------ */

export type Trend = "up" | "down" | "flat" | "none";
export type SeriesPoint = { label: string; value: number };

export type Insights = {
  last?: EvaluationEntry;
  delta: number | null;
  trend: Trend;
  /** Courbe de croissance : indice de santé. */
  health: SeriesPoint[];
  /** Courbe de redressement : % de récupération depuis le point le plus bas. */
  recovery: SeriesPoint[];
  analysis: string;
};

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function analysisFor(
  last: EvaluationEntry | undefined,
  delta: number | null,
  trend: Trend,
  count: number,
): string {
  if (!last)
    return "Fais ta première auto-évaluation pour commencer à suivre ton évolution.";
  if (last.level === "urgence") {
    return "Ta dernière évaluation signale des signes d’alerte. Ne reste pas dans l’attente : rends-toi au centre de santé le plus proche.";
  }
  if (count === 1) {
    return "Première auto-évaluation enregistrée. Refais le point dans 48 h pour voir apparaître ta courbe d’évolution.";
  }
  if (trend === "up") {
    return `Ton indice a gagné ${delta} points depuis la dernière évaluation : les signes décrits s’améliorent. Continue à te reposer et refais le point dans 48 h.`;
  }
  if (trend === "down") {
    return `Ton indice a baissé de ${Math.abs(delta ?? 0)} points. Si les symptômes persistent ou s’aggravent, contacte un médecin.`;
  }
  return "Ton état est stable depuis la dernière évaluation. Surveille l’évolution et refais le point si quelque chose change.";
}

export function buildInsights(list: EvaluationEntry[]): Insights {
  const last = list[list.length - 1];
  const prev = list[list.length - 2];
  const delta = last && prev ? last.index - prev.index : null;
  const trend: Trend =
    delta === null ? "none" : delta >= 5 ? "up" : delta <= -5 ? "down" : "flat";

  const health = list.map((entry) => ({
    label: shortDate(entry.date),
    value: entry.index,
  }));

  let worst = 100;
  const recovery = list.map((entry) => {
    worst = Math.min(worst, entry.index);
    const value =
      worst >= 100
        ? 100
        : Math.round(((entry.index - worst) / (100 - worst)) * 100);
    return { label: shortDate(entry.date), value };
  });

  return {
    last,
    delta,
    trend,
    health,
    recovery,
    analysis: analysisFor(last, delta, trend, list.length),
  };
}
