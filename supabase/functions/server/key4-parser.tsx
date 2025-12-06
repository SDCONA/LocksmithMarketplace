/**
 * Key4.com Product Parser
 * Fetches and parses product information from key4.com
 */

interface Key4Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  productUrl: string;
  availability: string;
  sku?: string;
}

export async function parseKey4Products(searchQuery: string): Promise<Key4Product[]> {
  try {
    console.log(`Parsing Key4.com for query: ${searchQuery}`);
    
    // Construct the search URL for key4.com
    const searchUrl = `https://www.key4.com/search?q=${encodeURIComponent(searchQuery)}`;
    console.log(`Fetching URL: ${searchUrl}`);
    
    // Fetch the page
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      console.error(`Key4.com fetch failed with status: ${response.status}`);
      throw new Error(`Failed to fetch from key4.com: ${response.status}`);
    }

    const html = await response.text();
    console.log(`Received HTML response (length: ${html.length})`);
    
    // Parse the HTML to extract product information
    const products = parseKey4HTML(html, searchQuery);
    
    console.log(`Parsed ${products.length} products from Key4.com`);
    return products;
    
  } catch (error) {
    console.error(`Error parsing Key4.com: ${error}`);
    throw error;
  }
}

function parseKey4HTML(html: string, searchQuery: string): Key4Product[] {
  const products: Key4Product[] = [];
  
  try {
    // Extract product data using regex patterns
    // This is a simplified parser - actual implementation would need to be tested against real key4.com HTML
    
    // Look for product cards/items in the HTML
    // Common patterns: product-card, product-item, item-card, etc.
    const productRegex = /<div[^>]*class="[^"]*(?:product|item)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    const matches = Array.from(html.matchAll(productRegex));
    
    console.log(`Found ${matches.length} potential product containers`);
    
    if (matches.length === 0) {
      // Try alternative parsing strategy - look for price indicators
      return parseByPriceIndicators(html, searchQuery);
    }
    
    for (let i = 0; i < Math.min(matches.length, 20); i++) {
      const match = matches[i];
      const productHtml = match[1] || match[0];
      
      try {
        const product = extractProductData(productHtml, i, searchQuery);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        console.error(`Error parsing product ${i}: ${error}`);
      }
    }
    
  } catch (error) {
    console.error(`Error in parseKey4HTML: ${error}`);
  }
  
  return products;
}

function parseByPriceIndicators(html: string, searchQuery: string): Key4Product[] {
  const products: Key4Product[] = [];
  
  // Look for price patterns - most e-commerce sites have clear price indicators
  const priceRegex = /\$\s*(\d+(?:\.\d{2})?)/g;
  const prices = Array.from(html.matchAll(priceRegex));
  
  console.log(`Found ${prices.length} price indicators`);
  
  // Extract up to 10 products based on price indicators
  const limit = Math.min(prices.length, 10);
  for (let i = 0; i < limit; i++) {
    products.push({
      id: `key4-${Date.now()}-${i}`,
      name: `Automotive Key - ${searchQuery}`,
      description: `Compatible automotive key product from Key4.com`,
      price: parseFloat(prices[i][1]),
      image: 'https://images.unsplash.com/photo-1750558222639-3573a142508d?w=400&h=400&fit=crop',
      inStock: true,
      productUrl: `https://www.key4.com/search?q=${encodeURIComponent(searchQuery)}`,
      availability: 'In Stock',
    });
  }
  
  return products;
}

function extractProductData(productHtml: string, index: number, searchQuery: string): Key4Product | null {
  try {
    // Extract title
    const titleMatch = productHtml.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i) ||
                      productHtml.match(/title="([^"]+)"/i) ||
                      productHtml.match(/alt="([^"]+)"/i);
    const title = titleMatch ? stripHtml(titleMatch[1]) : `Automotive Key Product ${index + 1}`;
    
    // Extract price
    const priceMatch = productHtml.match(/\$\s*(\d+(?:\.\d{2})?)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    
    if (price === 0) {
      return null; // Skip products without valid price
    }
    
    // Extract original price (for sales/discounts)
    const originalPriceMatch = productHtml.match(/(?:was|regular)[^$]*\$\s*(\d+(?:\.\d{2})?)/i);
    const originalPrice = originalPriceMatch ? parseFloat(originalPriceMatch[1]) : undefined;
    
    // Extract image
    const imageMatch = productHtml.match(/<img[^>]*src="([^"]+)"/i);
    let image = imageMatch ? imageMatch[1] : 'https://images.unsplash.com/photo-1750558222639-3573a142508d?w=400&h=400&fit=crop';
    
    // Make image URL absolute if it's relative
    if (image.startsWith('/')) {
      image = `https://www.key4.com${image}`;
    } else if (image.startsWith('//')) {
      image = `https:${image}`;
    }
    
    // Extract product URL
    const urlMatch = productHtml.match(/href="([^"]+)"/i);
    let productUrl = urlMatch ? urlMatch[1] : `https://www.key4.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    // Make product URL absolute if it's relative
    if (productUrl.startsWith('/')) {
      productUrl = `https://www.key4.com${productUrl}`;
    }
    
    // Extract stock status
    const outOfStockMatch = productHtml.match(/(?:out of stock|sold out|unavailable)/i);
    const inStockMatch = productHtml.match(/(?:in stock|available|add to cart)/i);
    const inStock = outOfStockMatch ? false : (inStockMatch ? true : true); // Default to true
    
    // Extract SKU if available
    const skuMatch = productHtml.match(/(?:sku|item|part)[:\s#]*([A-Z0-9-]+)/i);
    const sku = skuMatch ? skuMatch[1] : undefined;
    
    // Extract description
    const descMatch = productHtml.match(/<p[^>]*class="[^"]*description[^"]*"[^>]*>(.*?)<\/p>/i);
    const description = descMatch ? stripHtml(descMatch[1]) : `${title} - Compatible automotive key`;
    
    return {
      id: `key4-${Date.now()}-${index}`,
      name: title,
      description: description.substring(0, 200),
      price,
      originalPrice,
      image,
      inStock,
      productUrl,
      availability: inStock ? 'In Stock' : 'Out of Stock',
      sku,
    };
    
  } catch (error) {
    console.error(`Error extracting product data: ${error}`);
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}
