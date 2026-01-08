import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface FordTransponderPageProps {
  onBack: () => void;
}

const fordTransponderData = [
  { model: "Ford B-Max", years: "2012–2018", transponder: "Texas Crypto 2 / DST80 / ID63-6F (4D+ 80-bit)", oemKey: "7S7T-15K601-EE, 7S7T-15K601-DB" },
  { model: "Ford C-Max", years: "2003–2010", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford C-Max", years: "2010–2015", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "7S7T-15K601-EE" },
  { model: "Ford C-Max", years: "2015–2020", transponder: "Philips Crypto 3 / Hitag Pro / ID47 / PCF7939FA / PCF7953P", oemKey: "—" },
  { model: "Ford Cougar", years: "1998–2002", transponder: "Texas 4C / ID4C / Philips Crypto ID44", oemKey: "—" },
  { model: "Ford Contour", years: "1997–2000", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Crown Victoria", years: "1998–2002", transponder: "Texas 4C / ID4C / Texas Crypto 4D60", oemKey: "—" },
  { model: "Crown Victoria", years: "2003–2011", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford EcoSport", years: "2013–2017", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford EcoSport", years: "2018–2021", transponder: "Philips Crypto 3 / Hitag Pro / ID47 / PCF7939FA / PCF7953P", oemKey: "HC3T-15K601-BA" },
  { model: "Ford Edge", years: "2006–2010", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Edge", years: "2010–2014", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Edge", years: "2014+", transponder: "Philips Crypto 3 / Hitag Pro / ID47 / PCF7939FA / PCF7953P", oemKey: "HC3T-15K601-DB" },
  { model: "Ford Endeavour", years: "2015+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "—" },
  { model: "Ford Escort", years: "1995+", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford Escape", years: "2001–2004", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "Ford Escape", years: "2005–2012", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Escape", years: "2012–2016", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Escape", years: "2017+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "—" },
  { model: "Ford E-Series", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "Ford E-Series", years: "2008–2012", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford E-Series", years: "2013–2014", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Excursion", years: "2000–2006", transponder: "Texas 4C / ID4C / Philips Crypto ID42", oemKey: "—" },
  { model: "Ford Expedition", years: "1997–2002", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford Expedition", years: "2003–2006", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "Ford Expedition", years: "2006–2010", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Expedition", years: "2011–2017", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Expedition", years: "2018+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "—" },
  { model: "Ford Explorer", years: "1998–2001", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford Explorer", years: "2001–2003", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "Ford Explorer", years: "2004–2012", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Explorer", years: "2011–2017", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Explorer", years: "2016+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "HC3T-15K601-BD" },
  { model: "Ford Everest", years: "2015+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "—" },
  { model: "Ford Fiesta", years: "1995–2002", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford Fiesta", years: "2001–2002", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "Ford Fiesta", years: "2003–2012", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Fiesta", years: "2013–2017", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "7S7T-15K601-EC" },
  { model: "Ford Fiesta", years: "2017+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "H1BT-15K601-BA" },
  { model: "Ford Flex", years: "2008–2012", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Flex", years: "2012–2019", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Focus", years: "1998–2004", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "Ford Focus", years: "2004–2010", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Focus", years: "2011–2015", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "7S7T-15K601-DA" },
  { model: "Ford Focus", years: "2015–2018", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "H1BT-15K601-BA" },
  { model: "Ford Fusion", years: "2006–2010", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Fusion", years: "2011–2013", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Fusion", years: "2013–2020", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "DS7T-15K601-CH" },
  { model: "Ford F-150", years: "1999–2003", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford F-150", years: "2004–2011", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford F-150", years: "2011–2015", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford F-150", years: "2015–2020", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "M3N-A2C93142300" },
  { model: "Ford F-250", years: "1999–2003", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford F-250", years: "2004–2011", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford F-250", years: "2011–2016", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "BC3T-15K601-AB" },
  { model: "Ford F-250", years: "2017+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "M3N-A2C93142300" },
  { model: "Ford Galaxy", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Ford Galaxy", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "Ford Galaxy", years: "2000–2006", transponder: "Philips Crypto ID44", oemKey: "—" },
  { model: "Ford Galaxy", years: "2006–2010", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Galaxy", years: "2010–2014", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "7S7T-15K601-EC" },
  { model: "Ford Galaxy", years: "2015+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "H1BT-15K601-BA" },
  { model: "Ford KA", years: "1996–2002", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford KA", years: "2002–2008", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "Ford KA", years: "2009–2014", transponder: "Philips Crypto 2 / Hitag2 / ID46 / PCF7936, PCF7946", oemKey: "—" },
  { model: "Ford KA / KA+", years: "2016+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "—" },
  { model: "Ford Kuga", years: "2008–2012", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Kuga", years: "2012–2016", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "7S7T-15K601-DC" },
  { model: "Ford Kuga", years: "2016–2020", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "—" },
  { model: "Ford Mondeo", years: "1995–2001", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford Mondeo", years: "2001–2007", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "Ford Mondeo", years: "2007–2010", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Mondeo", years: "2011–2014", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Mondeo", years: "2014+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "DS7T-15K601-BE" },
  { model: "Ford Mustang", years: "1997–2004", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford Mustang", years: "2005–2012", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Mustang", years: "2011–2014", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Mustang", years: "2015+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "DS7T-15K601-CM" },
  { model: "Ford Transit", years: "1995–1999", transponder: "Texas 4C / ID4C", oemKey: "—" },
  { model: "Ford Transit", years: "2000–2006", transponder: "Texas Crypto 4D60 / ID60", oemKey: "—" },
  { model: "Ford Transit", years: "2007–2013", transponder: "Texas Crypto 4D63 / ID63", oemKey: "—" },
  { model: "Ford Transit", years: "2013–2016", transponder: "Texas Crypto 2 / DST80 / ID63-6F", oemKey: "—" },
  { model: "Ford Transit", years: "2016+", transponder: "Philips Crypto 3 / Hitag Pro / ID47", oemKey: "GK2T-15K601-AA" },
];

export function FordTransponderPage({ onBack }: FordTransponderPageProps) {
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
              <h1 className="text-white text-xl sm:text-2xl font-bold">Ford Transponder Fitment</h1>
              <p className="text-white/90 text-sm">
                Complete transponder reference for Ford vehicles
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    OEM Key (examples)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {fordTransponderData.map((item, index) => (
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
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.oemKey}
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
            <strong>Note:</strong> Ford vehicles show a clear transponder evolution through four major generations: 
            early models (1995-2002) used basic Texas 4C (ID4C) with some Philips Crypto (ID33/ID42/ID44), 
            mid-2000s transitioned to Texas Crypto 4D60/4D63 (ID60/ID63), the 2010s adopted advanced Texas Crypto 2 
            / DST80 (ID63-6F) with 80-bit encryption, and modern vehicles (2015+) use state-of-the-art Philips Crypto 3 
            / Hitag Pro (ID47) for maximum security. Many popular models like the F-150, Explorer, and Mustang show 
            overlapping technology during transition periods.
          </p>
        </div>
      </div>
    </div>
  );
}