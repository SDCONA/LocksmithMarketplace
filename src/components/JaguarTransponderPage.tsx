import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface JaguarTransponderPageProps {
  onBack: () => void;
}

const jaguarTransponderData = [
  { model: "Jaguar F-PACE", years: "2016+", transponder: "Hitag Pro / PCF7953P / ~ID49", oemKey: "T4A12802, HK83-15K601-BB, HK83-15K601-AA" },
  { model: "Jaguar F-TYPE", years: "2013+", transponder: "Hitag Pro / PCF7953P / ~ID49", oemKey: "5E0U50707-AA, HK83-15K601-AA, EW93-15K601-AC" },
  { model: "Jaguar Sovereign", years: "1996–2000", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Jaguar S-TYPE", years: "1999–2008", transponder: "Texas Crypto 4D (4D60)", oemKey: "—" },
  { model: "Jaguar XE", years: "2015+", transponder: "Hitag Pro / PCF7953P / ~ID49", oemKey: "KOBJTF10A, HK83-15K601-BB, CH22-15K601-BB" },
  { model: "Jaguar XF", years: "2008–2013", transponder: "Hitag-2 (ID46) / PCF7953A, PCF7953AT", oemKey: "KR55WK49244, C2P17156" },
  { model: "Jaguar XF", years: "2013–2018", transponder: "Hitag Pro / PCF7953P / ~ID49", oemKey: "CH22-15K601-BB, HK83-15K601-AA, KOBJTF10A" },
  { model: "Jaguar XJ", years: "1998–2002", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Jaguar XJ", years: "2003–2008", transponder: "Texas Crypto 4D (4D60)", oemKey: "—" },
  { model: "Jaguar XJ", years: "2009–2010", transponder: "Hitag-2 (ID46) / PCF7953A, PCF7953AT", oemKey: "KR55WK49244, AW93-15K601-BD" },
  { model: "Jaguar XJ", years: "2011–2017", transponder: "Hitag Pro / PCF7953P / ~ID49", oemKey: "KOBJTF10A, 5E0U50707-AA, HK83-15K601-AA" },
  { model: "Jaguar XJS", years: "1996", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Jaguar XK", years: "1996–2006", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Jaguar XK", years: "2007–2014", transponder: "Hitag-2 (ID46) / PCF7953A, PCF7953AT", oemKey: "KR55WK49244, C2P17155" },
  { model: "Jaguar XK8", years: "1996–2006", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Jaguar XK8", years: "2007–2014", transponder: "Hitag-2 (ID46) / PCF7953A, PCF7953AT", oemKey: "KR55WK49244, C2P17155" },
  { model: "Jaguar XKR", years: "1996–2006", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Jaguar XKR", years: "2007–2014", transponder: "Hitag-2 (ID46) / PCF7953A, PCF7953AT", oemKey: "KR55WK49244, C2P17155" },
  { model: "Jaguar X-TYPE", years: "2000–2008", transponder: "Texas Crypto 4D (4D60)", oemKey: "—" },
];

export function JaguarTransponderPage({ onBack }: JaguarTransponderPageProps) {
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
              <h1 className="text-gray-900">Jaguar Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Jaguar vehicles
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
                {jaguarTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Jaguar vehicles show a clear transponder evolution across four distinct 
            generations: classic models (1996-2002) used basic Megamos 13 (ID13) technology, early 2000s models 
            (1999-2008) like the S-TYPE and X-TYPE adopted Texas Crypto 4D (4D60) for improved security, mid-2000s 
            to early 2010s (2007-2013) saw the transition to Philips Hitag-2 (ID46 / PCF7953A/PCF7953AT), and 
            modern vehicles (2013+) use advanced Hitag Pro (PCF7953P / ~ID49) technology across all model lines 
            including F-PACE, F-TYPE, XE, and XF. The XJ, XK, XK8, and XKR models demonstrate the complete evolution 
            through multiple generations, showcasing Jaguar's commitment to advancing security technology.
          </p>
        </div>
      </div>
    </div>
  );
}
