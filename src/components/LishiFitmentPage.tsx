import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface LishiFitmentPageProps {
  onBack: () => void;
}

export function LishiFitmentPage({ onBack }: LishiFitmentPageProps) {
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
            <div>
              <h1 className="text-white text-xl sm:text-2xl font-bold">Lishi Fitment Catalog</h1>
              <p className="text-white/90 text-sm">American Key Supply - Lishi Reference Guide 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content - FlipHTML5 Embedded Viewer */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <iframe
            src="https://fliphtml5.com/aswuk/juqd/American_Key_Supply_-_Lishi_Reference_Guide_2024/"
            width="100%"
            height="100%"
            seamless
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            className="w-full h-full"
            title="Lishi Fitment Catalog - American Key Supply Reference Guide 2024"
          />
        </div>
      </div>
    </div>
  );
}
