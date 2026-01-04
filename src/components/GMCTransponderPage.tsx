import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface GMCTransponderPageProps {
  onBack: () => void;
}

const gmcTransponderData = [
  { model: "GMC Acadia", years: "2007–2016", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936", oemKey: "—" },
  { model: "GMC Acadia", years: "2017+", transponder: "Hitag2 Extended / ID46E / PCF7937E, PCF7961E", oemKey: "HYQ14EA 13508275, 22984995" },
  { model: "GMC Canyon", years: "2004–2008", transponder: "PassLock system (no transponder)", oemKey: "—" },
  { model: "GMC Canyon", years: "2008–2012", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "GMC Canyon", years: "2014–2020", transponder: "Hitag2 Extended / ID46E / PCF7952E, PCF7937E", oemKey: "M3N32337100 13580082" },
  { model: "GMC Envoy", years: "2001–2006", transponder: "VATS / PassKey system", oemKey: "—" },
  { model: "GMC Envoy", years: "2006–2009", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936AS", oemKey: "—" },
  { model: "GMC Savana", years: "1998–2007", transponder: "VATS / PassKey system", oemKey: "—" },
  { model: "GMC Savana", years: "2008–2020", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936AS, PCF7936AA", oemKey: "—" },
  { model: "GMC Sierra", years: "1998–2006", transponder: "VATS / PassKey system", oemKey: "—" },
  { model: "GMC Sierra", years: "2007–2013", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936", oemKey: "—" },
  { model: "GMC Sierra", years: "2014–2019", transponder: "Hitag2 Extended / ID46E / PCF7952E, PCF7937E", oemKey: "M3N32337100 13580082" },
  { model: "GMC Sierra", years: "2019+", transponder: "Hitag2 Extended / ID46E / PCF7952E, PCF7937E", oemKey: "M3N32337200 84209237, HYQ1ES 13522904" },
  { model: "GMC Terrain", years: "2010–2019", transponder: "Hitag2 Extended / ID46E / PCF7937E", oemKey: "OHT01060512, 13574863, 20979468, 13504199" },
  { model: "GMC Yukon", years: "1998–2006", transponder: "PassLock system (no transponder)", oemKey: "—" },
  { model: "GMC Yukon", years: "2007–2014", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936", oemKey: "—" },
  { model: "GMC Yukon", years: "2015–2020", transponder: "Hitag2 Extended / ID46E / PCF7952E, PCF7937E", oemKey: "HYQ1AA 13580804, 13508280" },
];

export function GMCTransponderPage({ onBack }: GMCTransponderPageProps) {
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
              <h1 className="text-gray-900">GMC Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for GMC vehicles
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
                {gmcTransponderData.map((item, index) => (
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
            <strong>Note:</strong> GMC vehicles evolved through three major security generations: early models 
            (1998-2006) used VATS / PassKey resistor-based systems or PassLock (no transponder), mid-2000s to 
            early 2010s adopted Philips Crypto 2 / Hitag 2 (ID46) transponder technology, and modern vehicles 
            (2014+) use advanced Hitag 2 Extended (ID46E) encryption for maximum security. As GM's premium truck 
            and SUV division, GMC shares transponder technology with Chevrolet and Cadillac platforms.
          </p>
        </div>
      </div>
    </div>
  );
}
