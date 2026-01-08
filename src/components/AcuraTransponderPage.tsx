import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface AcuraTransponderPageProps {
  onBack: () => void;
}

const acuraTransponderData = [
  { model: "Acura CL", years: "1998–2003", transponder: "TP05 / ID13 fixed" },
  { model: "Acura CSX", years: "2006–2011", transponder: "TP12HN / ID46 Hitag2" },
  { model: "Acura EL", years: "2001–2005", transponder: "TP05 / ID13 fixed" },
  { model: "Acura ILX", years: "2013–2015", transponder: "ID46 / Hitag2" },
  { model: "Acura ILX", years: "2016–2020", transponder: "ID47 / Hitag3" },
  { model: "Acura Integra", years: "2000–2001", transponder: "TP05 / ID13 fixed" },
  { model: "Acura MDX", years: "2001–2006", transponder: "TP05 / ID13 fixed" },
  { model: "Acura MDX", years: "2007–2013", transponder: "ID46 / Hitag2" },
  { model: "Acura MDX", years: "2014–2020", transponder: "ID47 / Hitag3" },
  { model: "Acura NSX", years: "1997–2005", transponder: "TP05 / ID13 fixed" },
  { model: "Acura NSX", years: "2017+", transponder: "ID47 / Hitag3" },
  { model: "Acura RDX", years: "2007–2012", transponder: "ID46 / Hitag2" },
  { model: "Acura RDX", years: "2011–2015", transponder: "ID46 / Hitag2" },
  { model: "Acura RDX", years: "2016–2020", transponder: "ID47 / Hitag3" },
  { model: "Acura RL", years: "1996–2004", transponder: "TP05 / ID13 fixed" },
  { model: "Acura RL", years: "2005–2010", transponder: "TP12HN / ID46 Hitag2" },
  { model: "Acura RLX", years: "2016–2019", transponder: "ID47 / Hitag3" },
  { model: "Acura RSX", years: "2002–2006", transponder: "TP05 / ID13 fixed" },
  { model: "Acura TL", years: "1999–2003", transponder: "TP05 / ID13 fixed" },
  { model: "Acura TL", years: "2004–2006", transponder: "TP12HN / ID46 Hitag2" },
  { model: "Acura TL", years: "2007–2014", transponder: "ID46 / Hitag2" },
  { model: "Acura TL", years: "2009–2014", transponder: "ID46 / Hitag2" },
  { model: "Acura TLX", years: "2015–2021", transponder: "ID47 / Hitag3" },
  { model: "Acura TSX", years: "2004–2008", transponder: "TP12HN / ID46 Hitag2" },
  { model: "Acura TSX", years: "2009–2014", transponder: "ID46 / Hitag2" },
  { model: "Acura ZDX", years: "2010–2013", transponder: "ID46 / Hitag2" },
];

export function AcuraTransponderPage({ onBack }: AcuraTransponderPageProps) {
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
              <h1 className="text-white text-xl sm:text-2xl font-bold">Acura Transponder Fitment</h1>
              <p className="text-white/90 text-sm">
                Complete transponder reference for Acura vehicles
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
                {acuraTransponderData.map((item, index) => (
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
            <strong>Note:</strong> This reference shows the original transponder types for Acura vehicles. 
            Always verify compatibility with your specific key programming equipment before ordering transponders.
          </p>
        </div>
      </div>
    </div>
  );
}