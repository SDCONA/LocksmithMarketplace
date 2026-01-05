import { useState, useEffect } from "react";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { immobiliserCatalog, type CatalogData } from "../data/immobiliser-catalog";

interface ImmobiliserLocationPageProps {
  onBack: () => void;
  onSelectBrand: (brand: string) => void;
}

export function ImmobiliserLocationPage({ onBack, onSelectBrand }: ImmobiliserLocationPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load brands from imported data
    try {
      console.log('[ImmobiliserLocation] Loading catalog...');
      const brandList = Object.keys(immobiliserCatalog).sort();
      console.log('[ImmobiliserLocation] Loaded', brandList.length, 'brands');
      setBrands(brandList);
      setIsLoading(false);
    } catch (error) {
      console.error('[ImmobiliserLocation] Failed to load catalog:', error);
      setIsLoading(false);
    }
  }, []);

  // Filter brands based on search query
  const filteredBrands = brands.filter(brand =>
    brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get model count for a brand
  const getModelCount = (brand: string): number => {
    if (!immobiliserCatalog || !immobiliserCatalog[brand]) return 0;
    return Object.keys(immobiliserCatalog[brand]).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-gray-800 dark:via-gray-900 dark:to-black shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-white" />
              <h1 className="text-white font-bold text-xl">Immobiliser Location</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Select a brand</strong> to view available vehicle models with immobiliser location data.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading catalog...</p>
          </div>
        )}

        {/* Brand Grid */}
        {!isLoading && (
          <>
            {filteredBrands.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No brands found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => onSelectBrand(brand)}
                    className="group bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600 hover:scale-105"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                      {/* Brand Icon */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      
                      {/* Brand Name */}
                      <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight">
                        {brand}
                      </span>
                      
                      {/* Model Count */}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getModelCount(brand)} {getModelCount(brand) === 1 ? 'model' : 'models'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Stats Footer */}
            {filteredBrands.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}