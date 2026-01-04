import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface ChevroletTransponderPageProps {
  onBack: () => void;
}

const chevroletTransponderData = [
  { model: "Chevrolet Agile", years: "2009+", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Astra", years: "2000–2007", transponder: "ID40 / Philips Crypto", oemKey: "—" },
  { model: "Chevrolet Astra", years: "2007+", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Astro Van", years: "1998–2005", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Avalanche", years: "2007–2013", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Aveo", years: "2004–2011", transponder: "TP08 / ID48 OR TP05 / ID13", oemKey: "—" },
  { model: "Chevrolet Aveo", years: "2012+", transponder: "ID46E / Hitag2 Extended", oemKey: "13500218 / 13504196" },
  { model: "Chevrolet Blazer", years: "1998–2005", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Blazer", years: "2019+", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ4EA / 13584514" },
  { model: "Chevrolet Bolt", years: "2016–2020", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ4AA / 13529664" },
  { model: "Chevrolet Camaro", years: "1988–2002", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Chevrolet Camaro", years: "2010–2015", transponder: "ID46E / Hitag2 Extended", oemKey: "5912545 / 23465184" },
  { model: "Chevrolet Camaro", years: "2016–2020", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ4EA / 13508780" },
  { model: "Chevrolet Caprice", years: "1994–1996", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Chevrolet Caprice / PPV", years: "2011–2013", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Caprice / PPV", years: "2014–2017", transponder: "ID46 Hitag2", oemKey: "92271667" },
  { model: "Chevrolet Captiva", years: "2006+", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Cavalier", years: "1996–2005", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet City Express", years: "2014–2018", transponder: "ID46 Hitag2", oemKey: "H0561-C993A" },
  { model: "Chevrolet Cobalt", years: "2004–2010", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Colorado", years: "2003–2008", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Colorado", years: "2008–2012", transponder: "TP08 / ID48 crypto", oemKey: "—" },
  { model: "Chevrolet Corvette", years: "1986–2004", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Chevrolet Corvette", years: "2005–2007", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Corvette", years: "2008–2014", transponder: "ID46 Hitag2+", oemKey: "M3N5WY7777A / 25926479" },
  { model: "Chevrolet Corvette", years: "2015–2019", transponder: "ID46E / Hitag2 Extended", oemKey: "23465955 / NBGGD9C04" },
  { model: "Chevrolet Corvette", years: "2020+", transponder: "Hitag Pro / encrypted", oemKey: "YG0G20TB1 / 13538853" },
  { model: "Chevrolet Cruze", years: "2008–2011", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Cruze", years: "2011–2016", transponder: "ID46E / Hitag2 Extended", oemKey: "13500318 / 5921872" },
  { model: "Chevrolet Cruze", years: "2016–2019", transponder: "ID46E / Hitag2 Extended", oemKey: "13529661 / 13529660" },
  { model: "Chevrolet Epica", years: "2004–2007", transponder: "TP05 / ID13 fixed", oemKey: "—" },
  { model: "Chevrolet Equinox", years: "2006–2010", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Equinox", years: "2010–2017", transponder: "ID46E / Hitag2 Extended", oemKey: "OHT01060512 / 20873621" },
  { model: "Chevrolet Equinox", years: "2018–2021", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ4AA / 13529665" },
  { model: "Chevrolet Espero", years: "1995+", transponder: "TP05 / ID13 fixed", oemKey: "—" },
  { model: "Chevrolet Evanda", years: "2003–2006", transponder: "TP19 / Texas 4D", oemKey: "—" },
  { model: "Chevrolet Express", years: "1998–2007", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Express", years: "2008–2019", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet HHR", years: "2005–2011", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Impala", years: "1995–1996", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Chevrolet Impala", years: "2000–2005", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Impala", years: "2006–2014", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Impala", years: "2014–2020", transponder: "ID46E / Hitag2 Extended", oemKey: "OHT01060512 / 13504200" },
  { model: "Chevrolet Lumina", years: "1995–2001", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Chevrolet Malibu", years: "1997–2004", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Malibu", years: "2003–2012", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Malibu", years: "2013–2016", transponder: "ID46E / Hitag2 Extended", oemKey: "OHT01060512 / 23335583" },
  { model: "Chevrolet Malibu", years: "2016–2021", transponder: "ID46E / Hitag2 Extended", oemKey: "13529661 / 13529660" },
  { model: "Chevrolet Monte Carlo", years: "1995–1999", transponder: "VATS / PassKey", oemKey: "—" },
  { model: "Chevrolet Monte Carlo", years: "2000–2005", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Monte Carlo", years: "2006–2007", transponder: "ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Optra", years: "2003–2008", transponder: "TP19 / Texas 4D", oemKey: "96458347" },
  { model: "Chevrolet Orlando", years: "2011–2018", transponder: "ID46E / Hitag2 Extended", oemKey: "13500218 / 13504196" },
  { model: "Chevrolet Silverado", years: "1998–2006", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Silverado", years: "2007–2013", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Silverado", years: "2014–2019", transponder: "ID46E / Hitag2 Extended", oemKey: "84540865 / 22881480" },
  { model: "Chevrolet Silverado", years: "2019–2021", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ1EA / 13508398" },
  { model: "Chevrolet Silverado", years: "2021+", transponder: "Hitag Pro", oemKey: "YG0G21TB2 / 13548437" },
  { model: "Chevrolet Sonic", years: "2012–2018", transponder: "ID46E / Hitag2 Extended", oemKey: "KR55WK50073" },
  { model: "Chevrolet Sonic", years: "2017–2020", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ4AA / 13529664" },
  { model: "Chevrolet Spark", years: "2013+", transponder: "ID46E / Hitag2 Extended", oemKey: "OHT01060512 / 20873621" },
  { model: "Chevrolet Suburban", years: "1998–2006", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Suburban", years: "2007–2014", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Suburban", years: "2015–2020", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ1AA / 13529634" },
  { model: "Chevrolet Suburban", years: "2021+", transponder: "Hitag Pro / encrypted", oemKey: "13541561 / 13537962" },
  { model: "Chevrolet S10 Blazer", years: "1996–2003", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet S10 Pickup", years: "1997–2004", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Tahoe", years: "1998–2006", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Tahoe", years: "2007–2014", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Tahoe", years: "2015–2020", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ1AA / 13580802" },
  { model: "Chevrolet Tahoe", years: "2021+", transponder: "Hitag Pro / encrypted", oemKey: "13541559 / 13541561" },
  { model: "Chevrolet Trailblazer", years: "2001–2006", transponder: "PassLock", oemKey: "—" },
  { model: "Chevrolet Trailblazer", years: "2006–2009", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Traverse", years: "2009–2017", transponder: "TP12GM / ID46 Hitag2", oemKey: "—" },
  { model: "Chevrolet Traverse", years: "2018–2020", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ4EA / 13519177" },
  { model: "Chevrolet Uplander", years: "2005–2009", transponder: "TP05 / ID13 fixed", oemKey: "—" },
  { model: "Chevrolet Venture", years: "1999–2005", transponder: "TP05 / ID13 fixed", oemKey: "—" },
  { model: "Chevrolet Vivant", years: "2003–2007", transponder: "TP05 / ID13 fixed", oemKey: "—" },
  { model: "Chevrolet Volt", years: "2011–2015", transponder: "ID46E / Hitag2 Extended", oemKey: "OHT05918179 / 22923862" },
  { model: "Chevrolet Volt", years: "2016–2019", transponder: "ID46E / Hitag2 Extended", oemKey: "HYQ4EA / 13529638" },
];

export function ChevroletTransponderPage({ onBack }: ChevroletTransponderPageProps) {
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
              <h1 className="text-gray-900">Chevrolet Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Chevrolet vehicles
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
                {chevroletTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Older Chevrolet models (1980s–early 2000s) used VATS/PassKey and PassLock systems. 
            Modern Chevrolet vehicles primarily use ID46E transponders with Hitag2 Extended technology. The Corvette C8 (2020+) 
            uses the latest Hitag Pro encrypted keys.
          </p>
        </div>
      </div>
    </div>
  );
}