import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface LandRoverTransponderPageProps {
  onBack: () => void;
}

const landRoverTransponderData = [
  { model: "Land Rover Defender", years: "1999–2003", transponder: "Philips Crypto", oemKey: "—" },
  { model: "Land Rover Defender", years: "2003–2006", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Land Rover Defender", years: "2006–2013", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Land Rover Defender", years: "2014–2016", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Land Rover Discovery", years: "1995–1998", transponder: "Philips 33 (ID33)", oemKey: "—" },
  { model: "Land Rover Discovery", years: "1999–2004", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Land Rover Discovery", years: "2005–2009", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Land Rover Discovery", years: "2009–2011", transponder: "Hitag 2 (ID46)", oemKey: "—" },
  { model: "Land Rover Discovery", years: "2010–2017", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Land Rover Discovery", years: "2017–2021", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Range Rover Evoque", years: "2011–2018", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Range Rover Evoque", years: "2018–2021", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Land Rover Freelander", years: "2000–2003", transponder: "Philips Crypto", oemKey: "—" },
  { model: "Land Rover Freelander", years: "2003–2006", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Land Rover Freelander", years: "2007–2012", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Land Rover Freelander", years: "2011–2014", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Range Rover", years: "1996–2002", transponder: "Philips Crypto", oemKey: "—" },
  { model: "Range Rover", years: "2002–2009", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Range Rover", years: "2009–2012", transponder: "Hitag 2 (ID46)", oemKey: "—" },
  { model: "Range Rover", years: "2012–2016", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Range Rover", years: "2017–2021", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Range Rover Sport", years: "2005–2009", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Range Rover Sport", years: "2009–2011", transponder: "Hitag 2 (ID46)", oemKey: "—" },
  { model: "Range Rover Sport", years: "2012–2018", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Range Rover Sport", years: "2019–2021", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Range Rover Velar", years: "2017+", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Range Rover Vogue", years: "2003–2009", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Range Rover Vogue", years: "2009–2011", transponder: "Hitag 2 (ID46)", oemKey: "—" },
  { model: "Range Rover Vogue", years: "2012+", transponder: "Hitag Pro (ID49 / ID47)", oemKey: "—" },
  { model: "Land Rover LR3", years: "2005–2009", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Land Rover LR3", years: "2007–2014", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
];

export function LandRoverTransponderPage({ onBack }: LandRoverTransponderPageProps) {
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
              <h1 className="text-gray-900">Land Rover Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Land Rover and Range Rover vehicles
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
                {landRoverTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Land Rover and Range Rover vehicles demonstrate a clear four-generation 
            transponder evolution reflecting British luxury 4x4 engineering advancement. The earliest Discovery 
            models (1995-1998) used Philips 33 (ID33), while late 1990s to early 2000s models across Defender, 
            Discovery, Freelander, and Range Rover adopted Philips Crypto technology. The mid-2000s saw widespread 
            adoption of Philips Crypto 2 (ID46, Hitag 2) across all model lines. Around 2009, some models briefly 
            used simplified Hitag 2 (ID46) before the entire lineup transitioned to advanced Hitag Pro (ID49/ID47) 
            technology from 2010 onwards. Modern vehicles (2011+) including Evoque, Velar, and updated Discovery, 
            Range Rover, Range Rover Sport, and Range Rover Vogue models exclusively use Hitag Pro, representing 
            the brand's commitment to advanced security systems in their premium luxury SUV lineup.
          </p>
        </div>
      </div>
    </div>
  );
}
