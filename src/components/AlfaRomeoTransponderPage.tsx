import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface AlfaRomeoTransponderPageProps {
  onBack: () => void;
}

const alfaRomeoTransponderData = [
  { model: "Alfa Romeo 145", years: "1995–1998", transponder: "TP01 / TP05 / ID33 fixed" },
  { model: "Alfa Romeo 146", years: "1995–1998", transponder: "TP01 / TP05 / ID33 fixed" },
  { model: "Alfa Romeo 147", years: "2000–2010", transponder: "TP08 / ID48 crypto" },
  { model: "Alfa Romeo 155", years: "1995–1998", transponder: "TP01 / TP05 / ID33 fixed" },
  { model: "Alfa Romeo 156", years: "1998–2001", transponder: "ID44 / Philips Crypto" },
  { model: "Alfa Romeo 156", years: "2001–2003", transponder: "TPX4 / ID46 Hitag2" },
  { model: "Alfa Romeo 156", years: "2003–2006", transponder: "TP08 / ID48 crypto" },
  { model: "Alfa Romeo 156 Sportwagon", years: "2000–2001", transponder: "ID44 / Philips Crypto" },
  { model: "Alfa Romeo 156 Sportwagon", years: "2001–2006", transponder: "TPX4 / ID46 Hitag2" },
  { model: "Alfa Romeo 159", years: "2005–2011", transponder: "ID46 / Hitag2" },
  { model: "Alfa Romeo 164", years: "1995–1998", transponder: "TP01 / TP05 / ID33 fixed" },
  { model: "Alfa Romeo 164 Plus", years: "1995–1998", transponder: "TP01 / TP05 / ID33 fixed" },
  { model: "Alfa Romeo 166", years: "1998–2004", transponder: "ID44 / Philips Crypto" },
  { model: "Alfa Romeo 166", years: "2000–2008", transponder: "TPX4 / ID46 Hitag2" },
  { model: "Alfa Romeo Brera", years: "2005–2010", transponder: "ID46 / Hitag2" },
  { model: "Alfa Romeo Giulia", years: "2016–2020", transponder: "AES / ID4A / ID51" },
  { model: "Alfa Romeo Giulietta", years: "2010–2016", transponder: "ID46 / Hitag2" },
  { model: "Alfa Romeo Giulietta", years: "2016–2020", transponder: "AES / ID4A / ID51" },
  { model: "Alfa Romeo GT", years: "2003–2010", transponder: "TP08 / ID48 crypto" },
  { model: "Alfa Romeo GTV", years: "1995–1998", transponder: "TP01 / TP05 / ID33 fixed" },
  { model: "Alfa Romeo MiTo", years: "2008–2016", transponder: "ID46 / Hitag2" },
  { model: "Alfa Romeo MiTo", years: "2016–2018", transponder: "AES / ID4A / ID51" },
  { model: "Alfa Romeo Spider", years: "1995–1998", transponder: "TP01 / TP05 / ID33 fixed" },
  { model: "Alfa Romeo Spider", years: "2006–2011", transponder: "ID46 / Hitag2" },
  { model: "Alfa Romeo Stelvio", years: "2017+", transponder: "AES / ID4A / ID51" },
];

export function AlfaRomeoTransponderPage({ onBack }: AlfaRomeoTransponderPageProps) {
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
              <h1 className="text-gray-900">Alfa Romeo Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Alfa Romeo vehicles
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {alfaRomeoTransponderData.map((item, index) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This reference shows the original transponder types for Alfa Romeo vehicles. 
            Always verify compatibility with your specific key programming equipment before ordering transponders.
          </p>
        </div>
      </div>
    </div>
  );
}
