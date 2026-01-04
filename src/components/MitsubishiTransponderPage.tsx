import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface MitsubishiTransponderPageProps {
  onBack: () => void;
}

const mitsubishiTransponderData = [
  { model: "Mitsubishi 3000GT / GTO", years: "1996–2001", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Mitsubishi 380", years: "2005–2008", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi ASX", years: "2010–2015", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi ASX", years: "2016–", transponder: "Philips Crypto 3 (ID52 / ID47)", oemKey: "—" },
  { model: "Mitsubishi Carisma", years: "1996–2000", transponder: "Philips ID73", oemKey: "—" },
  { model: "Mitsubishi Carisma", years: "2000–2004", transponder: "Philips Crypto (ID44, precoded)", oemKey: "—" },
  { model: "Mitsubishi Challenger", years: "1999–2002", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Mitsubishi Challenger", years: "2002–2003", transponder: "Texas Crypto 4D (ID62)", oemKey: "—" },
  { model: "Mitsubishi Colt", years: "1996–2000", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Mitsubishi Colt", years: "2000–2003", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Mitsubishi Colt", years: "2004–2011", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi Eclipse", years: "1996–2000", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Mitsubishi Eclipse", years: "2000–2002", transponder: "Texas Crypto 4D (ID60 / ID64)", oemKey: "—" },
  { model: "Mitsubishi Eclipse", years: "2001–2005", transponder: "Texas Crypto 4D (ID61)", oemKey: "—" },
  { model: "Mitsubishi Eclipse", years: "2006–2011", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi Galant", years: "1996–2000", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Mitsubishi Galant", years: "2000–2002", transponder: "Texas Crypto 4D (ID64)", oemKey: "—" },
  { model: "Mitsubishi Galant", years: "2002–2004", transponder: "Texas Crypto 4D (ID61)", oemKey: "—" },
  { model: "Mitsubishi Galant", years: "2005–2012", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi L200 / Triton", years: "1999–2002", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Mitsubishi L200 / Triton", years: "2002–2005", transponder: "Texas Crypto 4D (ID61)", oemKey: "—" },
  { model: "Mitsubishi L200 / Triton", years: "2006–2015", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi L200 / Triton", years: "2016–2021", transponder: "Philips Crypto 3 (ID52 / ID47)", oemKey: "—" },
  { model: "Mitsubishi Lancer", years: "1996–2003", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Mitsubishi Lancer", years: "2003–2006", transponder: "Texas Crypto 4D (ID61)", oemKey: "—" },
  { model: "Mitsubishi Lancer", years: "2007–2016", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi Mirage", years: "1996–2002", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Mitsubishi Mirage", years: "2012–2014", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi Mirage", years: "2015–", transponder: "Philips Crypto 3", oemKey: "—" },
  { model: "Mitsubishi Montero / Pajero", years: "1996–2000", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Mitsubishi Montero / Pajero", years: "2001–2006", transponder: "Texas Crypto 4D (ID60/61/62)", oemKey: "—" },
  { model: "Mitsubishi Montero / Pajero", years: "2006–2015", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi Montero / Pajero", years: "2016–", transponder: "Philips Crypto 3", oemKey: "—" },
  { model: "Mitsubishi Outlander", years: "2000–2003", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Mitsubishi Outlander", years: "2004–2006", transponder: "Texas Crypto 4D (ID61)", oemKey: "—" },
  { model: "Mitsubishi Outlander", years: "2006–2012", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi Outlander", years: "2012–", transponder: "Philips Crypto 2 / 3", oemKey: "—" },
  { model: "Mitsubishi Space Star", years: "1999–", transponder: "Philips Crypto (ID44) / Texas 4D", oemKey: "—" },
  { model: "Mitsubishi Space Wagon", years: "1998–1999", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Mitsubishi Space Wagon", years: "1999–", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Mitsubishi Shogun", years: "1996–2000", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Mitsubishi Shogun", years: "2001–2006", transponder: "Texas Crypto 4D (ID60/61/62)", oemKey: "—" },
  { model: "Mitsubishi Shogun", years: "2006–2015", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Mitsubishi Shogun", years: "2016–", transponder: "Philips Crypto 3", oemKey: "—" },
];

export function MitsubishiTransponderPage({ onBack }: MitsubishiTransponderPageProps) {
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
              <h1 className="text-gray-900">Mitsubishi Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Mitsubishi vehicles
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
                {mitsubishiTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Mitsubishi vehicles demonstrate a comprehensive four-generation transponder evolution 
            reflecting Japanese engineering advancement through strategic technology partnerships. Mid-to-late 1990s 
            models (3000GT/GTO, Colt, Eclipse, Galant, Lancer, Mirage, Montero/Pajero, Shogun, Space Wagon) used basic 
            Texas 4C (ID4C) transponders, with some European models (Carisma) adopting Philips ID73. Around 2000, the 
            lineup transitioned to Texas Crypto 4D technology with multiple variants (ID60, ID61, ID62, ID64) used across 
            different models and regions (Challenger, Colt, Eclipse, Galant, L200/Triton, Lancer, Montero/Pajero, 
            Outlander, Shogun, Space Wagon). From 2004-2006 onwards, Mitsubishi adopted Philips Crypto 2 (ID46) across 
            their entire lineup including sedans (380, Galant, Lancer), SUVs (ASX, Montero/Pajero, Outlander, Shogun), 
            trucks (L200/Triton), and compacts (Colt, Eclipse, Mirage). Modern 2015+ vehicles use advanced Philips 
            Crypto 3 (ID52/ID47) technology (ASX, L200/Triton, Mirage, Montero/Pajero, Shogun), representing 
            state-of-the-art security. The Montero/Pajero and Shogun demonstrate complete evolution through all four 
            generations from 1996 to present.
          </p>
        </div>
      </div>
    </div>
  );
}
