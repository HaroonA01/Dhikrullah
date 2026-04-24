import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'dhikrullah:';

export const storageKey = (suffix: string): string => `${PREFIX}${suffix}`;

export async function getJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // swallow
  }
}

export async function multiGetJSON<T>(keys: string[]): Promise<Record<string, T | null>> {
  const entries = await AsyncStorage.multiGet(keys);
  const out: Record<string, T | null> = {};
  for (const [k, v] of entries) {
    try {
      out[k] = v ? (JSON.parse(v) as T) : null;
    } catch {
      out[k] = null;
    }
  }
  return out;
}
