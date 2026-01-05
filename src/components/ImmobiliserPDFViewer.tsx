import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface ImmobiliserPDFViewerProps {
  brand: string;
  model: string;
  startPage: number;
  endPage: number;
  onBack: () => void;
}

// PDF.js types
interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getViewport: (params: { scale: number; rotation?: number }) => PDFPageViewport;
  render: (params: { canvasContext: CanvasRenderingContext2D; viewport: PDFPageViewport }) => RenderTask;
}

interface RenderTask {
  promise: Promise<void>;
  cancel: () => void;
}

interface PDFPageViewport {
  width: number;
  height: number;
  transform?: number[];
}

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: {
        workerSrc: string;
      };
      getDocument: (params: {
        url: string;
        rangeChunkSize?: number;
        disableAutoFetch?: boolean;
        disableStream?: boolean;
      }) => { promise: Promise<PDFDocumentProxy> };
    };
    // Cache the PDF document globally
    cachedImmobiliserPDF?: PDFDocumentProxy;
    immobiliserPDFLoadPromise?: Promise<PDFDocumentProxy>;
  }
}

const PDF_URL = "https://ifijijocxohjhoznmbry.supabase.co/storage/v1/object/public/make-a7e285ba-documents/maker.pdf";

export function ImmobiliserPDFViewer({ brand, model, startPage, endPage, onBack }: ImmobiliserPDFViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const scale = 1.5; // Fixed scale
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasksRef = useRef<Map<number, RenderTask>>(new Map());
  const renderingPagesRef = useRef<Set<number>>(new Set()); // Synchronous lock
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        loadPDF();
      }
    };
    
    script.onerror = () => {
      setError('Failed to load PDF viewer. Please refresh the page.');
      setIsLoading(false);
    };
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"]');
    if (existingScript) {
      // Script already loaded
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        loadPDF();
      }
    } else {
      document.body.appendChild(script);
    }
    
    return () => {
      // Don't remove the script on unmount - keep it cached
    };
  }, []);

  // Load PDF document with global caching
  const loadPDF = async () => {
    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library not loaded');
      }

      // Check if PDF is already cached
      if (window.cachedImmobiliserPDF) {
        console.log('[ImmobiliserPDF] Using cached PDF document');
        setPdfDoc(window.cachedImmobiliserPDF);
        setIsLoading(false);
        return;
      }

      // Check if a load is already in progress
      if (window.immobiliserPDFLoadPromise) {
        console.log('[ImmobiliserPDF] PDF load already in progress, waiting...');
        const pdf = await window.immobiliserPDFLoadPromise;
        setPdfDoc(pdf);
        setIsLoading(false);
        return;
      }

      console.log('[ImmobiliserPDF] Starting PDF load...');
      const startTime = Date.now();

      const loadingTask = window.pdfjsLib.getDocument({
        url: PDF_URL,
        rangeChunkSize: 524288, // 512KB chunks (increased from 64KB for better performance)
        disableAutoFetch: true, // Don't download entire PDF
        disableStream: false    // Use streaming
      });

      // Store the promise so other instances can wait for it
      window.immobiliserPDFLoadPromise = loadingTask.promise;

      const pdf = await loadingTask.promise;
      
      // Cache the PDF document globally
      window.cachedImmobiliserPDF = pdf;
      window.immobiliserPDFLoadPromise = undefined;
      
      setPdfDoc(pdf);
      setIsLoading(false);
      
      const loadTime = Date.now() - startTime;
      console.log(`[ImmobiliserPDF] PDF loaded in ${loadTime}ms. Total pages: ${pdf.numPages}. Showing pages ${startPage}-${endPage}`);
    } catch (err) {
      console.error('[ImmobiliserPDF] Error loading PDF:', err);
      setError('Failed to load PDF document. Please try again.');
      setIsLoading(false);
    }
  };

  // Render a specific page
  const renderPage = useCallback(async (pageNumber: number) => {
    if (!pdfDoc || !window.pdfjsLib) return;

    const canvas = canvasRefs.current.get(pageNumber);
    if (!canvas) return;

    // Synchronous check - prevent race conditions
    if (renderingPagesRef.current.has(pageNumber)) {
      console.log(`[ImmobiliserPDF] Page ${pageNumber} already rendering, skipping`);
      return;
    }

    // Mark as rendering immediately (synchronous)
    renderingPagesRef.current.add(pageNumber);

    // Cancel any existing render task for this page
    const existingTask = renderTasksRef.current.get(pageNumber);
    if (existingTask) {
      try {
        existingTask.cancel();
      } catch (e) {
        // Ignore cancellation errors
      }
      renderTasksRef.current.delete(pageNumber);
    }

    setLoadingPages(prev => new Set(prev).add(pageNumber));

    try {
      const page = await pdfDoc.getPage(pageNumber);
      
      // Use default orientation (no rotation)
      const viewport = page.getViewport({ scale });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        renderingPagesRef.current.delete(pageNumber);
        setLoadingPages(prev => {
          const newSet = new Set(prev);
          newSet.delete(pageNumber);
          return newSet;
        });
        return;
      }

      // Clear the canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport
      });

      renderTasksRef.current.set(pageNumber, renderTask);

      await renderTask.promise;

      renderTasksRef.current.delete(pageNumber);
      renderingPagesRef.current.delete(pageNumber);
      setRenderedPages(prev => new Set(prev).add(pageNumber));
      setLoadingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageNumber);
        return newSet;
      });
    } catch (err: any) {
      // Ignore cancellation errors
      if (err?.name !== 'RenderingCancelledException') {
        console.error(`[ImmobiliserPDF] Error rendering page ${pageNumber}:`, err);
      }
      renderTasksRef.current.delete(pageNumber);
      renderingPagesRef.current.delete(pageNumber);
      setLoadingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageNumber);
        return newSet;
      });
    }
  }, [pdfDoc, scale]);

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!pdfDoc) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = parseInt(entry.target.getAttribute('data-page') || '0');
            if (pageNumber > 0) {
              renderPage(pageNumber);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '500px', // Start loading 500px before page enters viewport
        threshold: 0
      }
    );

    // Observe all canvas elements
    canvasRefs.current.forEach((canvas) => {
      if (canvas && observerRef.current) {
        observerRef.current.observe(canvas);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pdfDoc, renderPage]);

  // Generate array of page numbers
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 truncate">
                {brand} {model}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pages {startPage}-{endPage} ({pageNumbers.length} {pageNumbers.length === 1 ? 'page' : 'pages'})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div ref={containerRef} className="max-w-5xl mx-auto px-4 py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PDF...</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Fetching pages {startPage}-{endPage}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Refresh Page
            </Button>
          </div>
        )}

        {/* PDF Pages */}
        {!isLoading && !error && pdfDoc && (
          <div className="space-y-4">
            {pageNumbers.map((pageNum) => (
              <div
                key={pageNum}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                {/* Page Header */}
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pageNum}
                  </p>
                </div>

                {/* Canvas Container */}
                <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="relative">
                    <canvas
                      ref={(el) => {
                        if (el) canvasRefs.current.set(pageNum, el);
                      }}
                      data-page={pageNum}
                      className="max-w-full h-auto shadow-md"
                    />
                    {loadingPages.has(pageNum) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}