export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  /**
   * 'off'      -> sempre usa a API real
   * 'fallback' -> usa mocks quando a API não responde (rede fora, 404, 5xx)
   * 'always'   -> usa mocks sem chamar a API
   */
  mockMode: 'fallback' as 'off' | 'fallback' | 'always',
};
