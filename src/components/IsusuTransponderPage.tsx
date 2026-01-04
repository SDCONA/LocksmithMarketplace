import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface IsusuTransponderPageProps {
  onBack: () => void;
}

const isusuTransponderData = [
  { model: "Isuzu Ascender", years: "2003–2008", transponder: "Non-transponder key", oemKey: "—" },
  { model: "Isuzu Aska", years: "1998–2002", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu Axiom", years: "2002–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu Big Horn", years: "1998–2002", transponder: "Texas Crypto 4D (4D64)", oemKey: "—" },
  { model: "Isuzu D-Max", years: "2002–2006", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu D-Max", years: "2007–2012", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu D-Max", years: "2012+", transponder: "Philips Crypto 2 (ID46) OR Hitag-3 (ID49) / OEM keys", oemKey: "—" },
  { model: "Isuzu ELF", years: "2009+", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu Fargo", years: "1998–2001", transponder: "Texas Crypto 4D (4D64)", oemKey: "—" },
  { model: "Isuzu FFR 500", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FFR 600", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FFR 700", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FRD 500", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FSD 700", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FSD 850", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FSR 700", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FSR 850", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FSS 550", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FTR 900", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FTS 800", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FVB", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FVL 1400", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FVM 1400", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FVR 1000", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FVY 1400", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu FVZ 1400", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu Grafter", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu i-280", years: "—", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu i-290", years: "—", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu i-350", years: "—", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu i-370", years: "—", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu KB240", years: "—", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu KB300", years: "—", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu MU-X", years: "2004–2013", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NLR 200", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NLS 200", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NNR 200", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NPR 200", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NPR 250", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NPR 275", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NPR 300", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NPS 250", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NPS 300", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu NQR 450", years: "—", transponder: "Philips Crypto 2 (ID46) / Hitag-2 / PCF7936", oemKey: "—" },
  { model: "Isuzu Rodeo", years: "—", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Isuzu Trooper", years: "1996–1998", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Isuzu Trooper", years: "1998–2002", transponder: "Texas Crypto 4D (4D64)", oemKey: "—" },
];

export function IsusuTransponderPage({ onBack }: IsusuTransponderPageProps) {
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
              <h1 className="text-gray-900">Isuzu Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Isuzu vehicles
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
                {isusuTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Isuzu vehicles demonstrate a clear transponder evolution across four generations: 
            early Trooper models (1996-1998) used basic Megamos 13 (ID13), late 1990s to early 2000s adopted Texas 
            Crypto 4D (4D64) for SUVs and Megamos Crypto 48 (ID48) for passenger cars and light trucks (including 
            the i-series, Rodeo, KB series, and early D-Max), mid-2000s onwards saw widespread adoption of Philips 
            Crypto 2 (ID46 / Hitag-2 / PCF7936) across their extensive commercial truck lineup (all F-series and 
            N-series models), and modern D-Max vehicles (2012+) use either Philips Crypto 2 (ID46) or advanced 
            Hitag-3 (ID49). Notable exception: Ascender (2003-2008) used non-transponder keys. Isuzu's commercial 
            truck range shows remarkable standardization with Philips Crypto 2 across the entire lineup.
          </p>
        </div>
      </div>
    </div>
  );
}
