import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface JeepTransponderPageProps {
  onBack: () => void;
}

const jeepTransponderData = [
  { model: "Jeep Cherokee", years: "1998–2004", transponder: "Texas Crypto 4D (4D64)", oemKey: "—" },
  { model: "Jeep Cherokee", years: "2005–2007", transponder: "Philips Crypto 2 (ID46) / PCF7936, PCF7941AT", oemKey: "OHT692427AA" },
  { model: "Jeep Cherokee", years: "2008–2017", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7961", oemKey: "IYZ-C01C, M3N5W783X, GQ4-53T" },
  { model: "Jeep Cherokee", years: "2015–2021", transponder: "Hitag AES (4A / ID4A) / PCF7953", oemKey: "GQ4-54T, 68105078AE, 68105078AC" },
  { model: "Jeep Commander", years: "2005–2010", transponder: "Philips Crypto 2 (ID46) / PCF7936, PCF7941AT", oemKey: "KOBDT04A, OHT692427AA" },
  { model: "Jeep Commander", years: "2008–2010", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7961", oemKey: "IYZ-C01C, M3N5W783X" },
  { model: "Jeep Compass", years: "2006–2016", transponder: "Philips Crypto 2 (ID46) / PCF7936, PCF7941AT", oemKey: "KOBDT04A, OHT692427AA, 05191962AA" },
  { model: "Jeep Compass", years: "2017–2021", transponder: "Hitag AES (4A / ID4A) / PCF7953", oemKey: "M3N-40821302, 68417821AA, 68250343AB" },
  { model: "Jeep Gladiator", years: "2018–2021", transponder: "Hitag AES (4A / ID4A) / PCF7939", oemKey: "OHT1130261, 68416782, 68416782AA" },
  { model: "Jeep Grand Cherokee", years: "1998–2004", transponder: "Texas Crypto 4D (4D64)", oemKey: "—" },
  { model: "Jeep Grand Cherokee", years: "2004–2007", transponder: "Philips Crypto 2 (ID46) / PCF7936, PCF7941AT", oemKey: "KOBDT04A, OHT692427AA" },
  { model: "Jeep Grand Cherokee", years: "2008–2013", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7961", oemKey: "IYZ-C01C, M3N5W783X, 56046733AA" },
  { model: "Jeep Grand Cherokee", years: "2014–2021", transponder: "Hitag AES (4A / ID4A) / PCF7953", oemKey: "M3N-40821302, 68417821AA, 68250343AB" },
  { model: "Jeep Liberty", years: "2001–2004", transponder: "Texas Crypto 4D (4D64)", oemKey: "—" },
  { model: "Jeep Liberty", years: "2005–2012", transponder: "Philips Crypto 2 (ID46) / PCF7936, PCF7941AT", oemKey: "OHT692713AA" },
  { model: "Jeep Patriot", years: "2006–2017", transponder: "Philips Crypto 2 (ID46) / PCF7936, PCF7941AT", oemKey: "OHT692713AA, OHT692715AA, 68039414AD" },
  { model: "Jeep Renegade", years: "2015–2020", transponder: "Megamos Crypto 2 AES (ID88)", oemKey: "65YK41LXHAA, 68296748AA, 68385479CP" },
  { model: "Jeep Renegade", years: "2015–2021", transponder: "Hitag AES (4A / ID4A) / PCF7953M", oemKey: "6MP33DX9, 6MP33DX9AA, M3N-40821302" },
  { model: "Jeep Wrangler", years: "1998–2006", transponder: "Texas Crypto 4D (4D64)", oemKey: "—" },
  { model: "Jeep Wrangler", years: "2006–2017", transponder: "Philips Crypto 2 (ID46) / PCF7936, PCF7941AT", oemKey: "OHT692713AA, OHT692715AA, 68039414AA" },
  { model: "Jeep Wrangler", years: "2018–2021", transponder: "Hitag AES (4A / ID4A) / PCF7939", oemKey: "OHT1130261, 68416782, 68416782AA" },
];

export function JeepTransponderPage({ onBack }: JeepTransponderPageProps) {
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
              <h1 className="text-gray-900">Jeep Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Jeep vehicles
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
                {jeepTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Jeep vehicles show a clear transponder evolution across three distinct generations 
            reflecting their Chrysler/FCA heritage: late 1990s to early 2000s models (Cherokee, Grand Cherokee, Wrangler, 
            and Liberty) used Texas Crypto 4D (4D64), mid-2000s to mid-2010s vehicles adopted Philips Crypto 2 (ID46) 
            with PCF7936/PCF7941AT chips (Commander, Compass, Patriot, and updated versions of core models), and modern 
            2014+ vehicles use advanced Hitag AES (4A / ID4A) technology with PCF7953/PCF7939 chips. Notable exceptions: 
            2015-2020 Renegade uses unique Megamos Crypto 2 AES (ID88) due to its Fiat platform origins, while 2015-2021 
            Renegade also supports Hitag AES. All major Jeep models (Cherokee, Grand Cherokee, Wrangler) demonstrate the 
            complete evolution through all three generations.
          </p>
        </div>
      </div>
    </div>
  );
}
