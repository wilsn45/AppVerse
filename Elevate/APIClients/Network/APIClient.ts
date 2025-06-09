// src/network/ApiClient.ts
import { APIConstants } from './APIConstants';
import { getFirebaseAuthToken } from './AuthHelper';

export class APIClient {
  static async get<T>(path: string): Promise<T | null> {
    try {
      const token = await getFirebaseAuthToken(); 
      const response = await fetch(`${APIConstants.BASE_URL}${path}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      return json as T;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  }
}
