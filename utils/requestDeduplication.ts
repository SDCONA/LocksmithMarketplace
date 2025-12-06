// Request deduplication to prevent duplicate API calls
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  // Get cached data if not expired
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Set cached data with TTL (time to live) in seconds
  set(key: string, data: any, ttlSeconds: number = 60): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Create new request
    const promise = fn()
      .then((result) => {
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(keyPrefix?: string) {
    if (keyPrefix) {
      // Clear pending requests
      for (const key of this.pendingRequests.keys()) {
        if (key.startsWith(keyPrefix)) {
          this.pendingRequests.delete(key);
        }
      }
      // Clear cache
      for (const key of this.cache.keys()) {
        if (key.startsWith(keyPrefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.pendingRequests.clear();
      this.cache.clear();
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator();