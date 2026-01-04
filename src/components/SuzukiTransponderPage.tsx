import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface SuzukiTransponderPageProps {
  onBack: () => void;
}

const suzukiTransponderData = [
  { model: "Suzuki Alto", years: "1996–2002", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Suzuki Alto", years: "2002–2008", transponder: "Texas Crypto 4D (ID4D65)", oemKey: "—" },
  { model: "Suzuki Alto", years: "2008–2013", transponder: "Philips Crypto 2 (ID46)", oemKey: "37145M55AD0" },
  { model: "Suzuki Baleno", years: "1996–2001", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Suzuki Baleno", years: "2015–", transponder: "Philips Crypto 3 (ID47)", oemKey: "14LP1410T6" },
  { model: "Suzuki Celerio", years: "2015–", transponder: "Philips Crypto 3 (ID47)", oemKey: "37145-84M21" },
  { model: "Suzuki Equator", years: "2008–2012", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Suzuki Escudo", years: "1996–2002", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Grand Vitara", years: "1996–2002", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Grand Vitara", years: "2002–2008", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Grand Vitara", years: "2008–2013", transponder: "Philips Crypto 2 (ID46)", oemKey: "37145-55JC1" },
  { model: "Suzuki Ignis", years: "2000–2006", transponder: "Texas Crypto 4D (ID4D65) / Philips Crypto (ID40)", oemKey: "—" },
  { model: "Suzuki Jimny", years: "1999–2002", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Suzuki Jimny", years: "2002–2006", transponder: "Texas Crypto 4D (ID4D65) / Philips Crypto (ID40)", oemKey: "—" },
  { model: "Suzuki Jimny", years: "2006–2013", transponder: "Texas Crypto 4D (ID4D65)", oemKey: "37145-55J81" },
  { model: "Jimny Diesel", years: "2002–", transponder: "Philips ID33 / Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Suzuki Kizashi", years: "2010–2014", transponder: "Philips Crypto 2 (ID46)", oemKey: "37172-57L20" },
  { model: "Suzuki Liana", years: "2001–2005", transponder: "Texas Crypto 4D (ID4D65)", oemKey: "—" },
  { model: "Suzuki Liana", years: "2006–", transponder: "Texas Crypto 4D (ID4D66)", oemKey: "—" },
  { model: "Suzuki Splash", years: "2008–2014", transponder: "Philips Crypto 2 (ID46)", oemKey: "3714555JA0" },
  { model: "Suzuki Swift", years: "1996–2004", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Suzuki Swift", years: "2005–2010", transponder: "Philips Crypto 2 (ID46)", oemKey: "3714555JA0" },
  { model: "Suzuki Swift", years: "2010–2017", transponder: "Philips Crypto 2 (ID46)", oemKey: "37172-71L11" },
  { model: "Suzuki Swift", years: "2015–", transponder: "Philips Crypto 3 (ID47)", oemKey: "37172-53R01" },
];

export function SuzukiTransponderPage({ onBack }: SuzukiTransponderPageProps) {
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
              <h1 className="text-gray-900">Suzuki Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Suzuki vehicles
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
                {suzukiTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Suzuki vehicles (Japanese automotive manufacturer, founded 1909) demonstrate 
            a comprehensive four-generation transponder evolution with distinctive hybrid technology approaches. 
            Mid-1990s to early 2000s models (Alto, Baleno, Escudo, Grand Vitara, Jimny, Swift) used basic Texas 4C 
            (ID4C) transponders, representing first-generation immobilizers. Early 2000s saw widespread adoption of 
            Texas Crypto 4D technology across multiple models: Alto used ID4D65 (2002-2008), Ignis and Jimny offered 
            dual compatibility with ID4D65 and Philips Crypto ID40 (2000-2006, 2002-2006), Liana evolved through 
            ID4D65 (2001-2005) to ID4D66 (2006+), and Jimny continued with ID4D65 (2006-2013). Jimny Diesel uniquely 
            combined legacy Philips ID33 with modern Philips Crypto 2 (ID46) starting 2002. From 2002-2017, Suzuki 
            transitioned to Philips Crypto 2 (ID46) across the lineup with comprehensive OEM documentation: Alto 
            (37145M55AD0), Grand Vitara (37145-55JC1), Jimny Diesel variant, Kizashi (37172-57L20), Splash (3714555JA0), 
            Swift 2005-2010 (3714555JA0), and Swift 2010-2017 (37172-71L11). Modern 2015+ vehicles use advanced 
            Philips Crypto 3 (ID47) representing the latest generation: Baleno (14LP1410T6), Celerio (37145-84M21), 
            and Swift (37172-53R01). Suzuki's unique approach combining Texas Instruments and Philips technologies 
            creates a diverse transponder ecosystem requiring locksmiths to maintain compatibility with multiple 
            encryption standards (Texas 4C, Texas Crypto 4D variants ID4D65/ID4D66, Philips Crypto ID40, Philips 
            Crypto 2 ID46, Philips Crypto 3 ID47), though extensive OEM key documentation simplifies identification 
            and programming procedures.
          </p>
        </div>
      </div>
    </div>
  );
}
