import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface DaewooTransponderPageProps {
  onBack: () => void;
}

const daewooTransponderData = [
  { model: "DAEWOO Aranos", years: "1995–1997", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "DAEWOO Aveo", years: "2004–2011", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAEWOO Captiva", years: "2006+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7936", oemKey: "—" },
  { model: "DAEWOO Cruze", years: "2009+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7936", oemKey: "—" },
  { model: "DAEWOO Epica", years: "2006+", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "DAEWOO Espero", years: "1995–1997", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "DAEWOO Evanda", years: "2003–2006", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "DAEWOO Kalos", years: "2002–2006", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAEWOO Lacetti", years: "2002–2004", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAEWOO Lacetti", years: "2004–2009", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "DAEWOO Lanos", years: "1997–2002", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "DAEWOO Lanos", years: "2002–2004", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAEWOO Leganza", years: "1997–2000", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "DAEWOO Leganza", years: "2000–2008", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAEWOO Leganza (USA)", years: "2001–2004", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "DAEWOO Matiz", years: "1998–2000", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "DAEWOO Matiz", years: "2001+", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAEWOO Nexia", years: "1995–1997", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "DAEWOO Nubira", years: "1997–2000", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "DAEWOO Nubira", years: "2000–2006", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "DAEWOO Nubira SW", years: "2004–2009", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
];

export function DaewooTransponderPage({ onBack }: DaewooTransponderPageProps) {
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
              <h1 className="text-gray-900">DAEWOO Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for DAEWOO vehicles
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
                {daewooTransponderData.map((item, index) => (
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
            <strong>Note:</strong> DAEWOO (now part of GM) evolved through three transponder generations: early models (1995–2002) 
            used basic Megamos 13 (ID13) transponders, mid-2000s models transitioned to Megamos Crypto 48 (ID48), and later models 
            (2004+) adopted Texas Crypto 4D60 (ID60) and Philips Hitag 2 systems. Some models like the Lacetti, Lanos, Leganza, 
            Matiz, and Nubira underwent transponder upgrades mid-production.
          </p>
        </div>
      </div>
    </div>
  );
}
