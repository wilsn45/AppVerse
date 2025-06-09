import { IApiClient } from './IApiClient';

export class RESTApiClient implements IApiClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async call<TRequest = any, TResponse = any>(
    url: string,
    payload: TRequest
  ): Promise<TResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'REST API error');
      }

      return data;
    } catch (error) {
      console.error(`REST call failed: ${url}`, error);
      throw error;
    }
  }
}
