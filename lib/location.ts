import * as Location from 'expo-location';

export interface LocationData {
  lat: number;
  lon: number;
  label: string;
  source: 'gps' | 'manual';
}

export const reverseGeocodeLabel = async (lat: number, lon: number): Promise<string> => {
  try {
    const res = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const r = res[0];
    if (!r) return 'Current location';
    const parts = [r.city ?? r.subregion, r.country].filter(Boolean) as string[];
    return parts.length ? parts.join(', ') : 'Current location';
  } catch {
    return 'Current location';
  }
};

export const requestDeviceLocation = async (): Promise<LocationData | null> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const label = await reverseGeocodeLabel(pos.coords.latitude, pos.coords.longitude);
  return {
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
    label,
    source: 'gps',
  };
};

export const geocodeCity = async (query: string): Promise<LocationData | null> => {
  try {
    const res = await Location.geocodeAsync(query);
    const r = res[0];
    if (!r) return null;
    const label = await reverseGeocodeLabel(r.latitude, r.longitude);
    return {
      lat: r.latitude,
      lon: r.longitude,
      label: label || query,
      source: 'manual',
    };
  } catch {
    return null;
  }
};

export const searchCities = async (
  query: string,
  limit = 5,
): Promise<LocationData[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  let raw: Location.LocationGeocodedLocation[] = [];
  try {
    raw = await Location.geocodeAsync(trimmed);
  } catch {
    return [];
  }
  if (!raw.length) return [];

  const slice = raw.slice(0, limit);
  const labels = await Promise.all(
    slice.map((r) =>
      reverseGeocodeLabel(r.latitude, r.longitude).catch(() => trimmed),
    ),
  );

  const seen = new Set<string>();
  const out: LocationData[] = [];
  for (let i = 0; i < slice.length; i++) {
    const r = slice[i];
    const key = `${r.latitude.toFixed(3)},${r.longitude.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      lat: r.latitude,
      lon: r.longitude,
      label: labels[i] || trimmed,
      source: 'manual',
    });
  }
  return out;
};
