import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface BMWTransponderPageProps {
  onBack: () => void;
}

const bmwTransponderData = [
  { model: "BMW 1-Series (E81/E82/E87/E88)", years: "2004–2006", transponder: "ID46 / PCF7936" },
  { model: "BMW 1-Series (E81/E82/E87/E88)", years: "2007–2010", transponder: "ID46 / PCF7936" },
  { model: "BMW 1-Series (F20/F21)", years: "2011–2018", transponder: "ID49 / Hitag Pro" },
  { model: "BMW 2-Series (F22/F23)", years: "2014+", transponder: "ID49 / Hitag Pro" },
  { model: "BMW 3-Series (E36/E46)", years: "1995–2001", transponder: "ID33 fixed" },
  { model: "BMW 3-Series (E46)", years: "1999–2006", transponder: "ID46 / PCF7936" },
  { model: "BMW 3-Series (E90/E91/E92/E93)", years: "2005–2012", transponder: "ID46 / PCF7936" },
  { model: "BMW 3-Series (F30/F31/F35/F80)", years: "2012–2019", transponder: "ID49 / Hitag Pro" },
  { model: "BMW 3-Series (G20/G21)", years: "2019+", transponder: "BDC2 / encrypted key" },
  { model: "BMW 4-Series (F32/F33/F36/F82)", years: "2013–2020", transponder: "ID49 / Hitag Pro" },
  { model: "BMW 5-Series (E39)", years: "1996–1999", transponder: "ID33 fixed" },
  { model: "BMW 5-Series (E39)", years: "1999–2004", transponder: "ID46 / PCF7936" },
  { model: "BMW 5-Series (E60/E61)", years: "2004–2010", transponder: "ID46 / PCF7936" },
  { model: "BMW 5-Series (F07/F10/F11/F18)", years: "2010–2018", transponder: "ID49 / Hitag Pro" },
  { model: "BMW 5-Series (G30/G31/G38)", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "BMW 6-Series (E63/E64)", years: "2004–2006", transponder: "ID46 / PCF7936" },
  { model: "BMW 6-Series (E63/E64)", years: "2007–2010", transponder: "ID46 / PCF7936" },
  { model: "BMW 6-Series (F12/F13)", years: "2011–2018", transponder: "ID49 / Hitag Pro" },
  { model: "BMW 6-Series (G32)", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "BMW 7-Series (E38)", years: "1995–1998", transponder: "ID33 fixed" },
  { model: "BMW 7-Series (E38)", years: "1999–2001", transponder: "ID46 / PCF7936" },
  { model: "BMW 7-Series (E65/E66/E67)", years: "2001–2008", transponder: "ID46 / PCF7936" },
  { model: "BMW 7-Series (F01/F02/F03/F04)", years: "2009–2015", transponder: "ID49 / Hitag Pro" },
  { model: "BMW 7-Series (G11/G12)", years: "2016+", transponder: "BDC2 / encrypted key" },
  { model: "BMW 8-Series (E31)", years: "1996–1999", transponder: "ID33 fixed" },
  { model: "BMW 8-Series (G14/G15/G16)", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "BMW X1 (E84)", years: "2010–2015", transponder: "ID46 / PCF7936" },
  { model: "BMW X1 (F48/F49)", years: "2015+", transponder: "ID49 / Hitag Pro" },
  { model: "BMW X2 (F39)", years: "2018+", transponder: "ID49 / Hitag Pro" },
  { model: "BMW X3 (E83)", years: "2003–2010", transponder: "ID46 / PCF7936" },
  { model: "BMW X3 (F25)", years: "2010–2018", transponder: "ID49 / Hitag Pro" },
  { model: "BMW X3 (G01/G08/F97)", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "BMW X4 (F26)", years: "2014–2018", transponder: "ID49 / Hitag Pro" },
  { model: "BMW X4 (G02/F98)", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "BMW X5 (E53)", years: "1999–2006", transponder: "ID46 / PCF7936" },
  { model: "BMW X5 (E70)", years: "2007–2013", transponder: "ID46 / PCF7936" },
  { model: "BMW X5 (F15/F85)", years: "2014–2018", transponder: "ID49 / Hitag Pro" },
  { model: "BMW X5 (G05)", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "BMW X6 (E71/E72)", years: "2007–2014", transponder: "ID46 / PCF7936" },
  { model: "BMW X6 (F16/F86)", years: "2014–2018", transponder: "ID49 / Hitag Pro" },
  { model: "BMW X6 (G06)", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "BMW X7 (G07)", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "BMW Z3", years: "1995–2002", transponder: "ID33 fixed / ID44 (MY1999)" },
  { model: "BMW Z4 (E85/E86)", years: "2002–2008", transponder: "ID46 / PCF7936" },
  { model: "BMW Z4 (E89)", years: "2009–2016", transponder: "ID46 / PCF7936" },
  { model: "BMW Z4 (G29)", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "BMW Z8 (E52)", years: "2000–2003", transponder: "ID46 / PCF7936" },
  { model: "BMW i3", years: "2013–2018", transponder: "ID49 / Hitag Pro" },
  { model: "BMW i8", years: "2014–2018", transponder: "ID49 / Hitag Pro" },
  { model: "BMW i8", years: "2018+", transponder: "BDC2 / encrypted key" },
  { model: "MINI Cooper", years: "2001–2005", transponder: "ID46 / PCF7936" },
  { model: "MINI Cooper", years: "2006–2012", transponder: "ID46 / PCF7936" },
  { model: "MINI Cooper", years: "2013+", transponder: "ID49 / Hitag Pro" },
  { model: "BMW F650GS", years: "2008–2011", transponder: "TP12 / ID46 / PCF7936" },
  { model: "BMW F650GS", years: "2012+", transponder: "Texas 4D" },
  { model: "BMW F800GS", years: "2008–2011", transponder: "TP12 / ID46 / PCF7936" },
  { model: "BMW F800GS", years: "2012+", transponder: "Texas 4D" },
  { model: "BMW R1200GS", years: "2005–2011", transponder: "TP12 / ID46 / PCF7936" },
  { model: "BMW R1200GS", years: "2012–2017", transponder: "Texas 4D" },
  { model: "BMW R1200GS", years: "2018+", transponder: "Texas 4D AES" },
  { model: "BMW K1300", years: "2009–2015", transponder: "Texas 4D" },
  { model: "BMW K1600B", years: "2011+", transponder: "TP12 / ID46 / PCF7936" },
  { model: "BMW K1600GT", years: "2011+", transponder: "TP12 / ID46 / PCF7936" },
  { model: "BMW K1600GTL", years: "2011+", transponder: "TP12 / ID46 / PCF7936" },
  { model: "BMW C600 Sport", years: "2012+", transponder: "Texas 4D" },
  { model: "BMW C650GT", years: "2012+", transponder: "Texas 4D" },
];

export function BMWTransponderPage({ onBack }: BMWTransponderPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-gray-800 dark:via-gray-900 dark:to-black shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white text-xl sm:text-2xl font-bold">BMW Transponder Fitment</h1>
              <p className="text-white/90 text-sm">
                Complete transponder reference for BMW vehicles & motorcycles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Years
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Transponder Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bmwTransponderData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {item.model}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.years}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
                        {item.transponder}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> This reference shows the original transponder types for BMW vehicles and motorcycles. 
            Always verify compatibility with your specific key programming equipment before ordering transponders.
          </p>
        </div>
      </div>
    </div>
  );
}