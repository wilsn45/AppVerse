import functions from '@react-native-firebase/functions';
import { IApiClient } from './IApiClient';

export class FirebaseApiClient implements IApiClient {
  async call<TRequest = any, TResponse = any>(
    url: string,
    payload: TRequest
  ): Promise<TResponse> {
    try {
      const callable = functions().httpsCallable(url);
      const response = await callable(payload);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Unknown Firebase error');
      }

      return response.data as TResponse;
    } catch (error) {
      console.error(`Firebase call failed for ${url}`, error);
      throw error;
    }
  }
}