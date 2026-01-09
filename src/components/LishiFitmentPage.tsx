import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

interface LishiFitmentPageProps {
  onBack: () => void;
}

export function LishiFitmentPage({ onBack }: LishiFitmentPageProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        {/* Mobile Warning */}
        {isMobile && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Mobile Tip:</strong> For the best viewing experience, you can open this catalog in a new tab or rotate your device to landscape mode.
            </p>
            <a
              href="https://fliphtml5.com/aswuk/juqd/American_Key_Supply_-_Lishi_Reference_Guide_2024/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 dark:text-blue-400 text-sm underline"
            >
              Open in New Tab →
            </a>
          </div>
        )}

        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden relative"
          style={{ 
            height: isMobile ? 'calc(100svh - 250px)' : 'calc(100vh - 180px)',
            minHeight: isMobile ? '500px' : '600px'
          }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading catalog...</p>
              </div>
            </div>
          )}

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
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            style={{ border: 'none' }}
          />
        </div>

        {/* Mobile Instructions */}
        {isMobile && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Use on Mobile:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Tap and drag to flip pages</li>
              <li>• Pinch to zoom in/out</li>
              <li>• Tap the fullscreen icon for better viewing</li>
              <li>• Use landscape mode for easier reading</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}