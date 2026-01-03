import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Filter, X, ChevronDown, ChevronUp, MapPin, Search, RefreshCw, Plus } from "lucide-react";

interface MarketplaceFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCondition: string;
  setSelectedCondition: (condition: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  zipCode: string;
  setZipCode: (zipCode: string) => void;
  radius: number;
  setRadius: (radius: number) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  handleSearch?: () => void;
  isSearching?: boolean;
  currentSection?: string;
  onAddListing?: () => void;
}

const categories = [
  "Car Keys & Remotes",
  "Key Programming Tools", 
  "Locksmith Supplies",
  "Transponder Chips",
  "Security Systems",
  "Cutting Maschines",
  "Business for sale",
  "Other Automotive"
];

const conditions = [
  { value: "new", label: "New" },
  { value: "used-like-new", label: "Used - Like New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" }
];

const sortOptions = [
  { value: "random", label: "Random" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "distance", label: "Distance" },
  { value: "popular", label: "Most Popular" }
];

export function MarketplaceFilters({
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  sortBy,
  setSortBy,
  zipCode,
  setZipCode,
  radius,
  setRadius,
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  currentSection,
  onAddListing
}: MarketplaceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleConditionChange = (condition: string) => {
    setSelectedCondition(condition);
  };

  const handleZipCodeChange = (value: string) => {
    // Only allow numeric input and limit to 5 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 5);
    setZipCode(numericValue);
  };

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCondition("all");
    setSortBy("random");
    setZipCode("");
    setRadius(25); // Default to 25 miles
  };

  const getRadiusDisplayText = (radius: number) => {
    if (radius === 500) return "Nationwide";
    return `${radius} mile${radius !== 1 ? 's' : ''}`;
  };

  const hasActiveFilters = (selectedCategory !== "" && selectedCategory !== "all") || 
    (selectedCondition !== "" && selectedCondition !== "all") ||
    (zipCode !== "" && zipCode.length === 5) ||
    (zipCode !== "" && zipCode.length === 5 && radius !== 25); // Only count radius if zip code is valid

  return (
    <div>
      {/* Sticky Search Bar */}
      {searchQuery !== undefined && setSearchQuery && handleSearch && (
        <div className="sticky top-[72px] z-40 bg-white dark:bg-gray-900 pb-4">
          {/* Desktop: Search, Filter, and Add Listing on one line */}
          <div className="hidden md:flex items-start gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={currentSection === 'marketplace' ? "Search marketplace..." : "Search keys..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8 pr-10 py-2 w-full rounded-xl bg-white/95 dark:bg-gray-800 backdrop-blur-md text-gray-900 dark:text-white border border-white/30 dark:border-gray-600 text-sm sm:text-base font-bold text-left shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all duration-300"
              />
              <Button 
                onClick={() => {
                  console.log('Search Console - Search Triggered from Filters:', {
                    query: searchQuery,
                    section: currentSection,
                    timestamp: new Date().toISOString()
                  });
                  handleSearch();
                }}
                disabled={isSearching}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-6 px-1.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300"
                size="sm"
              >
                {isSearching ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Search className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Filter Dropdown */}
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg whitespace-nowrap"
                  >
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <h3 className="font-medium dark:text-white">Filters</h3>
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-2">
                          {(selectedCategory && selectedCategory !== "all" ? 1 : 0) + 
                           (selectedCondition && selectedCondition !== "all" ? 1 : 0) + 
                           (zipCode !== "" && zipCode.length === 5 ? 1 : 0)}
                        </Badge>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4 min-w-[300px]">
                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          <X className="h-8 w-8 mr-1" />
                          Clear All
                        </Button>
                      </div>
                    )}

                    {/* Sort By */}
                    <div>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by..." />
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

                    {/* Category */}
                    <div>
                      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Condition */}
                    <div>
                      <Select value={selectedCondition} onValueChange={handleConditionChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Conditions</SelectItem>
                          {conditions.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              {condition.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location - Zip Code */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>Zip Code</span>
                      </label>
                      <Input
                        placeholder="Enter zip code for radius search"
                        value={zipCode}
                        onChange={(e) => handleZipCodeChange(e.target.value)}
                        className="w-full"
                        maxLength={5}
                      />
                      <p className="text-xs text-gray-500">Optional: Enter zip code to enable radius filtering</p>
                    </div>

                    {/* Radius Slider */}
                    <div className={`space-y-3 ${zipCode === "" || zipCode.length !== 5 ? "opacity-50" : ""}`}>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                          <span>Search Radius</span>
                          {(zipCode === "" || zipCode.length !== 5) && (
                            <span className="text-red-500 text-xs">(requires zip code)</span>
                          )}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {getRadiusDisplayText(radius)}
                        </Badge>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={[radius]}
                          onValueChange={handleRadiusChange}
                          max={500}
                          min={1}
                          step={1}
                          className="w-full"
                          disabled={zipCode === "" || zipCode.length !== 5}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 mile</span>
                          <span>500 miles</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {zipCode === "" || zipCode.length !== 5
                          ? "Enter a valid 5-digit zip code to enable radius filtering" 
                          : radius === 500 
                            ? "Search nationwide" 
                            : `Search within ${radius} miles of ${zipCode}`
                          }
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Add Listing Button */}
            {onAddListing && (
              <Button
                onClick={onAddListing}
                className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 h-auto rounded-lg shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Listing
              </Button>
            )}
          </div>

          {/* Mobile: Search bar separate */}
          <div className="md:hidden relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={currentSection === 'marketplace' ? "Search marketplace..." : "Search keys..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8 pr-10 py-2 w-full rounded-xl bg-white/95 dark:bg-gray-800 backdrop-blur-md text-gray-900 dark:text-white border border-white/30 dark:border-gray-600 text-sm sm:text-base font-bold text-left shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all duration-300"
            />
            <Button 
              onClick={() => {
                console.log('Search Console - Search Triggered from Filters:', {
                  query: searchQuery,
                  section: currentSection,
                  timestamp: new Date().toISOString()
                });
                handleSearch();
              }}
              disabled={isSearching}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-6 px-1.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300"
              size="sm"
            >
              {isSearching ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Search className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Add Listing buttons (Mobile only) */}
      <div className="flex md:hidden items-start gap-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            {/* Header */}
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <h3 className="font-medium dark:text-white">Filters</h3>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {(selectedCategory && selectedCategory !== "all" ? 1 : 0) + 
                       (selectedCondition && selectedCondition !== "all" ? 1 : 0) + 
                       (zipCode !== "" && zipCode.length === 5 ? 1 : 0)}
                    </Badge>
                  )}
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="p-4 pt-0 space-y-4">
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-8 w-8 mr-1" />
                      Clear All
                    </Button>
                  </div>
                )}

                {/* Sort By */}
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
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

                {/* Category */}
                <div>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div>
                  <Select value={selectedCondition} onValueChange={handleConditionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location - Zip Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Zip Code</span>
                  </label>
                  <Input
                    placeholder="Enter zip code for radius search"
                    value={zipCode}
                    onChange={(e) => handleZipCodeChange(e.target.value)}
                    className="w-full"
                    maxLength={5}
                  />
                  <p className="text-xs text-gray-500">Optional: Enter zip code to enable radius filtering</p>
                </div>

                {/* Radius Slider */}
                <div className={`space-y-3 ${zipCode === "" || zipCode.length !== 5 ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <span>Search Radius</span>
                      {(zipCode === "" || zipCode.length !== 5) && (
                        <span className="text-red-500 text-xs">(requires zip code)</span>
                      )}
                    </label>
                    <Badge variant="outline" className="text-xs">
                      {getRadiusDisplayText(radius)}
                    </Badge>
                  </div>
                  <div className="px-2">
                    <Slider
                      value={[radius]}
                      onValueChange={handleRadiusChange}
                      max={500}
                      min={1}
                      step={1}
                      className="w-full"
                      disabled={zipCode === "" || zipCode.length !== 5}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 mile</span>
                      <span>500 miles</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {zipCode === "" || zipCode.length !== 5
                      ? "Enter a valid 5-digit zip code to enable radius filtering" 
                      : radius === 500 
                        ? "Search nationwide" 
                        : `Search within ${radius} miles of ${zipCode}`
                      }
                  </div>
                </div>


              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Add Listing Button */}
        {onAddListing && (
          <Button
            onClick={onAddListing}
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 h-auto rounded-lg shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        )}
      </div>
    </div>
  );
}