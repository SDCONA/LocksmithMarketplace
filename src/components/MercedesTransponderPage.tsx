import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface MercedesTransponderPageProps {
  onBack: () => void;
}

const mercedesTransponderData = [
  { model: "Mercedes A-Class (W168)", years: "1997–2004", transponder: "Philips Evo (ID73)", oemKey: "—" },
  { model: "Mercedes Actros", years: "1998–", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Mercedes Atego", years: "1998–", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Mercedes Axor", years: "1998–", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Mercedes C-Class (W202)", years: "1995–1997", transponder: "Philips Crypto (ID44, precoded)", oemKey: "—" },
  { model: "Mercedes E-Class (W210)", years: "1995–1997", transponder: "Philips Crypto (ID44, precoded)", oemKey: "—" },
  { model: "Mercedes G-Class", years: "1995–1999", transponder: "Philips Crypto (ID44, precoded)", oemKey: "—" },
  { model: "Mercedes ML-Class (W163)", years: "1997–2004", transponder: "Philips Evo (ID73)", oemKey: "—" },
  { model: "Mercedes Econic", years: "1998–", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Mercedes Sprinter", years: "1998–2006", transponder: "Temic 12 (ID12)", oemKey: "—" },
  { model: "Mercedes Sprinter", years: "2006–", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mercedes Vito", years: "1998–2006", transponder: "Temic 12 (ID12)", oemKey: "—" },
];

export function MercedesTransponderPage({ onBack }: MercedesTransponderPageProps) {
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
              <h1 className="text-gray-900">Mercedes-Benz Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Mercedes-Benz vehicles
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
                {mercedesTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Mercedes-Benz vehicles demonstrate a diverse transponder ecosystem reflecting 
            different vehicle categories and market segments. Mid-1990s passenger cars (C-Class W202, E-Class W210, 
            G-Class) used Philips Crypto (ID44) with precoded transponders. Late 1990s to early 2000s compact and 
            SUV models (A-Class W168, ML-Class W163) adopted Philips Evo (ID73) technology. Commercial vans 
            (Sprinter, Vito) initially used Temic 12 (ID12) from 1998-2006, with Sprinter transitioning to Philips 
            Crypto 2 (ID46) from 2006 onwards. Heavy commercial trucks (Actros, Atego, Axor, Econic) consistently 
            use Megamos 13 (ID13) transponders from 1998 to present, reflecting the distinct security requirements 
            of commercial vehicles. This dataset represents early Mercedes-Benz transponder implementation, primarily 
            covering 1995-2006 models before the widespread adoption of newer technologies in later generations.
          </p>
        </div>
      </div>
    </div>
  );
}
