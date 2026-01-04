import { ArrowLeft, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface TransponderFitmentPageProps {
  onBack: () => void;
  onSelectMake: (make: string) => void;
}

export function TransponderFitmentPage({ onBack, onSelectMake }: TransponderFitmentPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Car makes - alphabetically ordered
  const carMakes = [
    { id: 1, name: "Acura", active: true },
    { id: 2, name: "Alfa Romeo", active: true },
    { id: 3, name: "Audi", active: true },
    { id: 4, name: "BMW", active: true },
    { id: 5, name: "Buick", active: true },
    { id: 6, name: "Cadillac", active: true },
    { id: 7, name: "Chevrolet", active: true },
    { id: 8, name: "Chrysler", active: true },
    { id: 9, name: "Citroën", active: true },
    { id: 10, name: "Dacia", active: true },
    { id: 11, name: "DAF", active: true },
    { id: 12, name: "DAEWOO", active: true },
    { id: 13, name: "Daihatsu", active: true },
    { id: 14, name: "Dodge", active: true },
    { id: 15, name: "Fiat", active: true },
    { id: 16, name: "Ford", active: true },
    { id: 17, name: "GMC", active: true },
    { id: 18, name: "Honda", active: true },
    { id: 19, name: "Hummer", active: true },
    { id: 20, name: "Hyundai", active: true },
    { id: 21, name: "Isuzu", active: true },
    { id: 22, name: "Iveco", active: true },
    { id: 23, name: "Jaguar", active: true },
    { id: 24, name: "Jeep", active: true },
    { id: 25, name: "Kawasaki", active: true },
    { id: 26, name: "Kia", active: true },
    { id: 27, name: "Lancia", active: true },
    { id: 28, name: "Land Rover", active: true },
    { id: 29, name: "Lexus", active: true },
    { id: 30, name: "Lincoln", active: true },
    { id: 31, name: "Mazda", active: true },
    { id: 32, name: "Mercedes-Benz", active: true },
    { id: 33, name: "Mitsubishi", active: true },
    { id: 34, name: "Nissan", active: true },
    { id: 35, name: "Opel", active: true },
    { id: 36, name: "Peugeot", active: true },
    { id: 37, name: "Porsche", active: true },
    { id: 38, name: "Renault", active: true },
    { id: 39, name: "Rover", active: true },
    { id: 40, name: "SEAT", active: true },
    { id: 41, name: "Skoda", active: true },
    { id: 42, name: "Subaru", active: true },
    { id: 43, name: "Suzuki", active: true },
    { id: 44, name: "Toyota", active: true },
    { id: 45, name: "Volkswagen", active: true },
    { id: 46, name: "Volvo", active: true },
    { id: 47, name: "Yamaha", active: true },
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
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-white">Transponder to Car Fitment</h1>
              <p className="text-white/80 text-sm mt-1">Select a car make to view transponder compatibility</p>
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
              placeholder="Search car makes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Grid of car make buttons - 2 columns */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {carMakes.map((make) => (
            make.active ? (
              <button
                key={make.id}
                onClick={() => onSelectMake(make.name)}
                className="relative group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer"
              >
                {/* Active car make */}
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl">
                    {make.name.charAt(0)}
                  </div>
                  <span className="text-gray-900 dark:text-white">{make.name}</span>
                </div>
                
                {/* Active Badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    Active
                  </span>
                </div>
              </button>
            ) : (
              <button
                key={make.id}
                disabled
                className="relative group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60"
              >
                {/* Placeholder icon area */}
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                  <div className="w-24 h-3 sm:h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
                
                {/* Coming Soon Badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    Soon
                  </span>
                </div>
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}