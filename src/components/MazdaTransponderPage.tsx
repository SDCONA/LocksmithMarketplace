import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface MazdaTransponderPageProps {
  onBack: () => void;
}

const mazdaTransponderData = [
  { model: "Mazda 121", years: "1996–2001", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda 2", years: "2003–2007", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda 2", years: "2007–2014", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda 2", years: "2014+", transponder: "Hitag Pro (ID47)", oemKey: "—" },
  { model: "Mazda 3", years: "2003–2007", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda 3", years: "2007–2013", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Mazda 3", years: "2013–2018", transponder: "Hitag Pro (ID47)", oemKey: "—" },
  { model: "Mazda 3", years: "2019+", transponder: "Hitag AES", oemKey: "—" },
  { model: "Mazda 323", years: "1995–1997", transponder: "Temic 12 (ID12)", oemKey: "—" },
  { model: "Mazda 323", years: "1997–1999", transponder: "Philips 33 / Temic 12", oemKey: "—" },
  { model: "Mazda 323", years: "1999–2003", transponder: "Temic Crypto 8C", oemKey: "—" },
  { model: "Mazda 5", years: "2006–2015", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda 6", years: "2003–2006", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda 6", years: "2006–2011", transponder: "Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda 6", years: "2008–2013", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Mazda 6", years: "2012–2019", transponder: "Hitag Pro (ID47)", oemKey: "—" },
  { model: "Mazda 6", years: "2019+", transponder: "Hitag AES", oemKey: "—" },
  { model: "Mazda 626", years: "1997–1999", transponder: "Philips 33 / Temic 12", oemKey: "—" },
  { model: "Mazda 626", years: "1999–2002", transponder: "Temic Crypto 8C", oemKey: "—" },
  { model: "Mazda B2500", years: "1998–2001", transponder: "Temic Crypto 8C / Texas 4C", oemKey: "—" },
  { model: "Mazda B2500", years: "2001–2006", transponder: "Temic Crypto 8C / Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda B2600", years: "1999–2001", transponder: "Temic Crypto 8C / Texas 4C", oemKey: "—" },
  { model: "Mazda B2600", years: "2001–2006", transponder: "Temic Crypto 8C / Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda B3000", years: "1999–2001", transponder: "Temic Crypto 8C / Texas 4C", oemKey: "—" },
  { model: "Mazda B3000", years: "2001–2006", transponder: "Temic Crypto 8C / Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda B4000", years: "1999–2001", transponder: "Temic Crypto 8C / Texas 4C", oemKey: "—" },
  { model: "Mazda B4000", years: "2001–2006", transponder: "Temic Crypto 8C / Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda Bounty", years: "1999–2001", transponder: "Temic Crypto 8C / Texas 4C", oemKey: "—" },
  { model: "Mazda Bounty", years: "2001–2006", transponder: "Temic Crypto 8C / Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda Bravo", years: "1999–2001", transponder: "Temic Crypto 8C / Texas 4C", oemKey: "—" },
  { model: "Mazda Bravo", years: "2001–2006", transponder: "Temic Crypto 8C / Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda BT-50", years: "2006+", transponder: "Temic Crypto 8C", oemKey: "—" },
  { model: "Mazda CX-3", years: "2014–2021", transponder: "Hitag Pro (ID47)", oemKey: "—" },
  { model: "Mazda CX-30", years: "2020+", transponder: "Hitag AES", oemKey: "—" },
  { model: "Mazda CX-5", years: "2012–2019", transponder: "Hitag Pro (ID47)", oemKey: "—" },
  { model: "Mazda CX-5", years: "2019+", transponder: "Hitag AES", oemKey: "—" },
  { model: "Mazda CX-7", years: "2006–2013", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Mazda CX-9", years: "2006–2015", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Mazda CX-9", years: "2015–2019", transponder: "Hitag Pro (ID47)", oemKey: "—" },
  { model: "Mazda CX-9", years: "2020+", transponder: "Hitag AES", oemKey: "—" },
  { model: "Mazda Magnum", years: "1999–2001", transponder: "Temic Crypto 8C / Texas 4C", oemKey: "—" },
  { model: "Mazda Magnum", years: "2001–2006", transponder: "Temic Crypto 8C / Texas Crypto 4D (ID63)", oemKey: "—" },
  { model: "Mazda Miata", years: "2001–2005", transponder: "Temic Crypto 8C", oemKey: "—" },
  { model: "Mazda Miata", years: "2006–2015", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Mazda Miata", years: "2016–2019", transponder: "Hitag Pro (ID47)", oemKey: "—" },
  { model: "Mazda Miata", years: "2020+", transponder: "Hitag AES", oemKey: "—" },
  { model: "Mazda MPV", years: "1999–2006", transponder: "Temic Crypto 8C", oemKey: "—" },
  { model: "Mazda MX-3", years: "1995–1998", transponder: "Temic 12 (ID12)", oemKey: "—" },
  { model: "Mazda MX-5", years: "1995–1998", transponder: "Temic 12 (ID12)", oemKey: "—" },
  { model: "Mazda MX-5", years: "1999–2000", transponder: "Philips 33 (ID33)", oemKey: "—" },
  { model: "Mazda MX-5", years: "2001–2005", transponder: "Temic Crypto 8C", oemKey: "—" },
  { model: "Mazda MX-5", years: "2006–2015", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Mazda MX-5", years: "2016+", transponder: "Hitag Pro (ID47)", oemKey: "—" },
  { model: "Mazda MX-6", years: "1995–1997", transponder: "Temic 12 (ID12)", oemKey: "—" },
  { model: "Mazda Premacy", years: "1999–2005", transponder: "Temic Crypto 8C", oemKey: "—" },
  { model: "Mazda Proceed", years: "1999–2001", transponder: "Temic Crypto 8C / Texas 4C", oemKey: "—" },
  { model: "Mazda RX-8", years: "2003–2012", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Mazda Tribute", years: "2000–2006", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Mazda Tribute", years: "2007–2011", transponder: "Texas Crypto DST80 (ID63-6F, 80-bit)", oemKey: "—" },
  { model: "Mazda Xedos 6", years: "1995–1999", transponder: "Temic 12 (ID12)", oemKey: "—" },
  { model: "Mazda Xedos 9", years: "1995–2003", transponder: "Temic 12 (ID12)", oemKey: "—" },
];

export function MazdaTransponderPage({ onBack }: MazdaTransponderPageProps) {
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
              <h1 className="text-gray-900">Mazda Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Mazda vehicles
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
                {mazdaTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Mazda vehicles demonstrate a comprehensive six-generation transponder evolution 
            reflecting Japanese engineering innovation. Mid-1990s models (323, MX-3, MX-5, MX-6, Xedos) used basic 
            Temic 12 (ID12) transponders. Late 1990s saw brief use of Philips 33 alongside Temic 12 before transitioning 
            to Temic Crypto 8C (widely used 1999-2006 across MPV, Premacy, Miata, and truck models). Early 2000s 
            introduced Texas Crypto 4D (ID63) for mainstream models (121, 2, 3, 5, 6). Mid-to-late 2000s brought Texas 
            Crypto DST80 (80-bit) technology for performance and crossover models (CX-7, CX-9, RX-8, Miata, MX-5, 
            Tribute). From 2012 onwards, Mazda adopted Hitag Pro (ID47) across refreshed lineups (3, 6, CX-3, CX-5, 
            CX-9). Modern 2019+ vehicles use advanced Hitag AES encryption (Mazda 3, 6, CX-30, CX-5, CX-9, Miata), 
            representing state-of-the-art security. The MX-5/Miata demonstrates the complete evolution through all six 
            generations from 1995 to present. Truck models (B-series, Bounty, Bravo, Magnum, BT-50) uniquely showed 
            dual compatibility between Temic and Texas transponders during transition periods.
          </p>
        </div>
      </div>
    </div>
  );
}
