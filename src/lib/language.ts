// src/lib/language.ts
import { useEffect, useState } from 'react';

import { loadJSON, saveJSON } from './storage';

export type LanguageCode = 'fr' | 'en';

export type Language = {
  code: LanguageCode;
  nom: string;
};

export const LANGUAGES: Language[] = [
  { code: 'fr', nom: 'Français' },
  { code: 'en', nom: 'English' },
];

const KEY = 'dps.language.v1';
const DEFAULT: LanguageCode = 'fr';

// Store réactif minimal (même pattern que ton store de triage)
let current: LanguageCode = DEFAULT;
const listeners = new Set<(code: LanguageCode) => void>();

// Chargement initial asynchrone (une seule fois)
loadJSON<LanguageCode>(KEY, DEFAULT).then((saved) => {
  if (saved && saved !== current) {
    current = saved;
    listeners.forEach((l) => l(current));
  }
});

function setLanguageGlobal(code: LanguageCode) {
  if (code === current) return;
  current = code;
  saveJSON(KEY, code);
  listeners.forEach((l) => l(code));
}

export function useLanguage() {
  const [code, setCode] = useState<LanguageCode>(current);

  useEffect(() => {
    const listener = (next: LanguageCode) => setCode(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const language = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

  return {
    language,
    setLanguage: (next: LanguageCode) => setLanguageGlobal(next),
  };
}