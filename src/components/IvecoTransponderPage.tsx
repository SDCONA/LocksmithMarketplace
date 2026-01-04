import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface IvecoTransponderPageProps {
  onBack: () => void;
}

const ivecoTransponderData = [
  { model: "Iveco 35 C11", years: "2000+", transponder: "Philips Crypto 2 (ID46) / PCF7936", oemKey: "—" },
  { model: "Iveco Eurocargo", years: "2002–2007", transponder: "Philips Crypto 2 (ID46) / PCF7936", oemKey: "—" },
  { model: "Iveco Eurocargo", years: "2008+", transponder: "Texas Crypto 80-bit (ID6E)", oemKey: "—" },
  { model: "Iveco Eurostar", years: "1998+", transponder: "Philips Crypto 2 (ID46) / PCF7936AS", oemKey: "—" },
  { model: "Iveco Daily", years: "1998–2001", transponder: "Philips ID33 / PCF7930, PCF7931", oemKey: "—" },
  { model: "Iveco Daily", years: "2001–2007", transponder: "Philips Crypto 2 (ID46) / PCF7936", oemKey: "—" },
  { model: "Iveco Daily", years: "2007–2011", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Iveco Daily", years: "2011+", transponder: "Philips Crypto 2 (ID46) / PCF7936 / OEM key with PCF7946", oemKey: "—" },
  { model: "Iveco New Daily", years: "1998+", transponder: "Philips Crypto 2 (ID46) / PCF7936", oemKey: "—" },
  { model: "Iveco S 2000", years: "1998+", transponder: "Philips Crypto 2 (ID46) / PCF7936", oemKey: "—" },
  { model: "Iveco Stralis", years: "2002–2007", transponder: "Philips Crypto 2 (ID46) / PCF7936", oemKey: "—" },
  { model: "Iveco Stralis", years: "2008+", transponder: "Texas Crypto 80-bit (ID6E)", oemKey: "—" },
];

export function IvecoTransponderPage({ onBack }: IvecoTransponderPageProps) {
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
              <h1 className="text-gray-900">Iveco Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Iveco commercial vehicles
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
                {ivecoTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Iveco commercial vehicles show a typical European commercial truck transponder 
            evolution across three generations: late 1990s models started with basic Philips ID33 (PCF7930/PCF7931), 
            early 2000s through mid-2000s adopted Philips Crypto 2 (ID46 / PCF7936/PCF7936AS) as the standard across 
            most models including Daily, Stralis, and Eurocargo, with a brief adoption of Megamos Crypto 48 (ID48) 
            in Daily models (2007-2011), and late 2000s+ (2008+) saw heavier models like Eurocargo and Stralis 
            transition to Texas Crypto 80-bit (ID6E) for enhanced security. The Daily van series shows the most 
            complex evolution with four distinct transponder generations.
          </p>
        </div>
      </div>
    </div>
  );
}
