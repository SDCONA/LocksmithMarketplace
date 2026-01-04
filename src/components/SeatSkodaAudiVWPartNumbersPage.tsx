import { ChevronLeft, Package, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface SeatSkodaAudiVWPartNumbersPageProps {
  onBack: () => void;
  onSelectBrand: (brand: string) => void;
}

export function SeatSkodaAudiVWPartNumbersPage({ onBack, onSelectBrand }: SeatSkodaAudiVWPartNumbersPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // VAG Brands
  const vagBrands = [
    { id: 1, name: "Audi", active: true },
    { id: 2, name: "SEAT", active: true },
    { id: 3, name: "Skoda", active: true },
    { id: 4, name: "Volkswagen", active: true },
  ];

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
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-white">SEAT / Skoda / Audi / Volkswagen Part Numbers</h1>
              <p className="text-white/80 text-sm mt-1">Select a brand to view part number cross-references</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Grid of brand buttons - 2 columns */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {vagBrands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onSelectBrand(brand.name)}
              className="relative group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer"
            >
              {/* Active brand */}
              <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl">
                  {brand.name.charAt(0)}
                </div>
                <span className="text-gray-900 dark:text-white">{brand.name}</span>
              </div>
              
              {/* Active Badge */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Active
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> The Volkswagen Auto Group (VAG) shares many components across
            SEAT, Skoda, Audi, and Volkswagen brands. This tool helps locksmiths identify
            equivalent part numbers, reducing inventory costs and improving service efficiency.
            Part numbers often differ only in prefix codes while referring to identical components.
          </p>
        </div>
      </div>
    </div>
  );
}