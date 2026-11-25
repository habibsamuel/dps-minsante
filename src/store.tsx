import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Consultation } from '@/lib/api';
import { loadJSON, removeKey, saveJSON, STORAGE_KEYS } from '@/lib/storage';
import type { Answers, TriageResult } from '@/lib/triage';

export type Role = 'patient' | 'medecin';

export type Profile = { name: string; phone: string; city: string; role: Role };

type StoredTriage = { answers: Answers; result: TriageResult | null; doctorId: string | null };

type TriageContextValue = {
  ready: boolean;
  answers: Answers;
  result: TriageResult | null;
  doctorId: string | null;
  history: Consultation[];
  profile: Profile | null;
  setAnswer: (questionId: string, value: string | string[]) => void;
  setResult: (result: TriageResult) => void;
  selectDoctor: (doctorId: string) => void;
  addConsultation: (consultation: Consultation) => void;
  saveProfile: (profile: Profile) => void;
  resetTriage: () => void;
  signOut: () => void;
};

const emptyTriage: StoredTriage = { answers: {}, result: null, doctorId: null };

const TriageContext = createContext<TriageContextValue | null>(null);

export function TriageProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [triage, setTriage] = useState<StoredTriage>(emptyTriage);
  const [history, setHistory] = useState<Consultation[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const [storedTriage, storedHistory, storedProfile] = await Promise.all([
        loadJSON<StoredTriage>(STORAGE_KEYS.triage, emptyTriage),
        loadJSON<Consultation[]>(STORAGE_KEYS.history, []),
        loadJSON<Profile | null>(STORAGE_KEYS.profile, null),
      ]);
      setTriage(storedTriage);
      setHistory(storedHistory);
      setProfile(storedProfile);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) void saveJSON(STORAGE_KEYS.triage, triage);
  }, [ready, triage]);

  useEffect(() => {
    if (ready) void saveJSON(STORAGE_KEYS.history, history);
  }, [ready, history]);

  useEffect(() => {
    if (ready) void saveJSON(STORAGE_KEYS.profile, profile);
  }, [ready, profile]);

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setTriage((current) => ({ ...current, answers: { ...current.answers, [questionId]: value } }));
  }, []);

  const setResult = useCallback((result: TriageResult) => {
    setTriage((current) => ({ ...current, result }));
  }, []);

  const selectDoctor = useCallback((doctorId: string) => {
    setTriage((current) => ({ ...current, doctorId }));
  }, []);

  const addConsultation = useCallback((consultation: Consultation) => {
    setHistory((current) => [consultation, ...current.filter((item) => item.id !== consultation.id)]);
  }, []);

  const resetTriage = useCallback(() => setTriage(emptyTriage), []);

  const signOut = useCallback(() => {
    setProfile(null);
    void removeKey(STORAGE_KEYS.profile);
  }, []);

  const value = useMemo<TriageContextValue>(
    () => ({
      ready,
      answers: triage.answers,
      result: triage.result,
      doctorId: triage.doctorId,
      history,
      profile,
      setAnswer,
      setResult,
      selectDoctor,
      addConsultation,
      saveProfile: setProfile,
      resetTriage,
      signOut,
    }),
    [ready, triage, history, profile, setAnswer, setResult, selectDoctor, addConsultation, resetTriage, signOut],
  );

  return <TriageContext.Provider value={value}>{children}</TriageContext.Provider>;
}

export function useTriage(): TriageContextValue {
  const context = useContext(TriageContext);
  if (!context) throw new Error('useTriage doit être utilisé dans <TriageProvider>');
  return context;
}
