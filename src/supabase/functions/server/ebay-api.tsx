// ========================================
// EBAY API INTEGRATION
// Multi-source product search for automotive keys
// ========================================

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

export class EbayAPI {
  private appId: string;
  private isConfigured: boolean;

  constructor() {
    this.appId = Deno.env.get('EBAY_APP_ID') || '';
    this.isConfigured = !!this.appId;
  }

  /**
   * Check if eBay API is configured
   */
  isEnabled(): boolean {
    return this.isConfigured;
  }

  /**
   * Search for automotive keys on eBay
   * @param query - Search query (e.g., "honda civic key", "toyota key fob")
   * @param limit - Maximum results to return (default: 20)
   */
  async searchKeys(query: string, limit: number = 20): Promise<EbayProduct[]> {
    if (!this.isConfigured) {
      console.log('eBay API not configured - skipping eBay search');
      return [];
    }

    try {
      console.log(`[eBay API] Starting search for query: "${query}" with App ID: ${this.appId.substring(0, 10)}...`);
      
      // eBay Finding API endpoint
      const endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';
      
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

      const fullUrl = `${endpoint}?${params.toString()}`;
      console.log(`[eBay API] Request URL: ${fullUrl.substring(0, 150)}...`);
      
      const response = await fetch(fullUrl);
      
      console.log(`[eBay API] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[eBay API] Error response body: ${errorText}`);
        return [];
      }

      const data = await response.json();
      console.log(`[eBay API] Response received:`, JSON.stringify(data).substring(0, 500));

      // Parse eBay response
      const searchResult = data?.findItemsAdvancedResponse?.[0];
      const ack = searchResult?.ack?.[0];
      console.log(`[eBay API] Acknowledgment status: ${ack}`);
      
      // Check for errors
      if (ack === 'Failure' || ack === 'PartialFailure') {
        const errors = searchResult?.errorMessage?.[0]?.error || [];
        console.error(`[eBay API] API returned errors:`, JSON.stringify(errors));
        return [];
      }
      
      const items = searchResult?.searchResult?.[0]?.item || [];

      if (!Array.isArray(items) || items.length === 0) {
        console.log(`[eBay API] No results found for query: ${query}`);
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

      console.log(`Found ${products.length} eBay products for query: ${query}`);
      return products;

    } catch (error) {
      console.error('Error searching eBay:', error);
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