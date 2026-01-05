import { ArrowLeft, Cpu, Package, FileText, MapPin } from "lucide-react";
import { Button } from "./ui/button";

interface HubPageProps {
  onBack: () => void;
  onNavigateToTransponderFitment: () => void;
  onNavigateToVAGPartNumbers: () => void;
  onNavigateToImmobiliserLocation: () => void;
  isAuthenticated: boolean;
}

export function HubPage({ onBack, onNavigateToTransponderFitment, onNavigateToVAGPartNumbers, onNavigateToImmobiliserLocation, isAuthenticated }: HubPageProps) {
  // Array of 30 buttons - first three are active
  const buttons = [
    {
      id: 1,
      name: "Transponder to Car Fitment",
      icon: Cpu,
      active: true,
      onClick: onNavigateToTransponderFitment
    },
    {
      id: 2,
      name: "SEAT Skoda Audi Volkswagen Part Numbers",
      icon: Package,
      active: true,
      onClick: onNavigateToVAGPartNumbers
    },
    {
      id: 3,
      name: "Immobiliser Location",
      icon: MapPin,
      active: true,
      onClick: onNavigateToImmobiliserLocation
    },
    ...Array.from({ length: 27 }, (_, i) => ({
      id: i + 4,
      name: "",
      icon: null,
      active: false,
      onClick: () => {}
    }))
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
            <h1 className="text-white">Hub</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Grid of buttons - 2 columns */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {buttons.map((button) => (
            <button
              key={button.id}
              disabled={!button.active}
              onClick={button.active ? button.onClick : undefined}
              className={`relative group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md transition-all duration-300 border-2 ${
                button.active
                  ? 'border-blue-500 dark:border-blue-600 hover:shadow-xl hover:scale-105 cursor-pointer'
                  : 'border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
              }`}
            >
              {/* Active button content */}
              {button.active && button.icon && (
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <button.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight">
                    {button.name}
                  </span>
                </div>
              )}

              {/* Placeholder content for inactive buttons */}
              {!button.active && (
                <>
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
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}