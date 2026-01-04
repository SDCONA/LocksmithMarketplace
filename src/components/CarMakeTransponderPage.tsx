import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface CarMakeTransponderPageProps {
  onBack: () => void;
  make: string;
}

export function CarMakeTransponderPage({ onBack, make }: CarMakeTransponderPageProps) {
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
              <h1 className="text-white capitalize">{make} Transponder Fitment</h1>
              <p className="text-white/80 text-sm mt-1">Model and transponder type compatibility</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Transponder data for {make} coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
