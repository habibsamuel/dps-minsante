import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  triage: 'dps.triage.v1',
  history: 'dps.history.v1',
  profile: 'dps.profile.v1',
};

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // stockage indisponible : on continue en mémoire
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}
