import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface BuickTransponderPageProps {
  onBack: () => void;
}

const buickTransponderData = [
  { model: "Buick Allure", years: "2005–2009", transponder: "TP05 / ID13 fixed" },
  { model: "Buick Allure", years: "2010+", transponder: "TP12GM / ID46 Hitag2" },
  { model: "Buick Cascada", years: "2016–2019", transponder: "ID46E / Hitag2 Extended" },
  { model: "Buick Century", years: "1997–2005", transponder: "VATS / PassKey" },
  { model: "Buick Century", years: "2000–2005", transponder: "TP05 / ID13 fixed" },
  { model: "Buick Enclave", years: "2008–2017", transponder: "TP12GM / ID46 Hitag2" },
  { model: "Buick Enclave", years: "2017–2020", transponder: "ID46E / Hitag2 Extended" },
  { model: "Buick Encore", years: "2014–2020", transponder: "ID46E / Hitag2 Extended" },
  { model: "Buick Encore", years: "2017–2021", transponder: "ID46E / Hitag2 Extended" },
  { model: "Buick Envision", years: "2016–2020", transponder: "ID46E / Hitag2 Extended" },
  { model: "Buick LaCrosse", years: "2005–2009", transponder: "TP05 / ID13 fixed" },
  { model: "Buick LaCrosse", years: "2010–2016", transponder: "ID46E / Hitag2 Extended" },
  { model: "Buick LaCrosse", years: "2017–2019", transponder: "ID46E / Hitag2 Extended" },
  { model: "Buick LeSabre", years: "1992–1999", transponder: "VATS / PassKey" },
  { model: "Buick LeSabre", years: "2000–2005", transponder: "TP05 / ID13 fixed" },
  { model: "Buick Lucerne", years: "2006–2011", transponder: "TP12GM / ID46 Hitag2" },
  { model: "Buick Park Avenue", years: "1991–1996", transponder: "VATS / PassKey" },
  { model: "Buick Park Avenue", years: "1997–2005", transponder: "TP05 / ID13 fixed" },
  { model: "Buick Rainier", years: "2004–2007", transponder: "TP05 / ID13 fixed" },
  { model: "Buick Reatta", years: "1990–1992", transponder: "VATS / PassKey" },
  { model: "Buick Regal", years: "1994–2004", transponder: "VATS / PassKey" },
  { model: "Buick Regal", years: "2011–2017", transponder: "ID46E / Hitag2 Extended" },
  { model: "Buick Regal", years: "2018–2020", transponder: "ID46E / Hitag2 Extended" },
  { model: "Buick Rendezvous", years: "2002–2007", transponder: "TP05 / ID13 fixed" },
  { model: "Buick Riviera", years: "1990–1998", transponder: "VATS / PassKey" },
  { model: "Buick Roadmaster", years: "1994–1996", transponder: "VATS / PassKey" },
  { model: "Buick Terraza", years: "2005–2007", transponder: "TP05 / ID13 fixed" },
  { model: "Buick Verano", years: "2012–2017", transponder: "ID46E / Hitag2 Extended" },
];

export function BuickTransponderPage({ onBack }: BuickTransponderPageProps) {
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
              <h1 className="text-gray-900">Buick Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Buick vehicles
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
                {buickTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Older Buick models (1990s–early 2000s) used VATS/PassKey resistor systems. 
            Modern Buick vehicles use advanced ID46E transponders with Hitag2 Extended technology.
          </p>
        </div>
      </div>
    </div>
  );
}
