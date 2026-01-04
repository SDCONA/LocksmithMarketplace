import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface KawasakiTransponderPageProps {
  onBack: () => void;
}

const kawasakiTransponderData = [
  { model: "Kawasaki Ninja ZX-6R", years: "2004–2017", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja ZX-10R", years: "2004–2018", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja ZX-12R", years: "2002–2006", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja ZX-14", years: "2006–2011", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja ZX-14R", years: "2012–2018", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja 1000", years: "2011–2017", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja 1000S", years: "2011–2017", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja Z1000SX", years: "2011–2017", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja ZZ-R1400", years: "2006–2016", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja 300", years: "2012–2017", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja 650R", years: "2006–2016", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja 250R", years: "2004–2017", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja 400R", years: "2011+", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja 500R", years: "2002–2009", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Ninja 600", years: "2002–2008", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki ER-6N", years: "2006–2016", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki ER-6F", years: "2006–2016", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Z750", years: "All MY", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Z750S", years: "All MY", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Z750 ABS", years: "All MY", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Z750R", years: "All MY", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki GTR1400", years: "2007+", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki ZZR1200", years: "2002–2006", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Versys 650", years: "2007–2018", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Versys 1000", years: "2012+", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Z800", years: "All MY", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Kawasaki Jet Ski Ultra", years: "—", transponder: "Texas Crypto 4D", oemKey: "—" },
];

export function KawasakiTransponderPage({ onBack }: KawasakiTransponderPageProps) {
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
              <h1 className="text-gray-900">Kawasaki Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Kawasaki motorcycles
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
                {kawasakiTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Kawasaki motorcycles show remarkable consistency in their transponder technology, 
            with virtually their entire modern lineup (2002-2018+) using Texas Crypto 4D across all model ranges. This 
            includes the iconic Ninja sport bike series (from the entry-level 250R to the flagship ZX-14R), the naked 
            Z-series bikes (Z750, Z800), adventure-touring Versys models (650 and 1000), sport-touring GTR1400, and 
            even the Jet Ski Ultra watercraft. The standardization of Texas Crypto 4D technology across such diverse 
            vehicle types demonstrates Kawasaki's commitment to a unified security platform, making key replacement 
            and programming relatively straightforward across their entire product range during this era.
          </p>
        </div>
      </div>
    </div>
  );
}
