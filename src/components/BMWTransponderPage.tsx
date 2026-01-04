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
              <h1 className="text-gray-900">BMW Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for BMW vehicles & motorcycles
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bmwTransponderData.map((item, index) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This reference shows the original transponder types for BMW vehicles and motorcycles. 
            Always verify compatibility with your specific key programming equipment before ordering transponders.
          </p>
        </div>
      </div>
    </div>
  );
}
