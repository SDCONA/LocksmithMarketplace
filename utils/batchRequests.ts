// Request batching to reduce API calls
type BatchRequest = {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
};

class RequestBatcher {
  private queue: Map<string, BatchRequest[]> = new Map();
  private timeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private batchDelay = 50; // milliseconds

  batch<T>(key: string, fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.queue.has(key)) {
        this.queue.set(key, []);
      }

      this.queue.get(key)!.push({ fn, resolve, reject });

      // Clear existing timeout
      const existingTimeout = this.timeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        this.executeBatch(key);
      }, this.batchDelay);

      this.timeouts.set(key, timeout);
    });
  }

  private async executeBatch(key: string) {
    const requests = this.queue.get(key);
    if (!requests || requests.length === 0) return;

    this.queue.delete(key);
    this.timeouts.delete(key);

    // Execute the first request (they should all be the same for a given key)
    // This prevents duplicate identical requests
    const { fn, resolve, reject } = requests[0];

    try {
      const result = await fn();
      // Resolve all requests with the same result
      requests.forEach(req => req.resolve(result));
    } catch (error) {
      // Reject all requests with the same error
      requests.forEach(req => req.reject(error));
    }
  }
}

export const requestBatcher = new RequestBatcher();
