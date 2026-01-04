import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface LincolnTransponderPageProps {
  onBack: () => void;
}

const lincolnTransponderData = [
  { model: "Lincoln Aviator", years: "2003–2006", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Lincoln Aviator", years: "2020+", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln Blackwood", years: "2002–2003", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lincoln Continental", years: "1998–2002", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lincoln Continental", years: "2016–2020", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln Corsair", years: "2019–2022", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln LS", years: "2000–2002", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Lincoln LS", years: "2003–2006", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Lincoln Mark LT", years: "2005–2008", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Lincoln Mark LT", years: "2010–2014", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Lincoln MKC", years: "2014–2016", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln MKC", years: "2017+", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln MKS", years: "2009–2013", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Lincoln MKS", years: "2013–2016", transponder: "Hitag 2+ (ID46)", oemKey: "—" },
  { model: "Lincoln MKT", years: "2009–2013", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Lincoln MKT", years: "2013–2019", transponder: "Hitag 2+ (ID46)", oemKey: "—" },
  { model: "Lincoln MKX", years: "2007–2010", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Lincoln MKX", years: "2010–2013", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Lincoln MKX", years: "2013–2015", transponder: "Hitag 2+ (ID46)", oemKey: "—" },
  { model: "Lincoln MKX", years: "2016+", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln MKZ", years: "2007–2009", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Lincoln MKZ", years: "2010–2012", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Lincoln MKZ", years: "2013–2016", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln MKZ", years: "2017+", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln Navigator", years: "1997–2002", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lincoln Navigator", years: "2002–2009", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Lincoln Navigator", years: "2010–2013", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Lincoln Navigator", years: "2013–2017", transponder: "Hitag 2+ (ID46)", oemKey: "—" },
  { model: "Lincoln Navigator", years: "2017+", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln Nautilus", years: "2018–2022", transponder: "HiTAG Pro 128-bit (ID47 / ~ID49)", oemKey: "—" },
  { model: "Lincoln Town Car", years: "1998–2003", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lincoln Town Car", years: "2003–2011", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
];

export function LincolnTransponderPage({ onBack }: LincolnTransponderPageProps) {
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
              <h1 className="text-gray-900">Lincoln Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Lincoln vehicles
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
                {lincolnTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Lincoln vehicles demonstrate a comprehensive five-generation transponder evolution 
            reflecting Ford Motor Company's luxury division advancement. Late 1990s to early 2000s models (Continental, 
            Navigator, Town Car, Blackwood) used basic Texas 4C (ID4C) transponders. The early-to-mid 2000s saw 
            transition to Texas Crypto 4D technology, with early LS models using ID60 before the lineup standardized 
            on ID63. Around 2010, the MK-series models adopted Texas Crypto DST80 (80-bit) technology. By 2013, many 
            models transitioned to Hitag 2+ (ID46) as an intermediate step. Modern Lincoln vehicles (2014+) including 
            MKC, MKZ, revived Continental, new Aviator, Corsair, Nautilus, and Navigator have adopted advanced HiTAG 
            Pro 128-bit (ID47/ID49) encryption, representing state-of-the-art automotive security for the luxury 
            segment. The Navigator demonstrates the complete evolution through all five generations from 1997 to present.
          </p>
        </div>
      </div>
    </div>
  );
}
