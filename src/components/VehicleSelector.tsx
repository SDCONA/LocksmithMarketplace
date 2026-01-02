import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Car, Search } from "lucide-react";
import { loadVehicleData, getDefaultVehicleData, getYearsArray, getMakesForYear, getModelsForMakeAndYear, VehicleData } from "../utils/vehicle-data";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface VehicleSelectorProps {
  onVehicleSelect?: (year: string, make: string, model: string) => void;
}

export function VehicleSelector({ onVehicleSelect }: VehicleSelectorProps) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load vehicle data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch from backend database first
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/vehicle-database`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const result = await response.json();
            if (result.success && result.vehicleData) {
              setVehicleData(result.vehicleData);
              return;
            }
          }
        } else {
          console.warn(`⚠️ Vehicle database returned ${response.status}: Using default data`);
        }
        
        // If we get here, either request failed or no custom database, use default
        const data = await loadVehicleData();
        setVehicleData(data);
      } catch (error) {
        // Final fallback to embedded default
        console.error("Error loading vehicle database:", error);
        setVehicleData(getDefaultVehicleData());
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Listen for database updates (when admin uploads new database)
  useEffect(() => {
    const handleDatabaseUpdate = async () => {
      try {
        // Fetch fresh data from backend
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/vehicle-database`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const result = await response.json();
            if (result.success && result.vehicleData) {
              setVehicleData(result.vehicleData);
            }
          }
        }
      } catch (error) {
        console.error("Error refreshing vehicle database:", error);
      }
    };

    // Listen for custom event from AdminPage when database is uploaded
    window.addEventListener("vehicleDatabaseUpdated", handleDatabaseUpdate);
    return () => window.removeEventListener("vehicleDatabaseUpdated", handleDatabaseUpdate);
  }, []);

  // Get available data based on selections
  const years = vehicleData ? getYearsArray(vehicleData) : [];
  const availableMakes = selectedYear && vehicleData 
    ? getMakesForYear(vehicleData, parseInt(selectedYear))
    : [];
  const availableModels = selectedYear && selectedMake && vehicleData
    ? getModelsForMakeAndYear(vehicleData, parseInt(selectedYear), selectedMake)
    : [];

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMake("");
    setSelectedModel("");
  };

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    setSelectedModel("");
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const handleFindVehicle = () => {
    if (selectedYear && selectedMake && selectedModel) {
      onVehicleSelect?.(selectedYear, selectedMake, selectedModel);
    }
  };

  const handleClearSelection = () => {
    setSelectedYear("");
    setSelectedMake("");
    setSelectedModel("");
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      
      const selectContent = document.querySelector('[data-radix-popper-content-wrapper]');
      if (selectContent && selectContent.contains(target)) {
        return;
      }
      
      const clickedElement = target as Element;
      if (clickedElement.closest && (
        clickedElement.closest('[data-radix-select-content]') ||
        clickedElement.closest('[data-radix-select-item]') ||
        clickedElement.closest('[data-radix-popper-content-wrapper]')
      )) {
        return;
      }
      
      setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (isLoading) {
    return (
      <div className="md:bg-none md:py-0 bg-gradient-to-r from-blue-600/90 via-blue-500/85 to-indigo-600/90 backdrop-blur-xl py-3 sm:py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-b border-white/20 relative">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <span className="text-white text-sm">Loading vehicle database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="md:bg-none md:py-0 bg-gradient-to-r from-blue-600/90 via-blue-500/85 to-indigo-600/90 backdrop-blur-xl py-3 sm:py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-b border-white/20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none md:hidden"></div>
      <div className="md:container-none md:mx-0 md:px-0 container mx-auto px-3 sm:px-4 relative">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-20 sm:w-24 bg-white/95 backdrop-blur-md text-gray-600 border border-white/30 h-8 sm:h-10 rounded-xl text-sm sm:text-base font-bold shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all duration-300">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMake} onValueChange={handleMakeChange} disabled={!selectedYear}>
              <SelectTrigger className="w-24 sm:w-28 bg-white/95 backdrop-blur-md text-gray-600 border border-white/30 h-8 sm:h-10 rounded-xl text-sm sm:text-base font-bold shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all duration-300">
                <SelectValue placeholder="Make" />
              </SelectTrigger>
              <SelectContent>
                {availableMakes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedModel} onValueChange={handleModelChange} disabled={!selectedMake}>
              <SelectTrigger className="w-24 sm:w-28 bg-white/95 backdrop-blur-md text-gray-600 border border-white/30 h-8 sm:h-10 rounded-xl text-sm sm:text-base font-bold shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all duration-300">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => {
                handleFindVehicle();
                setTimeout(() => {
                  handleClearSelection();
                }, 100);
              }}
              disabled={!selectedYear || !selectedMake || !selectedModel}
              className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-8 sm:h-10 px-1.5 sm:px-2 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all duration-300 border border-white/20"
            >
              <Search className="h-3 sm:h-4 w-3 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-3 bg-transparent">
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white/95 backdrop-blur-md text-gray-600 border border-white/30 h-12 rounded-2xl hover:bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] px-4 flex items-center gap-2 min-w-[180px] justify-between transition-all duration-300"
              variant="outline"
            >
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <span className="text-sm">
                  {selectedYear && selectedMake && selectedModel 
                    ? `${selectedYear} ${selectedMake} ${selectedModel}`
                    : "Select Vehicle"
                  }
                </span>
              </div>
              <svg
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </Button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 p-4 min-w-[320px] z-50">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-2xl"></div>
                <div className="space-y-4 relative">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <Select value={selectedYear} onValueChange={handleYearChange}>
                      <SelectTrigger className="w-full bg-white/95 backdrop-blur-md text-gray-600 border border-gray-300/50 h-10 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                    <Select value={selectedMake} onValueChange={handleMakeChange} disabled={!selectedYear}>
                      <SelectTrigger className="w-full bg-white/95 backdrop-blur-md text-gray-600 border border-gray-300/50 h-10 rounded-xl disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300">
                        <SelectValue placeholder="Select Make" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMakes.map((make) => (
                          <SelectItem key={make} value={make}>
                            {make}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                    <Select value={selectedModel} onValueChange={handleModelChange} disabled={!selectedMake}>
                      <SelectTrigger className="w-full bg-white/95 backdrop-blur-md text-gray-600 border border-gray-300/50 h-10 rounded-xl disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300">
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => {
                        handleFindVehicle();
                        setIsDropdownOpen(false);
                        setTimeout(() => {
                          handleClearSelection();
                        }, 100);
                      }}
                      disabled={!selectedYear || !selectedMake || !selectedModel}
                      className="flex-1 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-10 rounded-xl disabled:opacity-50 shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all duration-300"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Find Keys
                    </Button>
                    <Button 
                      onClick={() => {
                        handleClearSelection();
                        setIsDropdownOpen(false);
                      }}
                      variant="outline"
                      className="px-4 h-10 rounded-xl border-gray-300/50 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}