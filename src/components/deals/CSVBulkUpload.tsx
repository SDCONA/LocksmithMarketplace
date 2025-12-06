import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "sonner";
import { 
  Upload, FileText, AlertCircle, CheckCircle2, X, Download,
  TrendingUp, DollarSign, Tag, ExternalLink, Calendar
} from "lucide-react";
import { DealsService } from "../../utils/services";

interface CSVBulkUploadProps {
  profile: any;
  dealTypes: any[];
  onSuccess: () => void;
}

interface ParsedDeal {
  title: string;
  description?: string;
  price: string;
  original_price?: string;
  external_url: string;
  deal_type_id?: string;
  expires_at?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function CSVBulkUpload({ profile, dealTypes, onSuccess }: CSVBulkUploadProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedDeals, setParsedDeals] = useState<ParsedDeal[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Parse CSV line handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setCsvFile(file);
    parseCSV(file);
  };

  const parseCSV = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error("CSV file must have a header row and at least one data row");
          setIsProcessing(false);
          return;
        }

        // Parse header using parseCSVLine to handle quotes properly
        const headerValues = parseCSVLine(lines[0]);
        const header = headerValues.map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
        
        console.log('CSV Header detected:', header);
        
        // Validate required columns - accept both "price" and "sale_price"
        const hasTitle = header.includes('title');
        const hasPrice = header.includes('price') || header.includes('sale_price');
        const hasUrl = header.includes('external_url');
        
        const missingColumns = [];
        if (!hasTitle) missingColumns.push('title');
        if (!hasPrice) missingColumns.push('price or sale_price');
        if (!hasUrl) missingColumns.push('external_url');
        
        if (missingColumns.length > 0) {
          console.error('Missing columns:', missingColumns);
          console.error('Available columns:', header);
          toast.error(`Missing required columns: ${missingColumns.join(', ')}. Found columns: ${header.join(', ')}`);
          setIsProcessing(false);
          return;
        }

        // Parse data rows
        const deals: ParsedDeal[] = [];
        const errors: ValidationError[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          const values = parseCSVLine(line);
          const deal: any = {};

          header.forEach((col, index) => {
            const value = values[index]?.trim().replace(/^"|"$/g, '');
            if (value) {
              deal[col] = value;
            }
          });

          // Map sale_price to price if needed
          if (deal.sale_price && !deal.price) {
            deal.price = deal.sale_price;
          }

          // Validate required fields
          if (!deal.title) {
            errors.push({ row: i, field: 'title', message: 'Title is required' });
          }
          if (!deal.price || isNaN(parseFloat(deal.price))) {
            errors.push({ row: i, field: 'price', message: 'Valid price is required' });
          }
          if (!deal.external_url || !deal.external_url.startsWith('http')) {
            errors.push({ row: i, field: 'external_url', message: 'Valid URL is required (must start with http)' });
          }

          // Add to parsed deals if no errors for this row
          const rowErrors = errors.filter(e => e.row === i);
          if (rowErrors.length === 0) {
            deals.push(deal);
          }
        }

        setParsedDeals(deals);
        setValidationErrors(errors);
        setShowPreview(true);
        
        if (errors.length > 0) {
          toast.warning(`Parsed ${deals.length} valid deals, ${errors.length} rows had errors`);
        } else {
          toast.success(`Successfully parsed ${deals.length} deals`);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error("Failed to parse CSV file");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (parsedDeals.length === 0) {
      toast.error("No valid deals to upload");
      return;
    }

    setIsUploading(true);
    try {
      const result = await DealsService.bulkUploadDeals(parsedDeals);
      
      toast.success(result.message || `Successfully uploaded ${result.count} deals!`, {
        duration: 5000,
      });
      
      // Reset state
      setCsvFile(null);
      setParsedDeals([]);
      setValidationErrors([]);
      setShowPreview(false);
      setShowUploadModal(false);
      
      // Refresh parent
      onSuccess();
    } catch (error: any) {
      console.error('Error uploading deals:', error);
      toast.error(error.message || "Failed to upload deals");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `title,description,price,original_price,external_url,deal_type_id
"Example Deal - 50% Off Smart Key","High quality smart key with remote start",49.99,99.99,https://example.com/product1,
"Transponder Key Blank","Compatible with 2015-2023 Honda Accord",24.95,34.95,https://example.com/product2,
"Key Fob Programming Tool","Professional grade programming device",199.00,299.00,https://example.com/product3,`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deals_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Template downloaded!");
  };

  // Profile owners always have CSV upload access (admin check removed per requirements)

  return (
    <>
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            CSV Bulk Upload
          </CardTitle>
          <CardDescription>
            Upload multiple deals at once using a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">Quick bulk upload enabled</p>
                <p className="text-xs text-gray-500 mt-1">
                  {profile.daily_deal_limit > 0 
                    ? `Daily limit: ${profile.daily_deal_limit} deals` 
                    : "Unlimited daily deals"}
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
              <Button 
                onClick={downloadTemplate}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Requirements:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>Required columns:</strong> title, price, external_url</li>
                <li>• <strong>Optional columns:</strong> description, original_price, deal_type_id, expires_at, image_url</li>
                <li>• All deals default to 2-day expiration if expires_at not specified</li>
                <li>• URLs must start with http:// or https://</li>
                <li>• Prices should be numeric values (e.g., 49.99)</li>
                <li>• Image URLs should link to publicly accessible images</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Upload Deals</DialogTitle>
            <DialogDescription>
              Upload a CSV file to create multiple deals at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload */}
            {!showPreview && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">CSV files only</div>
                  </label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => document.getElementById('csv-upload')?.click()}
                    className="mt-4"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Select CSV File"}
                  </Button>
                </div>
              </div>
            )}

            {/* Preview */}
            {showPreview && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Preview</h3>
                    <p className="text-sm text-gray-600">
                      {parsedDeals.length} valid deal(s) ready to upload
                      {validationErrors.length > 0 && (
                        <span className="text-red-600 ml-2">
                          ({validationErrors.length} error(s))
                        </span>
                      )}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowPreview(false);
                      setCsvFile(null);
                      setParsedDeals([]);
                      setValidationErrors([]);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-2">Validation Errors</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {validationErrors.map((error, idx) => (
                            <p key={idx} className="text-sm text-red-700">
                              Row {error.row}: {error.field} - {error.message}
                            </p>
                          ))}
                        </div>
                        <p className="text-xs text-red-600 mt-2">
                          These rows will be skipped. Only valid deals will be uploaded.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Valid Deals Preview */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">#</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Title</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Price</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Original</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">URL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parsedDeals.slice(0, 50).map((deal, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                            <td className="px-3 py-2 text-gray-900">{deal.title}</td>
                            <td className="px-3 py-2 text-green-700 font-medium">
                              ${parseFloat(deal.price).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {deal.original_price ? `$${parseFloat(deal.original_price).toFixed(2)}` : '-'}
                            </td>
                            <td className="px-3 py-2">
                              <a 
                                href={deal.external_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                              >
                                Link <ExternalLink className="h-3 w-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedDeals.length > 50 && (
                      <div className="p-3 bg-gray-50 text-center text-sm text-gray-600">
                        Showing first 50 of {parsedDeals.length} deals
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUploadModal(false);
                setShowPreview(false);
                setCsvFile(null);
                setParsedDeals([]);
                setValidationErrors([]);
              }}
            >
              Cancel
            </Button>
            {showPreview && (
              <Button 
                onClick={handleUpload}
                disabled={parsedDeals.length === 0 || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {parsedDeals.length} Deal(s)
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}