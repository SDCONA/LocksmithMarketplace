import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface YamahaTransponderPageProps {
  onBack: () => void;
}

const yamahaTransponderData = [
  { model: "Yamaha YZF R6", years: "2003–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha YZF R1", years: "2005–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha YVS Drag Star", years: "2003–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha YP 400", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha XVS Drag Star", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha XTX", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha XTR", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha XT 660Z", years: "2008–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha XT 660R", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha XP 500", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha X-MAX 250", years: "2005–2009", transponder: "TEMIC 12 or Megamos 13 (ID13)", oemKey: "—" },
  { model: "Yamaha X-MAX 250", years: "2009–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha X-MAX 125", years: "2006–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha XJR 1300", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha T-MAX 500", years: "2005–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha TDM 900", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha TDM 600", years: "2005–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha Neos", years: "1998–", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Yamaha MT-03", years: "2006–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha MT-01", years: "2005–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha Majesty 400", years: "2005–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha FZS 100 Fazer", years: "2005–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha FZ6", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha FZ1", years: "2006–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha FJR 1300", years: "2005–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha BT 1100 Bulldog", years: "2005–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
  { model: "Yamaha Aerox", years: "1998–", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Yamaha Prad 1000S", years: "2004–", transponder: "Texas Crypto TIRIS 4D ID69 (4D-69)", oemKey: "—" },
];

export function YamahaTransponderPage({ onBack }: YamahaTransponderPageProps) {
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
              <h1 className="text-gray-900">Yamaha Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Yamaha motorcycles
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
                {yamahaTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Yamaha motorcycles (Japanese motorcycle manufacturer, founded 1955, world's 
            second-largest motorcycle producer) demonstrate a remarkably streamlined two-generation transponder 
            evolution with exceptional technology standardization across the entire motorcycle lineup. Late 1990s 
            models (Aerox, Neos from 1998 onwards) used basic Megamos 13 (ID13) transponders representing 
            first-generation immobilizers, establishing early adoption of electronic security in scooter segments. 
            One unique transitional model: X-MAX 250 (2005-2009) offered dual-transponder compatibility with either 
            TEMIC 12 or Megamos 13 (ID13), representing Yamaha's flexible approach during technology transition 
            periods. From 2003-2006, Yamaha implemented a comprehensive industry-wide migration to Texas Instruments 
            Crypto TIRIS 4D ID69 (4D-69) technology, creating the most standardized transponder ecosystem among 
            major motorcycle manufacturers. This single transponder platform covers the vast majority of modern 
            Yamaha motorcycles across all segments: sport bikes (YZF R1, YZF R6), cruisers (YVS/XVS Drag Star, 
            BT 1100 Bulldog), adventure/touring (FJR 1300, TDM 900, TDM 600), naked bikes (FZ1, FZ6, FZS 100 Fazer, 
            MT-01, MT-03, XJR 1300), dual-sport (XT 660R, XT 660Z, XTR, XTX), scooters (Majesty 400, T-MAX 500, 
            X-MAX 125, X-MAX 250 post-2009, XP 500, YP 400), and sport-touring (Prad 1000S). Yamaha's exclusive 
            partnership with Texas Instruments for the TIRIS 4D ID69 technology creates a highly specialized 
            transponder ecosystem distinct from most other motorcycle manufacturers, representing proprietary 
            encryption requiring specific diagnostic and programming equipment. The ID69 designation indicates 
            a Yamaha-specific variant of the Texas Instruments 4D Crypto family, offering enhanced security 
            compared to standard automotive transponders. Locksmiths working with Yamaha motorcycles benefit from 
            this exceptional standardization (single transponder type covering 25+ models from 2003 onwards), 
            though the specialized Texas Crypto TIRIS 4D ID69 technology requires dedicated programming equipment 
            and specific key cutting procedures different from standard automotive transponder systems. This 
            streamlined approach contrasts sharply with automotive manufacturers' complex multi-generation 
            transponder evolution, making Yamaha one of the simplest manufacturers for transponder service once 
            the specialized equipment is obtained.
          </p>
        </div>
      </div>
    </div>
  );
}
