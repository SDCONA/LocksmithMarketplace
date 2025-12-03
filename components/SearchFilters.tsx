import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SlidersHorizontal, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SearchFiltersProps {
  selectedRetailers: string[];
  setSelectedRetailers: (retailers: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (inStock: boolean) => void;
}

const availableRetailers = [
  { name: "KEY4", hasLiveParsing: true },
  { name: "UHS", hasLiveParsing: false },
  { name: "YCKG", hasLiveParsing: false },
  { name: "Transponder Island", hasLiveParsing: false },
  { name: "Car & Truck Remotes", hasLiveParsing: false },
  { name: "Best Key Supply", hasLiveParsing: false },
  { name: "Key Direct", hasLiveParsing: false },
  { name: "Noble Key Supply", hasLiveParsing: false },
  { name: "Key Innovations", hasLiveParsing: false }
];



const sortOptions = [
  { label: "Best Match", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Customer Rating", value: "rating" },
  { label: "Recently Updated", value: "updated" }
];

export function SearchFilters({
  selectedRetailers,
  setSelectedRetailers,
  sortBy,
  setSortBy,
  inStockOnly,
  setInStockOnly
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleRetailer = (retailerName: string) => {
    if (selectedRetailers.includes(retailerName)) {
      setSelectedRetailers(selectedRetailers.filter(r => r !== retailerName));
    } else {
      setSelectedRetailers([...selectedRetailers, retailerName]);
    }
  };

  const clearAllFilters = () => {
    setSelectedRetailers([]);
    setSortBy("relevance");
    setInStockOnly(false);
  };

  const retailerDisplayText = selectedRetailers.length === 0 
    ? "All Retailers" 
    : selectedRetailers.length === 1 
    ? selectedRetailers[0]
    : `${selectedRetailers.length} Retailers Selected`;

  const stockDisplayText = inStockOnly ? "In Stock Only" : "All Products";

  const hasActiveFilters = selectedRetailers.length > 0 || inStockOnly || sortBy !== "relevance";

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full p-4 justify-between"
        >
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {(selectedRetailers.length > 0 ? 1 : 0) + (inStockOnly ? 1 : 0) + (sortBy !== "relevance" ? 1 : 0)}
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block p-4 ${isOpen ? 'border-t md:border-t-0' : ''}`}>
        <div className="hidden md:flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Filters</h3>
          </div>
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6 mr-1" />
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Sort Dropdown */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Retailers Dropdown */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Retailers</label>
            <Select 
              value={selectedRetailers.length === 0 ? "all" : "selected"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedRetailers([]);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <span className="flex items-center">
                    {retailerDisplayText}
                    {selectedRetailers.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {selectedRetailers.length}
                      </Badge>
                    )}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <span>All Retailers</span>
                    {selectedRetailers.length === 0 && <Check className="h-4 w-4 ml-2" />}
                  </div>
                </SelectItem>
                <div className="px-2 py-1 border-t">
                  <div className="text-xs text-gray-500 mb-2">Select retailers:</div>
                  {availableRetailers.map((retailer) => (
                    <div
                      key={retailer.name}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleRetailer(retailer.name);
                      }}
                    >
                      <div className={`w-4 h-4 border rounded ${
                        selectedRetailers.includes(retailer.name) 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300'
                      } flex items-center justify-center`}>
                        {selectedRetailers.includes(retailer.name) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex items-center justify-between flex-1">
                        <span className="text-sm">{retailer.name}</span>
                        {retailer.hasLiveParsing && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                            Live
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        if (selectedRetailers.length === availableRetailers.length) {
                          setSelectedRetailers([]);
                        } else {
                          setSelectedRetailers(availableRetailers.map(r => r.name));
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      {selectedRetailers.length === availableRetailers.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Stock Availability Dropdown */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Availability</label>
            <Select 
              value={inStockOnly ? "in-stock" : "all"}
              onValueChange={(value) => setInStockOnly(value === "in-stock")}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <span className="flex items-center">
                    {stockDisplayText}
                    {inStockOnly && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Active
                      </Badge>
                    )}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <span>All Products</span>
                    {!inStockOnly && <Check className="h-4 w-4 ml-2" />}
                  </div>
                </SelectItem>
                <SelectItem value="in-stock">
                  <div className="flex items-center justify-between w-full">
                    <span>In Stock Only</span>
                    {inStockOnly && <Check className="h-4 w-4 ml-2" />}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Clear All Button */}
        <div className="md:hidden mt-4">
          <Button
            onClick={() => {
              clearAllFilters();
              setIsOpen(false);
            }}
            variant="outline"
            size="sm"
            className="w-full text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6 mr-1" />
            Clear All Filters
          </Button>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {sortBy !== "relevance" && (
                  <Badge variant="outline" className="text-xs">
                    Sort: {sortOptions.find(s => s.value === sortBy)?.label}
                  </Badge>
                )}
                {inStockOnly && (
                  <Badge variant="outline" className="text-xs">
                    In Stock Only
                  </Badge>
                )}
                {selectedRetailers.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {selectedRetailers.length} Retailer{selectedRetailers.length === 1 ? '' : 's'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}