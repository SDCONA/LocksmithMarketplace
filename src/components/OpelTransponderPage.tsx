import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface OpelTransponderPageProps {
  onBack: () => void;
}

const opelTransponderData = [
  { model: "Opel Adam", years: "2012–2019", transponder: "Hitag AES (PCF7961M / PCF7939M)", oemKey: "5WK50079, 13279278, 13401827" },
  { model: "Opel Agila", years: "2000–2007", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Agila", years: "2008–2014", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "Opel Ampera", years: "2012–2014", transponder: "Hitag-2 Extended (ID46E)", oemKey: "22822309, 22822304" },
  { model: "Opel Antara", years: "2006–2017", transponder: "Philips Crypto 2 (ID46)", oemKey: "93191008, 93186345" },
  { model: "Opel Astra", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Opel Astra", years: "1998–2004", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Astra", years: "2004–2010", transponder: "Hitag 2 (ID46)", oemKey: "13387370, 93178494" },
  { model: "Opel Astra", years: "2010–2016", transponder: "Hitag-2 Extended (ID46E)", oemKey: "13500235, 13584834" },
  { model: "Opel Astra", years: "2016–", transponder: "Hitag-2 Extended (ID46E)", oemKey: "13508410, 39061436" },
  { model: "Opel Calibra", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Opel Cascada", years: "2013–2019", transponder: "Hitag-2 Extended (ID46E)", oemKey: "13500235, 13584834" },
  { model: "Opel Combo", years: "1997–2002", transponder: "Philips ID33", oemKey: "—" },
  { model: "Opel Combo", years: "2002–2011", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Combo", years: "2012–2018", transponder: "Hitag 2 (ID46)", oemKey: "95599624, 95599623" },
  { model: "Opel Corsa", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Opel Corsa", years: "1999–2006", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Corsa", years: "2006–2014", transponder: "Hitag 2 (ID46)", oemKey: "95507070, 95507074" },
  { model: "Opel Corsa", years: "2014–2019", transponder: "Hitag AES (PCF7961M / PCF7939M)", oemKey: "13482240, 42495044" },
  { model: "Opel Crossland", years: "2017–", transponder: "Hitag AES (PCF7953M)", oemKey: "3643800, 98161688" },
  { model: "Opel Frontera", years: "1996–1998", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Opel Frontera", years: "1998–2004", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Opel Insignia", years: "2009–2017", transponder: "Hitag AES (PCF7961M / PCF7939M)", oemKey: "13279280, 13524255" },
  { model: "Opel Insignia", years: "2017–2021", transponder: "Hitag AES (PCF7961M / PCF7939M)", oemKey: "13511627" },
  { model: "Opel Grandland", years: "2017–", transponder: "Hitag AES (PCF7953M)", oemKey: "3643800, 98161688" },
  { model: "Opel GT", years: "2007–2009", transponder: "Hitag 2 (ID46)", oemKey: "—" },
  { model: "Opel Karl", years: "2014–2019", transponder: "Hitag AES (PCF7961M / PCF7939M)", oemKey: "5WK50079, 13404602" },
  { model: "Opel Meriva", years: "2003–2010", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Meriva", years: "2010–2017", transponder: "Hitag 2 (ID46)", oemKey: "95507074, 95507072" },
  { model: "Opel Mokka", years: "2012–2016", transponder: "Hitag-2 Extended (ID46E)", oemKey: "13279280, 13524255" },
  { model: "Opel Mokka", years: "2016–2019", transponder: "Hitag AES (PCF7961M / PCF7939M)", oemKey: "—" },
  { model: "Opel Movano", years: "1998–2003", transponder: "Philips ID33", oemKey: "—" },
  { model: "Opel Movano", years: "2003–2010", transponder: "Hitag 2 (ID46)", oemKey: "—" },
  { model: "Opel Movano", years: "2010–2014", transponder: "Hitag 2 (ID46)", oemKey: "93854560" },
  { model: "Opel Movano", years: "2014–2019", transponder: "Hitag 2 (ID46) / Hitag AES", oemKey: "—" },
  { model: "Opel Omega", years: "1995–1999", transponder: "Philips ID33", oemKey: "—" },
  { model: "Opel Omega", years: "1999–2003", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Signum", years: "2003–2008", transponder: "Hitag 2 (ID46)", oemKey: "93187530, 93187531" },
  { model: "Opel Sintra", years: "1996–1999", transponder: "Philips ID33", oemKey: "—" },
  { model: "Opel Speedster", years: "2001–2005", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Tigra", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Opel Tigra", years: "1999–2002", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Tigra B", years: "2004–2009", transponder: "ID40 (PCF7935, precoded)", oemKey: "13213588" },
  { model: "Opel Vectra", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Opel Vectra", years: "1999–2004", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Vectra C", years: "2002–2008", transponder: "Hitag 2 (ID46)", oemKey: "13189108, 93186345" },
  { model: "Opel Vivaro", years: "2001–2014", transponder: "Hitag 2 (ID46)", oemKey: "91167009" },
  { model: "Opel Vivaro", years: "2014–2019", transponder: "Hitag AES (PCF7961M / PCF7939M)", oemKey: "93868095" },
  { model: "Opel Zafira", years: "1999–2005", transponder: "ID40 (PCF7935, precoded)", oemKey: "—" },
  { model: "Opel Zafira", years: "2006–2013", transponder: "Hitag 2 (ID46)", oemKey: "91167009" },
  { model: "Opel Zafira", years: "2014–2019", transponder: "Hitag AES (PCF7961M / PCF7939M)", oemKey: "93868095" },
];

export function OpelTransponderPage({ onBack }: OpelTransponderPageProps) {
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
              <h1 className="text-gray-900">Opel Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Opel vehicles
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
                {opelTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Opel vehicles (part of General Motors/Stellantis) demonstrate a comprehensive 
            six-generation transponder evolution with extensive OEM key documentation. Mid-1990s models (Astra, 
            Calibra, Combo, Corsa, Omega, Sintra, Tigra, Vectra) used basic Philips ID33 transponders. Frontera 
            uniquely used Megamos 13 (ID13) and later Megamos Crypto 48 (ID48). Late 1990s to early 2000s saw 
            widespread adoption of ID40 (PCF7935, precoded) across the entire lineup including Agila, Astra, Combo, 
            Corsa, Meriva, Omega, Speedster, Tigra, Vectra, and Zafira. From 2001-2010, the lineup transitioned to 
            Hitag 2 (ID46) technology with comprehensive OEM key numbers documented (Astra, Combo, Corsa, GT, Meriva, 
            Movano, Signum, Vectra C, Vivaro, Zafira). Around 2010, select models adopted Hitag-2 Extended (ID46E) 
            as an intermediate step (Ampera, Astra, Cascada, Mokka). Modern 2012+ vehicles use advanced Hitag AES 
            encryption with multiple chip variants (PCF7961M, PCF7939M, PCF7953M) across the lineup including Adam, 
            Corsa, Crossland, Grandland, Insignia, Karl, Mokka, Vivaro, and Zafira. Opel stands out for documenting 
            specific OEM key part numbers extensively, making locksmith work more precise. The Astra demonstrates 
            complete evolution through all six generations from 1995 to present.
          </p>
        </div>
      </div>
    </div>
  );
}
