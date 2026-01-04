import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface CadillacTransponderPageProps {
  onBack: () => void;
}

const cadillacTransponderData = [
  { model: "Cadillac Allante", years: "1989–1993", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Cadillac ATS", years: "2013–2014", transponder: "ID46E / Hitag2 Extended", oemKey: "NBG009768T / 22856930 / 5931856" },
  { model: "Cadillac ATS", years: "2015–2019", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ2AB / 13510253 / 13598506" },
  { model: "Cadillac BLS", years: "2006–2009", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Cadillac Brougham", years: "1993–1996", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Cadillac Catera", years: "1997–2000", transponder: "TP01 / TP05 / ID33 fixed", oemKey: "—" },
  { model: "Cadillac Catera", years: "2000–2001", transponder: "TP09 / ID40", oemKey: "—" },
  { model: "Cadillac Concours", years: "1994–1998", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Cadillac CTS", years: "2003–2007", transponder: "TP05 / ID13 fixed OR TP08 / ID48 crypto", oemKey: "—" },
  { model: "Cadillac CTS", years: "2008–2014", transponder: "ID46E / Hitag2 Extended", oemKey: "M3N5WY7777A / 25943676" },
  { model: "Cadillac CTS", years: "2014–2019", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ2AB / 13598537 / 13589986" },
  { model: "Cadillac CT6", years: "2016–2020", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ2EB / 13594022 / 13510236" },
  { model: "Cadillac DeVille", years: "1991–1999", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Cadillac DeVille", years: "2000–2005", transponder: "TP05 / ID13 fixed", oemKey: "—" },
  { model: "Cadillac DTS", years: "2006–2011", transponder: "ID46E / Hitag2 Extended", oemKey: "22889449 / 22889450" },
  { model: "Cadillac Eldorado", years: "1989–2003", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Cadillac ELR", years: "2014, 2016", transponder: "ID46E / Hitag2 Extended", oemKey: "NBG009768T / 22856930" },
  { model: "Cadillac Escalade", years: "1999–2006", transponder: "PassLock", oemKey: "—" },
  { model: "Cadillac Escalade", years: "2006–2014", transponder: "ID46 Hitag2 OR ID46E Extended", oemKey: "—" },
  { model: "Cadillac Escalade", years: "2015–2020", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ2AB / 13510242 / 13580812" },
  { model: "Cadillac Escalade", years: "2021+", transponder: "Hitag Pro", oemKey: "YG0G20TB1 / 13546300" },
  { model: "Cadillac Seville", years: "1989–1998", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Cadillac Seville", years: "1998–2005", transponder: "TP05 / ID13 fixed", oemKey: "—" },
  { model: "Cadillac SRX", years: "2004–2006", transponder: "TP08 / ID48 crypto", oemKey: "—" },
  { model: "Cadillac SRX", years: "2007", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Cadillac SRX", years: "2007–2014", transponder: "ID46E / Hitag2 Extended", oemKey: "20998281 / 20998282" },
  { model: "Cadillac SRX", years: "2014–2016", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ2AB / 13598525" },
  { model: "Cadillac STS", years: "2005–2007", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Cadillac STS", years: "2008–2011", transponder: "ID46E / Hitag2 Extended", oemKey: "M3N5WY7777A / 25943676" },
  { model: "Cadillac XLR", years: "2004–2009", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Cadillac XTS", years: "2013–2014", transponder: "ID46E / Hitag2 Extended", oemKey: "NBG009768T / 22856930" },
  { model: "Cadillac XTS", years: "2015–2019", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ2AB / 13598537" },
  { model: "Cadillac XT4", years: "2019–2021", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ2EB / 13522879" },
  { model: "Cadillac XT5", years: "2017–2021", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ2EB / 13510245" },
  { model: "Cadillac XT6", years: "2020–2021", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ2EB / 13522879" },
];

export function CadillacTransponderPage({ onBack }: CadillacTransponderPageProps) {
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
              <h1 className="text-gray-900">Cadillac Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Cadillac vehicles
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
                {cadillacTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Older Cadillac models (1989–early 2000s) used VATS/PassKey resistor systems. 
            Modern Cadillac vehicles primarily use ID46E transponders with Hitag2 Extended technology. 
            OEM key numbers are provided where available for reference.
          </p>
        </div>
      </div>
    </div>
  );
}
