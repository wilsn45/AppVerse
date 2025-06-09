export interface IApiClient {
  call<TRequest = any, TResponse = any>(
    url: string,
    payload: TRequest
  ): Promise<TResponse>;
}