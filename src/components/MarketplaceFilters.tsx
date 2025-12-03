import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Filter, X, ChevronDown, ChevronUp, MapPin } from "lucide-react";

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
}

const categories = [
  "Car Keys & Remotes",
  "Key Programming Tools", 
  "Locksmith Supplies",
  "Transponder Chips",
  "Key Blanks",
  "Security Systems",
  "Other Automotive"
];

const conditions = [
  { value: "new", label: "New" },
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
  setRadius
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg border">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <h3 className="font-medium">Filters</h3>
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
  );
}