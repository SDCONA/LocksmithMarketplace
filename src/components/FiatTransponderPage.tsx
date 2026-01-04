import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface FiatTransponderPageProps {
  onBack: () => void;
}

const fiatTransponderData = [
  { model: "Fiat 500", years: "2007–2018", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "71749374, 71776098, 6000626799" },
  { model: "Fiat 500L", years: "2012–2020", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "71752197, 6000626708" },
  { model: "Fiat 500L", years: "2014–2020", transponder: "Megamos AES / ID88", oemKey: "—" },
  { model: "Fiat 500X", years: "2014–2020", transponder: "Megamos AES / ID88 / Philips Crypto 3 / Hitag 3 / ID49", oemKey: "—" },
  { model: "Fiat Albea", years: "2002–2012", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Barchetta", years: "1995–2002", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Brava", years: "1995–1997", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Brava", years: "1997–2001", transponder: "Temic 11 / ID11", oemKey: "—" },
  { model: "Fiat Bravo", years: "1995–1997", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Bravo", years: "1997–2001", transponder: "Megamos 13 / ID13 / Temic 11 / ID11", oemKey: "—" },
  { model: "Fiat Bravo", years: "2007–2014", transponder: "Megamos Crypto 48 / ID48 / Philips Crypto 2 / Hitag 2 / ID46", oemKey: "—" },
  { model: "Cinquecento", years: "1995–1998", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Coupe", years: "1995+", transponder: "Philips ID33 / Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Croma", years: "1996–1997", transponder: "Philips ID33 / Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Croma", years: "2005–2011", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7936", oemKey: "—" },
  { model: "Fiat Doblo", years: "2000–2006", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Doblo", years: "2006–2010", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7936", oemKey: "—" },
  { model: "Fiat Doblo (S.A.)", years: "2006–2011", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Doblo", years: "2010–2018", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "71749374, 71776098" },
  { model: "Fiat Ducato", years: "1996–2002", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Ducato", years: "2002–2008", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Ducato", years: "2008–2020", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "6000627330, 6000628569" },
  { model: "Fiat Egea", years: "2015+", transponder: "Megamos AES / ID88", oemKey: "71778806, 6000626702" },
  { model: "Fiat Fiorino", years: "1996–2000", transponder: "Megamos 13 / ID13 / Temic 11 / ID11", oemKey: "—" },
  { model: "Fiat Fiorino (S.A.)", years: "1996–2008", transponder: "Megamos 13 / ID13 / Temic 11 / ID11", oemKey: "—" },
  { model: "Fiat Fiorino", years: "2007+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "—" },
  { model: "Fiat Freemont", years: "2011+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7945 / PCF7953", oemKey: "56046681AE, M3N-40821302" },
  { model: "Fiat Fullback", years: "2016+", transponder: "Philips Crypto 3 / Hitag 3 / ID49", oemKey: "—" },
  { model: "Grand Siena", years: "2012+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "—" },
  { model: "Grande Punto", years: "2005–2012", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "—" },
  { model: "Fiat Idea", years: "2003–2010", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Idea", years: "2010+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "—" },
  { model: "Fiat Idea (S.A.)", years: "2010+", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Linea", years: "2007–2015", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Marea", years: "1996+", transponder: "Megamos 13 / ID13 / Temic 11 / ID11", oemKey: "—" },
  { model: "Fiat Marengo", years: "1996+", transponder: "Megamos 13 / ID13 / Temic 11 / ID11", oemKey: "—" },
  { model: "Fiat Mille", years: "2005+", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Multipla", years: "1998–2010", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Palio", years: "1996–2001", transponder: "Temic 11 / ID11", oemKey: "—" },
  { model: "Fiat Palio", years: "2002–2007", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Palio", years: "2007+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "—" },
  { model: "Fiat Panda", years: "1995–2002", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Panda", years: "2002+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7936", oemKey: "—" },
  { model: "Fiat Punto", years: "1995–1999", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Punto", years: "1999–2005", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Punto", years: "2006+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "—" },
  { model: "Fiat Punto Evo", years: "2010+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "6000628443, 71749374" },
  { model: "Fiat Qubo", years: "2008–2016", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7946", oemKey: "71765697, 6000629617" },
  { model: "Fiat Scudo", years: "1996–2002", transponder: "Philips ID33 / Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Scudo", years: "2002–2006", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7936", oemKey: "—" },
  { model: "Fiat Scudo", years: "2007+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7941", oemKey: "—" },
  { model: "Fiat Sedici (diesel)", years: "2005–2014", transponder: "Philips Crypto / ID40 / PCF7935", oemKey: "—" },
  { model: "Fiat Sedici (petrol)", years: "2005–2014", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7936", oemKey: "—" },
  { model: "Fiat Seicento", years: "1997–2000", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Seicento", years: "2000–2010", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Siena", years: "1996–2001", transponder: "Temic 11 / ID11 / Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Siena", years: "2002+", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Stilo", years: "2001–2008", transponder: "Megamos Crypto 48 / ID48", oemKey: "—" },
  { model: "Fiat Tempra", years: "1995+", transponder: "Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Tipo", years: "2015+", transponder: "Megamos AES / ID88", oemKey: "71778806, 6000626702" },
  { model: "Fiat Ulysse", years: "1996–2002", transponder: "Philips ID33 / Megamos 13 / ID13", oemKey: "—" },
  { model: "Fiat Ulysse", years: "2002+", transponder: "Philips Crypto 2 / Hitag 2 / ID46 / PCF7941", oemKey: "—" },
  { model: "Fiat Viaggio", years: "2012+", transponder: "Hitag AES / PCF7961M", oemKey: "—" },
];

export function FiatTransponderPage({ onBack }: FiatTransponderPageProps) {
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
              <h1 className="text-gray-900">Fiat Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Fiat vehicles
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
                {fiatTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Fiat has one of the most diverse transponder evolutions in automotive history, 
            starting with basic Megamos 13 (ID13) and Temic 11 (ID11) in the mid-1990s, transitioning to Megamos 
            Crypto 48 (ID48) in the early 2000s, then adopting Philips Crypto 2 / Hitag 2 (ID46) from 2002-2005 onwards. 
            Modern Fiat models (2012+) use advanced Megamos AES (ID88), Philips Crypto 3 / Hitag 3 (ID49), and 
            Hitag AES encryption systems for maximum security.
          </p>
        </div>
      </div>
    </div>
  );
}
