import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface SubaruTransponderPageProps {
  onBack: () => void;
}

const subaruTransponderData = [
  { model: "Subaru B9 Tribeca", years: "2005–2006", transponder: "Texas Crypto 4D (ID4D60)", oemKey: "—" },
  { model: "Subaru B9 Tribeca", years: "2007–", transponder: "Texas Crypto 4D (ID4D62)", oemKey: "—" },
  { model: "Subaru Baja", years: "2005–2007", transponder: "Texas Crypto 4D (ID4D62)", oemKey: "—" },
  { model: "Subaru BRZ", years: "2012–", transponder: "Texas Crypto 2 (ID4D62-6F / 6F-62)", oemKey: "—" },
  { model: "Subaru Forester", years: "1998–2003", transponder: "Texas Crypto 4D (ID4D60)", oemKey: "—" },
  { model: "Subaru Forester", years: "2004–2007", transponder: "Texas Crypto 4D (ID4D62)", oemKey: "—" },
  { model: "Subaru Forester", years: "2008–2011", transponder: "Texas Crypto 4D (ID4D62)", oemKey: "—" },
  { model: "Subaru Forester", years: "2012–", transponder: "Texas Crypto 2 (ID4D62-6F / 6F-62)", oemKey: "—" },
  { model: "Subaru G3X Justy", years: "2004–", transponder: "Texas Crypto 4D (ID4D65)", oemKey: "—" },
  { model: "Subaru Impreza", years: "1996–2000", transponder: "Philips ID33", oemKey: "—" },
  { model: "Subaru Impreza", years: "2001–2003", transponder: "Texas Crypto 4D (ID4D60)", oemKey: "—" },
  { model: "Subaru Impreza", years: "2004–2010", transponder: "Texas Crypto 4D (ID4D62)", oemKey: "—" },
  { model: "Subaru Impreza", years: "2011–", transponder: "Texas Crypto 2 (ID4D62-6F / 6F-62)", oemKey: "—" },
  { model: "Subaru Justy", years: "1996–2003", transponder: "Texas 4C", oemKey: "—" },
  { model: "Subaru Justy", years: "2006–", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Subaru Legacy", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Subaru Legacy", years: "1998–2004", transponder: "Texas Crypto 4D (ID4D60)", oemKey: "—" },
  { model: "Subaru Legacy", years: "2005–2009", transponder: "Texas Crypto 4D (ID4D62)", oemKey: "—" },
  { model: "Subaru Legacy", years: "2010–", transponder: "Texas Crypto 2 (ID4D62-6F / 6F-62)", oemKey: "—" },
  { model: "Subaru Liberty", years: "1998–2003", transponder: "Texas Crypto 4D (ID4D60)", oemKey: "—" },
  { model: "Subaru Liberty", years: "2004–2010", transponder: "Texas Crypto 4D (ID4D62)", oemKey: "—" },
  { model: "Subaru Liberty", years: "2011–", transponder: "Texas Crypto 2 (ID4D62-6F / 6F-62)", oemKey: "—" },
  { model: "Subaru Outback", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Subaru Outback", years: "1999–2004", transponder: "Texas Crypto 4D (ID4D60)", oemKey: "—" },
  { model: "Subaru Outback", years: "2005–2009", transponder: "Texas Crypto 4D (ID4D62)", oemKey: "—" },
  { model: "Subaru Outback", years: "2009–", transponder: "Texas Crypto 2 (ID4D62-6F / 6F-62)", oemKey: "—" },
  { model: "Subaru Trezia", years: "2011–", transponder: "Texas Crypto 2 (ID4D62-6F / 6F-62)", oemKey: "—" },
  { model: "Subaru XV", years: "2012–", transponder: "Texas Crypto 2 (ID4D62-6F / 6F-62)", oemKey: "—" },
];

export function SubaruTransponderPage({ onBack }: SubaruTransponderPageProps) {
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
              <h1 className="text-gray-900">Subaru Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Subaru vehicles
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
                {subaruTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Subaru vehicles (Japanese automotive manufacturer, founded 1953) demonstrate 
            a comprehensive four-generation transponder evolution with exclusive focus on Texas Instruments 
            technology. Mid-1990s models (Impreza, Legacy, Outback) used basic Philips ID33 transponders, 
            representing first-generation immobilizers, with Justy uniquely using Texas 4C (1996-2003). Late 1990s 
            to early 2000s saw widespread adoption of Texas Crypto 4D (ID4D60) across the lineup (B9 Tribeca, 
            Forester, Impreza, Legacy, Liberty, Outback). From 2004-2011, Subaru transitioned to enhanced Texas 
            Crypto 4D (ID4D62) technology across all models (B9 Tribeca, Baja, Forester, Impreza, Legacy, Liberty, 
            Outback), with G3X Justy uniquely using ID4D65 variant (2004+) and standard Justy using generic Texas 
            Crypto 4D (2006+). Modern 2009+ vehicles use advanced Texas Crypto 2 technology (ID4D62-6F / 6F-62) 
            representing the latest encryption generation (BRZ, Forester, Impreza, Legacy, Liberty, Outback, Trezia, 
            XV). Subaru's exclusive partnership with Texas Instruments creates a highly specialized transponder 
            ecosystem distinct from most other manufacturers, with the Texas 4D Crypto series (ID4D60, ID4D62, 
            ID4D65) and Texas Crypto 2 (6F-62) representing proprietary security implementations. Locksmiths working 
            with Subaru vehicles benefit from this focused technology stack, though Texas Instruments transponders 
            require specialized programming equipment compared to more common Philips or Megamos systems.
          </p>
        </div>
      </div>
    </div>
  );
}
