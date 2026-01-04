import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface RenaultTransponderPageProps {
  onBack: () => void;
}

const renaultTransponderData = [
  { model: "Renault Arkana", years: "2019–", transponder: "Hitag AES", oemKey: "KeyCard: 285977147R (KR5IK4CH-01)" },
  { model: "Renault Avantime", years: "2003–2009", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Renault Captur I", years: "2013–2019", transponder: "Hitag AES (ID4A)", oemKey: "KeyCard: 285974100R / 285971998R" },
  { model: "Renault Captur II", years: "2019–", transponder: "Hitag AES", oemKey: "KeyCard: 285977147R" },
  { model: "Renault Clio I", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Clio II", years: "1998–2001", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Clio II", years: "2001–2012", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Clio III", years: "2006–2012", transponder: "Hitag 2", oemKey: "Key: 7701209236 / KeyCard: 7701209137" },
  { model: "Renault Clio IV", years: "2012–2019", transponder: "Hitag AES (ID4A)", oemKey: "KeyCard: 285974100R / 285971998R" },
  { model: "Renault Clio V", years: "2019–", transponder: "Hitag AES", oemKey: "KeyCard: 285977147R" },
  { model: "Renault Espace III", years: "1997–2002", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Espace IV", years: "2002–2014", transponder: "Hitag 2", oemKey: "KeyCard: 285971005R" },
  { model: "Renault Espace V", years: "2015–", transponder: "Hitag AES", oemKey: "KeyCard: 285977147R" },
  { model: "Renault Fluence", years: "2009–2016", transponder: "Hitag 2", oemKey: "KeyCard: 285975779R" },
  { model: "Renault Kadjar", years: "2015–", transponder: "Hitag AES", oemKey: "Key / KeyCard" },
  { model: "Renault Kangoo", years: "1997–2002", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Kangoo", years: "2002–2010", transponder: "Hitag 2", oemKey: "8200008231" },
  { model: "Renault Kangoo", years: "2009–2017", transponder: "Hitag 2", oemKey: "7701209236" },
  { model: "Renault Koleos", years: "2007–2015", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Koleos II", years: "2016–", transponder: "Hitag AES", oemKey: "KeyCard: 285C70175R" },
  { model: "Renault Laguna", years: "1995–2000", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Laguna", years: "1999–2000", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Renault Laguna II", years: "2001–2007", transponder: "Hitag 2", oemKey: "KeyCard" },
  { model: "Renault Laguna III", years: "2007–2015", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Latitude", years: "2010–2015", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Mascott", years: "1999–2002", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Mascott", years: "2002–2010", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Master", years: "1998–2002", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Master", years: "2002–2010", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Master", years: "2011–2014", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Master", years: "2014–2018", transponder: "Hitag AES", oemKey: "—" },
  { model: "Renault Megane", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Megane", years: "1998–2000", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Renault Megane", years: "2000–2003", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Renault Megane II", years: "2002–2009", transponder: "Hitag 2", oemKey: "KeyCard" },
  { model: "Renault Megane III", years: "2008–2016", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Megane IV", years: "2016–", transponder: "Hitag AES", oemKey: "KeyCard" },
  { model: "Renault Modus", years: "2004–2012", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Safrane", years: "1995–2000", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Scenic I", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Scenic I", years: "1998–2000", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Renault Scenic I", years: "2000–2003", transponder: "Texas Crypto 4D", oemKey: "—" },
  { model: "Renault Scenic II", years: "2003–2009", transponder: "Hitag 2", oemKey: "KeyCard" },
  { model: "Renault Scenic III", years: "2009–2016", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Scenic IV", years: "2016–", transponder: "Hitag AES", oemKey: "KeyCard" },
  { model: "Renault Symbol", years: "1999–2001", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Symbol", years: "2001–2008", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Symbol", years: "2008–2012", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Symbol", years: "2012–2019", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Renault Talisman", years: "2015–", transponder: "Hitag AES", oemKey: "KeyCard" },
  { model: "Renault Thalia", years: "2001–2008", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Thalia", years: "2008–2013", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Trafic II", years: "2001–2014", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Trafic III", years: "2014–2019", transponder: "Hitag AES", oemKey: "—" },
  { model: "Renault Twingo", years: "1995–2001", transponder: "Philips ID33", oemKey: "—" },
  { model: "Renault Twingo", years: "2001–2007", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Twingo II", years: "2007–2014", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Twingo III", years: "2014–2022", transponder: "Hitag AES", oemKey: "—" },
  { model: "Renault Twizy", years: "2012–", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Wind", years: "2010–2013", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Vel Satis", years: "2001–2009", transponder: "Hitag 2", oemKey: "KeyCard" },
  { model: "Renault Zoe", years: "2012–2018", transponder: "Hitag 2", oemKey: "KeyCard" },
  { model: "Renault Zoe", years: "2019–", transponder: "Hitag AES", oemKey: "—" },
  { model: "Renault Magnum", years: "2000–2003", transponder: "Megamos 13", oemKey: "—" },
  { model: "Renault Magnum", years: "2004–", transponder: "Hitag 2 (ID46)", oemKey: "—" },
  { model: "Renault Maxity", years: "2007–2014", transponder: "Hitag 2", oemKey: "—" },
  { model: "Renault Midlum", years: "2002–2006", transponder: "Megamos 13", oemKey: "—" },
  { model: "Renault Midlum", years: "2006–", transponder: "Hitag 2 (ID46)", oemKey: "—" },
  { model: "Renault Premium", years: "2001–2006", transponder: "Megamos 13", oemKey: "—" },
  { model: "Renault Premium", years: "2006–", transponder: "Hitag 2 (ID46)", oemKey: "—" },
];

export function RenaultTransponderPage({ onBack }: RenaultTransponderPageProps) {
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
              <h1 className="text-gray-900">Renault Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Renault vehicles
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
                {renaultTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Renault vehicles (part of Renault-Nissan-Mitsubishi Alliance) demonstrate a 
            comprehensive four-generation transponder evolution with pioneering KeyCard technology. Mid-1990s models 
            (Clio I/II, Espace III, Kangoo, Laguna, Master, Megane, Safrane, Scenic I, Symbol, Twingo) used basic 
            Philips ID33 transponders. Late 1990s to early 2000s saw adoption of Texas Crypto 4D (ID60) technology 
            across select models (Avantime, Laguna, Megane, Scenic I). Commercial trucks (Magnum, Midlum, Premium) 
            uniquely used Megamos 13 transponders in early 2000s. From 2001-2016, Renault pioneered industry-leading 
            Hitag 2 technology with extensive KeyCard implementation across the entire lineup including small cars 
            (Clio II/III, Modus, Symbol, Thalia, Twingo, Twizy, Wind), compacts (Megane II/III, Scenic II/III), 
            mid-size (Fluence, Laguna II/III, Latitude), large (Espace IV, Vel Satis), crossovers (Koleos), EVs 
            (Twizy, Zoe), and commercial vehicles (Kangoo, Mascott, Master, Maxity, Trafic II). Renault's innovative 
            KeyCard system revolutionized automotive key technology with card-shaped keys featuring integrated 
            transponders and remote functions. Modern 2012+ vehicles across the lineup use advanced Hitag AES (ID4A) 
            encryption with continued KeyCard evolution (Arkana, Captur, Clio IV/V, Espace V, Kadjar, Koleos II, 
            Master, Megane IV, Scenic IV, Symbol, Talisman, Trafic III, Twingo III, Zoe). Renault stands out for 
            comprehensive OEM KeyCard documentation making locksmith work highly precise.
          </p>
        </div>
      </div>
    </div>
  );
}
