// Frontend API configuration
// Update BASE_API_URL to point to your PHP backend (e.g. http://localhost:8000 or https://example.com)
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_API_URL = 'http://localhost:8000';

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('api_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function apiPost(path: string, data: any) {
  const url = `${BASE_API_URL}/${path}`;
  const headers = await getAuthHeaders();
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  let payload: any;
  try {
    payload = await res.json();
  } catch (e) {
    const text = await res.text();
    throw new Error(`Invalid JSON response (${res.status}): ${text}`);
  }

  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

export async function apiGet(path: string) {
  const url = `${BASE_API_URL}/${path}`;
  const headers = await getAuthHeaders();
  const res = await fetch(url, { method: 'GET', headers });
  const payload = await res.json();
  if (!res.ok) throw new Error(`API Error ${res.status}: ${JSON.stringify(payload)}`);
  return payload;
}
