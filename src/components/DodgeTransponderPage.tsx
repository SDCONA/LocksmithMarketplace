import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface DodgeTransponderPageProps {
  onBack: () => void;
}

const dodgeTransponderData = [
  { model: "Dodge Avenger", years: "2008–2014", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936", oemKey: "PCF7941 / OHT692427AA 68273329, 68273329AB" },
  { model: "Dodge Caliber", years: "2007–2012", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936", oemKey: "PCF7941 / OHT692427AA 05175786, 56040669" },
  { model: "Dodge Caravan", years: "1999–2003", transponder: "Texas Crypto 4D / 4D64", oemKey: "—" },
  { model: "Dodge Caravan", years: "2004–2007", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936AS", oemKey: "PCF7941 / M3N5WY72XX 05183681" },
  { model: "Dodge Challenger", years: "2008–2014", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941, PCF7341", oemKey: "IYZC01C 05026886AK" },
  { model: "Dodge Challenger", years: "2015–2021", transponder: "Hitag AES / ID4A / PCF7953M", oemKey: "M3M-40821302 68234958" },
  { model: "Dodge Charger", years: "2006–2007", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941", oemKey: "KOBDT04A 68004413AA" },
  { model: "Dodge Charger", years: "2008–2010", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941, PCF7341", oemKey: "IYZ-C01C 05026886" },
  { model: "Dodge Charger", years: "2011–2021", transponder: "Hitag AES / ID4A / PCF7953M", oemKey: "M3M-40821302 68234959" },
  { model: "Dodge Dakota", years: "1999–2004", transponder: "Texas Crypto 4D / 4D64", oemKey: "—" },
  { model: "Dodge Dakota", years: "2005–2011", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936", oemKey: "PCF7941 / KOBDT04A" },
  { model: "Dodge Dart", years: "2013–2016", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941", oemKey: "M3N32297100" },
  { model: "Dodge Dart", years: "2014–2016", transponder: "Hitag AES / ID4A / PCF7953M", oemKey: "M3N40821302" },
  { model: "Dodge Durango", years: "1999–2003", transponder: "Texas Crypto 4D / 4D64", oemKey: "—" },
  { model: "Dodge Durango", years: "2004–2010", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936", oemKey: "PCF7941 / OHT692427AA" },
  { model: "Dodge Durango", years: "2011–2013", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941", oemKey: "05026537AB" },
  { model: "Dodge Durango", years: "2014–2021", transponder: "Hitag AES / ID4A / PCF7953M", oemKey: "M3M-40821302 68150061" },
  { model: "Dodge Grand Caravan", years: "1999–2003", transponder: "Texas Crypto 4D / 4D64", oemKey: "—" },
  { model: "Dodge Grand Caravan", years: "2004–2007", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941", oemKey: "M3N5WY72XX" },
  { model: "Dodge Grand Caravan", years: "2008–2020", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941, PCF7341", oemKey: "IYZ-C01C 56046639" },
  { model: "Dodge Intrepid", years: "1998–2005", transponder: "Texas Crypto 4D / 4D64", oemKey: "—" },
  { model: "Dodge Journey", years: "2009–2010", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941", oemKey: "IYZ-C01C 56046639" },
  { model: "Dodge Journey", years: "2011–2020", transponder: "Hitag AES / ID4A / PCF7953M", oemKey: "M3N40821302" },
  { model: "Dodge Magnum", years: "2005–2007", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936", oemKey: "PCF7941 / KOBDT04A" },
  { model: "Dodge Magnum", years: "2008", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941, PCF7341", oemKey: "56046707" },
  { model: "Dodge Neon", years: "2000–2005", transponder: "Texas Crypto 4D / 4D64", oemKey: "—" },
  { model: "Dodge Nitro", years: "2007–2011", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941", oemKey: "56040649AC" },
  { model: "Dodge RAM", years: "1999–2005", transponder: "Texas Crypto 4D / 4D64", oemKey: "—" },
  { model: "Dodge RAM", years: "2006–2009", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941", oemKey: "56040649AC" },
  { model: "Dodge RAM", years: "2009–2018", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7941, PCF7961A", oemKey: "GQ4-53T" },
  { model: "Dodge RAM", years: "2013–2018", transponder: "Hitag AES / ID4A / PCF7953M", oemKey: "GQ4-54T" },
  { model: "Dodge RAM", years: "2019–2021", transponder: "Hitag AES / ID4A", oemKey: "GQ4-76T" },
  { model: "Dodge RAM ProMaster", years: "2015–2019", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7946A", oemKey: "RX2TRF198" },
  { model: "Dodge Stratus", years: "2001–2006", transponder: "Texas Crypto 4D / 4D64", oemKey: "—" },
  { model: "Dodge Viper", years: "2015–2017", transponder: "Hitag AES / ID4A / PCF7953M", oemKey: "M3N40821302" },
];

export function DodgeTransponderPage({ onBack }: DodgeTransponderPageProps) {
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
              <h1 className="text-gray-900">Dodge Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Dodge vehicles
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
                {dodgeTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Dodge vehicles evolved through three major transponder generations: early models (1998–2005) 
            used Texas Crypto 4D (4D64), mid-2000s to early 2010s transitioned to Philips Crypto 2 / Hitag 2 (ID46) systems, 
            and modern vehicles (2011+) adopted advanced Hitag AES (ID4A) encryption. The RAM lineup shows overlapping technology 
            during transition periods, with multiple transponder types available within the same model year.
          </p>
        </div>
      </div>
    </div>
  );
}
