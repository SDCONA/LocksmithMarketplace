import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface DafTransponderPageProps {
  onBack: () => void;
}

const dafTransponderData = [
  { model: "DAF CF", years: "2002–2011", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAF CF", years: "2012+", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAF LF", years: "2002–2012", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAF LF", years: "2012+", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAF XF", years: "2002–2012", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAF XF", years: "2013+", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAF XT", years: "2013+", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
];

export function DafTransponderPage({ onBack }: DafTransponderPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-gray-900">DAF Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for DAF commercial vehicles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-900">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-gray-900">
                    Years
                  </th>
                  <th className="px-6 py-3 text-left text-gray-900">
                    Transponder Type
                  </th>
                  <th className="px-6 py-3 text-left text-gray-900">
                    OEM Key (examples)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dafTransponderData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">
                      {item.model}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.years}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-gray-900 bg-blue-50 border border-blue-200">
                        {item.transponder}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.oemKey}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> DAF Trucks (Dutch manufacturer) has consistently used Megamos Crypto 48 (ID48) transponder technology 
            across all models since 2002. This uniform system simplifies key programming for the CF, LF, XF, and XT commercial truck ranges.
          </p>
        </div>
      </div>
    </div>
  );
}
