// ========================================
// EBAY API INTEGRATION
// Multi-source product search for automotive keys
// Now using ScraperAPI to bypass IP blocking
// Uses KV store for persistent caching and rate limit tracking
// ========================================

import * as kv from './kv_store.tsx';

interface EbayProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  url: string;
  condition: string;
  source: 'ebay';
  sellerName?: string;
  shippingCost?: number;
  location?: string;
}

interface CachedData {
  data: EbayProduct[];
  timestamp: number;
}

interface RateLimitData {
  exceeded: boolean;
  resetTime: number;
}

export class EbayAPI {
  private appId: string;
  private devId: string;
  private certId: string;
  private scraperApiKey: string;
  private isConfigured: boolean;
  private cacheDuration: number = 86400000; // 24 hours in milliseconds (increased from 1 hour)
  private rateLimitDuration: number = 7200000; // 2 hours cooldown (increased from 1 hour)

  constructor() {
    this.appId = Deno.env.get('EBAY_APP_ID') || '';
    this.devId = Deno.env.get('EBAY_DEV_ID') || '';
    this.certId = Deno.env.get('EBAY_CERT_ID') || '';
    this.scraperApiKey = Deno.env.get('SCRAPERAPI_KEY') || '';
    this.isConfigured = !!this.appId && !!this.devId && !!this.certId && !!this.scraperApiKey;
    
    // Log configuration status (without exposing keys)
    console.log('[eBay API Constructor] Checking configuration...');
    console.log('[eBay API Constructor] Has App ID:', !!this.appId);
    console.log('[eBay API Constructor] Has Dev ID:', !!this.devId);
    console.log('[eBay API Constructor] Has Cert ID:', !!this.certId);
    console.log('[eBay API Constructor] Has ScraperAPI Key:', !!this.scraperApiKey);
    console.log('[eBay API Constructor] Is Configured:', this.isConfigured);
    
    if (this.isConfigured) {
      console.log('[eBay API] ✅ Fully configured with eBay credentials + ScraperAPI proxy');
    } else {
      console.log('[eBay API] Missing credentials:', {
        hasAppId: !!this.appId,
        hasDevId: !!this.devId,
        hasCertId: !!this.certId,
        hasScraperApiKey: !!this.scraperApiKey
      });
    }
  }

  /**
   * Check if eBay API is configured
   */
  isEnabled(): boolean {
    return this.isConfigured;
  }

  /**
   * Check if we're currently rate limited (persisted in KV store)
   */
  private async isRateLimited(): Promise<boolean> {
    try {
      const rateLimitData = await kv.get<RateLimitData>('ebay_rate_limit');
      
      if (!rateLimitData || !rateLimitData.exceeded) {
        return false;
      }
      
      // Check if cooldown period has passed
      if (Date.now() > rateLimitData.resetTime) {
        console.log('[eBay API] Rate limit cooldown complete - resetting');
        await kv.del('ebay_rate_limit');
        return false;
      }
      
      const minutesRemaining = Math.ceil((rateLimitData.resetTime - Date.now()) / 60000);
      console.log(`[eBay API] Rate limit active - ${minutesRemaining} minutes remaining`);
      return true;
    } catch (error) {
      console.error('[eBay API] Error checking rate limit:', error);
      return false;
    }
  }

  /**
   * Set rate limit in KV store
   */
  private async setRateLimited(): Promise<void> {
    try {
      const resetTime = Date.now() + this.rateLimitDuration;
      const resetDate = new Date(resetTime).toISOString();
      
      await kv.set('ebay_rate_limit', {
        exceeded: true,
        resetTime
      });
      
      console.log(`✅ [eBay API] Rate limit successfully stored in KV database`);
      console.log(`   → Cooldown until: ${resetDate}`);
      console.log(`   → Duration: 1 hour (${this.rateLimitDuration}ms)`);
    } catch (error) {
      console.error('❌ [eBay API] FAILED to set rate limit in KV store:', error);
      throw error; // Re-throw so we know if storage failed
    }
  }

  /**
   * Get cached results from KV store
   */
  private async getCachedResults(query: string): Promise<EbayProduct[] | null> {
    try {
      const cacheKey = `ebay_cache_${query.toLowerCase().trim()}`;
      const cached = await kv.get<CachedData>(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log(`[eBay API] Using cached results for: "${query}" (${cached.data.length} items)`);
        return cached.data;
      }
      
      return null;
    } catch (error) {
      console.error('[eBay API] Error reading cache:', error);
      return null;
    }
  }

  /**
   * Cache search results in KV store
   */
  private async cacheResults(query: string, data: EbayProduct[]): Promise<void> {
    try {
      const cacheKey = `ebay_cache_${query.toLowerCase().trim()}`;
      await kv.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      console.log(`[eBay API] Cached ${data.length} results for: "${query}"`);
    } catch (error) {
      console.error('[eBay API] Error caching results:', error);
    }
  }

  /**
   * Search for automotive keys on eBay
   * @param query - Search query (e.g., "honda civic key", "toyota key fob")
   * @param limit - Maximum results to return (default: 20)
   */
  async searchKeys(query: string, limit: number = 20): Promise<EbayProduct[]> {
    console.log(`[eBay API] searchKeys called with query="${query}", limit=${limit}`);
    console.log(`[eBay API] Configuration status: isConfigured=${this.isConfigured}`);
    
    if (!this.isConfigured) {
      console.log('[eBay API] ❌ Not configured - skipping eBay search. Please check EBAY_APP_ID, EBAY_DEV_ID, EBAY_CERT_ID, and SCRAPERAPI_KEY environment variables.');
      return [];
    }

    // Check if we're rate limited (persistent check)
    console.log(`[eBay API] Checking if rate limited...`);
    const isLimited = await this.isRateLimited();
    console.log(`[eBay API] Rate limited status: ${isLimited}`);
    
    if (isLimited) {
      console.log(`⏸️  [eBay API] Skipping search - rate limit active. Check /deals/ebay/status for details.`);
      return [];
    }

    // Check cache first
    console.log(`[eBay API] Checking cache for query: "${query}"`);
    const cachedResults = await this.getCachedResults(query);
    if (cachedResults !== null) {
      console.log(`[eBay API] ✅ Returning ${cachedResults.length} cached results`);
      return cachedResults;
    }
    console.log(`[eBay API] No cached results found, proceeding with fresh search`);

    try {
      console.log(`[eBay API] Starting fresh search for query: "${query}"`);
      
      // eBay Finding API endpoint
      const ebayEndpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';
      
      // Build search query with automotive key filters
      const params = new URLSearchParams({
        'OPERATION-NAME': 'findItemsAdvanced',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': this.appId,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        'keywords': query,
        'paginationInput.entriesPerPage': limit.toString(),
        'sortOrder': 'BestMatch',
        // Filter for Buy It Now items (easier for users)
        'itemFilter(0).name': 'ListingType',
        'itemFilter(0).value': 'FixedPrice',
        // Filter for new and used items
        'itemFilter(1).name': 'Condition',
        'itemFilter(1).value(0)': '1000', // New
        'itemFilter(1).value(1)': '3000', // Used
      });

      const ebayUrl = `${ebayEndpoint}?${params.toString()}`;
      
      // Route through ScraperAPI to bypass IP blocking
      // eBay is a protected domain, requires premium=true
      const scraperApiUrl = `http://api.scraperapi.com?api_key=${this.scraperApiKey}&premium=true&url=${encodeURIComponent(ebayUrl)}`;
      
      console.log(`[eBay API] 🔄 Routing through ScraperAPI proxy (premium mode for eBay)...`);
      
      const response = await fetch(scraperApiUrl);
      
      console.log(`[eBay API] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.error(`[eBay API] ❌ ScraperAPI request failed: ${response.status}`);
        const errorText = await response.text();
        console.error(`[eBay API] Error details:`, errorText.substring(0, 500));
        return [];
      }
      
      // Always parse as JSON (eBay returns JSON even for errors)
      const data = await response.json();

      // Check if response contains error in JSON format
      if (data?.errorMessage) {
        const errors = data.errorMessage[0]?.error || [];
        console.error(`[eBay API] API error response:`, JSON.stringify(errors, null, 2));
        
        // Check if this is a rate limit error (Error ID 10001)
        const isRateLimitError = errors.some((err: any) => 
          err.errorId?.[0] === '10001' && err.domain?.[0] === 'Security'
        );
        
        if (isRateLimitError) {
          console.warn('🚨 [eBay API] RATE LIMIT EXCEEDED - Setting 2 hour cooldown in KV store');
          await this.setRateLimited();
        }
        
        return [];
      }

      // Parse eBay response
      const searchResult = data?.findItemsAdvancedResponse?.[0];
      const ack = searchResult?.ack?.[0];
      console.log(`[eBay API] Acknowledgment status: ${ack}`);
      
      // Check for errors (including rate limiting)
      if (ack === 'Failure' || ack === 'PartialFailure') {
        const errors = searchResult?.errorMessage?.[0]?.error || [];
        console.error(`[eBay API] API returned errors:`, JSON.stringify(errors, null, 2));
        
        // Check if this is a rate limit error (Error ID 10001)
        const isRateLimitError = errors.some((err: any) => 
          err.errorId?.[0] === '10001' && err.domain?.[0] === 'Security'
        );
        
        if (isRateLimitError) {
          console.warn('🚨 [eBay API] RATE LIMIT EXCEEDED - Setting 2 hour cooldown');
          await this.setRateLimited();
        }
        
        return [];
      }
      
      const items = searchResult?.searchResult?.[0]?.item || [];

      if (!Array.isArray(items) || items.length === 0) {
        console.log(`[eBay API] No results found for query: ${query}`);
        // Cache empty results to avoid repeated API calls
        await this.cacheResults(query, []);
        return [];
      }

      // Transform eBay items to our product format
      const products: EbayProduct[] = items.map((item: any) => {
        const itemId = item.itemId?.[0] || '';
        const title = item.title?.[0] || 'Unknown Product';
        const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0');
        const currency = item.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] || 'USD';
        const imageUrl = item.galleryURL?.[0] || item.pictureURLLarge?.[0] || '';
        const url = item.viewItemURL?.[0] || '';
        const condition = item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown';
        const sellerName = item.sellerInfo?.[0]?.sellerUserName?.[0] || '';
        const shippingCost = parseFloat(item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__ || '0');
        const location = item.location?.[0] || '';

        return {
          id: `ebay-${itemId}`,
          title,
          price,
          currency,
          imageUrl,
          url,
          condition,
          source: 'ebay',
          sellerName,
          shippingCost: shippingCost > 0 ? shippingCost : undefined,
          location,
        };
      });

      console.log(`[eBay API] ✅ Successfully found ${products.length} products via ScraperAPI for query: "${query}"`);
      await this.cacheResults(query, products);
      return products;

    } catch (error) {
      console.error('[eBay API] ❌ Unexpected error searching eBay:', error);
      return [];
    }
  }

  /**
   * Search by vehicle make/model/year
   * @param make - Vehicle make (e.g., "Honda")
   * @param model - Vehicle model (e.g., "Civic")
   * @param year - Vehicle year (e.g., "2015")
   */
  async searchByVehicle(make: string, model?: string, year?: string): Promise<EbayProduct[]> {
    let query = `${make}`;
    if (model) query += ` ${model}`;
    if (year) query += ` ${year}`;
    query += ' key fob remote replacement';

    return this.searchKeys(query);
  }
}

// Export singleton instance
export const ebayAPI = new EbayAPI();