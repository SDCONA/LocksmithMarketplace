import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface NissanTransponderPageProps {
  onBack: () => void;
}

const nissanTransponderData = [
  { model: "Nissan 350Z", years: "2003–2009", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan 350Z USA", years: "2003–2009", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan 370Z", years: "2009–2018", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Almera", years: "1999–2000", transponder: "Philips Crypto (ID41)", oemKey: "—" },
  { model: "Nissan Almera", years: "2000–2003", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Almera", years: "2003–2006", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Almera", years: "2011–", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Almera Tino", years: "2000–2003", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Almera Tino", years: "2004–2006", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Altima", years: "2002–2006", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Altima", years: "2007–2013", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Altima", years: "2013–2018", transponder: "Philips Crypto 3 (ID47)", oemKey: "—" },
  { model: "Nissan Altima", years: "2019–2021", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Armada", years: "2004–2008", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Armada", years: "2008–2015", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Armada", years: "2016–", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Cefiro", years: "2000–2003", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Cube", years: "2009–2014", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Frontier", years: "2002–2005", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Frontier", years: "2005–", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan GT-R", years: "2009–2020", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Interstar", years: "1998–2003", transponder: "Philips ID33", oemKey: "—" },
  { model: "Nissan Interstar", years: "2003–2010", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Juke", years: "2010–2017", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Kicks", years: "2018–2021", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Kubistar", years: "2002–2008", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Laurel", years: "1999–2000", transponder: "Philips Crypto (ID41)", oemKey: "—" },
  { model: "Nissan Laurel", years: "2000–2002", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Nissan Leaf", years: "2011–2017", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Leaf", years: "2017–2020", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Livina", years: "2007–", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Maxima", years: "1995–2000", transponder: "Philips ID33", oemKey: "—" },
  { model: "Nissan Maxima", years: "1999–2003", transponder: "Texas Crypto 4D / Philips Crypto", oemKey: "—" },
  { model: "Nissan Maxima", years: "2004–2008", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Maxima", years: "2008–2014", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Maxima", years: "2013–2015", transponder: "Philips Crypto 3 (ID47)", oemKey: "—" },
  { model: "Nissan Maxima", years: "2016–2020", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Micra", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Nissan Micra", years: "1998–2000", transponder: "Philips Crypto (ID41)", oemKey: "—" },
  { model: "Nissan Micra", years: "2000–2003", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Micra", years: "2003–2016", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Micra", years: "2016–", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Murano", years: "2003–2006", transponder: "Philips Crypto 2 / Texas 4D", oemKey: "—" },
  { model: "Nissan Murano", years: "2005–2014", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Murano", years: "2014–2020", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Navara", years: "2000–2003", transponder: "Philips Crypto (ID41)", oemKey: "—" },
  { model: "Nissan Navara", years: "2003–2005", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Navara", years: "2005–2015", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Navara", years: "2015–", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Note", years: "2006–2012", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Note", years: "2013–", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Pathfinder", years: "1999–2005", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Pathfinder", years: "2005–2012", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Pathfinder", years: "2013–2020", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Patrol", years: "1998–2003", transponder: "Philips Crypto (ID41)", oemKey: "—" },
  { model: "Nissan Patrol", years: "2003–2006", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Patrol", years: "2006–", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Primera", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Nissan Primera", years: "1998–2000", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Primera", years: "2000–2002", transponder: "Philips Crypto (ID41)", oemKey: "—" },
  { model: "Nissan Primera", years: "2002–2008", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Qashqai", years: "2007–2013", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Qashqai", years: "2014–2020", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Rogue", years: "2008–2015", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Rogue", years: "2014–2021", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Sentra", years: "2000–2006", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Nissan Sentra", years: "2007–2017", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Sentra", years: "2017–2020", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Titan", years: "2004–2015", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Titan", years: "2016–2020", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan Versa", years: "2007–2019", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Nissan Versa", years: "2020–", transponder: "Hitag AES (ID4A)", oemKey: "—" },
  { model: "Nissan X-Trail", years: "2001–2006", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
];

export function NissanTransponderPage({ onBack }: NissanTransponderPageProps) {
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
              <h1 className="text-gray-900">Nissan Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Nissan vehicles
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
                {nissanTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Nissan vehicles demonstrate a comprehensive five-generation transponder evolution 
            reflecting Japanese engineering innovation and global market adaptation. Mid-1990s models (Maxima, Micra, 
            Primera) used basic Philips ID33 transponders. Late 1990s to early 2000s saw adoption of Philips Crypto 
            (ID41) across multiple models (Almera, Laurel, Micra, Navara, Patrol, Primera). From 1999-2006, many 
            models transitioned to Texas Crypto 4D (ID60) technology (350Z, Almera, Altima, Cefiro, Frontier, Maxima, 
            Micra, Navara, Pathfinder, Patrol, Primera, Sentra, X-Trail). The 2003-2006+ era brought widespread adoption 
            of Philips Crypto 2 (ID46) across nearly the entire lineup including sedans (Altima, Maxima, Sentra), SUVs 
            (Armada, Juke, Murano, Pathfinder, Qashqai, Rogue), trucks (Frontier, Navara, Titan), sports cars (350Z USA, 
            370Z, GT-R), compacts (Almera, Cube, Micra, Note, Versa), EVs (Leaf), and vans (Interstar, Kubistar). Around 
            2013-2015, select models adopted Philips Crypto 3 (ID47) as an intermediate step (Altima, Maxima). Modern 
            2016+ vehicles use advanced Hitag AES (ID4A) encryption across refreshed lineups (Altima, Kicks, Leaf, Maxima, 
            Micra, Murano, Note, Pathfinder, Qashqai, Rogue, Sentra, Titan, Versa), representing state-of-the-art security. 
            The Maxima and Micra demonstrate complete evolution through all five generations from 1995 to present.
          </p>
        </div>
      </div>
    </div>
  );
}
