import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface HummerTransponderPageProps {
  onBack: () => void;
}

const hummerTransponderData = [
  { model: "Hummer H2", years: "2008+", transponder: "Philips Crypto 2 / Hitag2 / ID46 (PCF7936)", oemKey: "—" },
  { model: "Hummer H3", years: "2008+", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
];

export function HummerTransponderPage({ onBack }: HummerTransponderPageProps) {
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
              <h1 className="text-gray-900">Hummer Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Hummer vehicles
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
                {hummerTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Hummer vehicles from 2008+ use GM's transponder technology. The H2 uses Philips 
            Crypto 2 / Hitag 2 (ID46 / PCF7936), which was standard across GM's full-size SUV platform, while the 
            H3 uses Megamos Crypto 48 (ID48), sharing technology with GM's mid-size truck platforms. As a GM brand, 
            Hummer vehicles follow the same transponder evolution as Chevrolet, GMC, and Cadillac.
          </p>
        </div>
      </div>
    </div>
  );
}
