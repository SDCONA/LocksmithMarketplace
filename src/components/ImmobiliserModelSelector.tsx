import { useState, useEffect } from "react";
import { ArrowLeft, Search, FileText, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { immobiliserCatalog, type ModelData } from "../data/immobiliser-catalog";

interface ImmobiliserModelSelectorProps {
  brand: string;
  onBack: () => void;
  onSelectModel: (model: string, startPage: number, endPage: number) => void;
}

export function ImmobiliserModelSelector({ brand, onBack, onSelectModel }: ImmobiliserModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [models, setModels] = useState<{ name: string; data: ModelData }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load models for this brand from imported data
    try {
      if (immobiliserCatalog[brand]) {
        const modelList = Object.entries(immobiliserCatalog[brand])
          .map(([name, data]) => ({ name, data }))
          .sort((a, b) => a.name.localeCompare(b.name));
        console.log('[ImmobiliserModel] Loaded', modelList.length, 'models for', brand);
        setModels(modelList);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('[ImmobiliserModel] Failed to load models:', error);
      setIsLoading(false);
    }
  }, [brand]);

  // Filter models based on search query
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate page count
  const getPageCount = (model: { name: string; data: ModelData }): number => {
    return model.data.endPage - model.data.startPage + 1;
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
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-white" />
                <h1 className="text-white font-bold text-xl">{brand}</h1>
              </div>
              <p className="text-white/80 text-sm">Select a model</p>
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
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading models...</p>
          </div>
        )}

        {/* Models List */}
        {!isLoading && (
          <>
            {filteredModels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? `No models found matching "${searchQuery}"` : 'No models available'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModels.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => onSelectModel(model.name, model.data.startPage, model.data.endPage)}
                    className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600 hover:scale-[1.02] text-left"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">
                          {model.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {getPageCount(model)} {getPageCount(model) === 1 ? 'page' : 'pages'}
                          </span>
                          <span>•</span>
                          <span>
                            Pages {model.data.startPage}-{model.data.endPage}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Stats Footer */}
            {filteredModels.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredModels.length} {filteredModels.length === 1 ? 'model' : 'models'}
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