import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface DaihatsuTransponderPageProps {
  onBack: () => void;
}

const daihatsuTransponderData = [
  { model: "Daihatsu Charade", years: "1997–2000", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Charade", years: "2011+", transponder: "Texas Crypto 4D DST / ID70 / DST80 / 4D72 / ID72", oemKey: "—" },
  { model: "Daihatsu Copen", years: "2002+", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Cuore", years: "1998–2006", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Cuore", years: "2007+", transponder: "Texas Crypto 4D / 4D67", oemKey: "—" },
  { model: "Daihatsu Feroza", years: "1995–1998", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Materia", years: "2006+", transponder: "Texas Crypto 4D / 4D67", oemKey: "—" },
  { model: "Daihatsu Mira", years: "1998–2005", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Mira", years: "2006+", transponder: "Texas Crypto 4D / 4D67", oemKey: "—" },
  { model: "Daihatsu Move", years: "1997–2002", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Naked", years: "2000–2004", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Sirion", years: "1998–2004", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Sirion", years: "2005+", transponder: "Texas Crypto 4D / 4D67", oemKey: "—" },
  { model: "Daihatsu Sonica", years: "2005+", transponder: "Texas Crypto 4D / 4D67", oemKey: "—" },
  { model: "Daihatsu Terios", years: "1997–2005", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Terios", years: "2006+", transponder: "Texas Crypto 4D / 4D67", oemKey: "—" },
  { model: "Daihatsu Trevis", years: "2007+", transponder: "Texas Crypto 4D / 4D67", oemKey: "—" },
  { model: "Daihatsu Xenia", years: "2003–2005", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Daihatsu Xenia", years: "2006+", transponder: "Texas Crypto 4D / 4D67", oemKey: "—" },
];

export function DaihatsuTransponderPage({ onBack }: DaihatsuTransponderPageProps) {
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
              <h1 className="text-gray-900">Daihatsu Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Daihatsu vehicles
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
                {daihatsuTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Daihatsu vehicles (Toyota subsidiary) evolved from basic Texas 4C (ID4C) transponders 
            in the late 1990s to encrypted Texas Crypto 4D (4D67) systems from 2005-2006 onwards. The 2011+ Charade 
            uses advanced Texas Crypto 4D DST technology with ID70/DST80/4D72/ID72 variants for enhanced security.
          </p>
        </div>
      </div>
    </div>
  );
}
