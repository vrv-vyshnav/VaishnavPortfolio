/**
 * Fetch utilities with timeout and error handling
 */
export class FetchUtils {
  static async fetchWithTimeout(url, options = {}) {
    const { timeout = 10000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`Fetch timeout: Request to ${url} timed out after ${timeout}ms`);
      }

      throw error;
    }
  }

  static async fetchText(url, options = {}) {
    try {
      const response = await this.fetchWithTimeout(url, options);
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch text from ${url}: ${error.message}`);
    }
  }

  static async fetchJson(url, options = {}) {
    try {
      const response = await this.fetchWithTimeout(url, options);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch JSON from ${url}: ${error.message}`);
    }
  }
}