import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface HondaTransponderPageProps {
  onBack: () => void;
}

const hondaTransponderData = [
  { model: "Honda Accord", years: "1995–1999", transponder: "Philips ID33 (PCF7930, PCF7931)", oemKey: "—" },
  { model: "Honda Accord", years: "1998–2003", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Honda Accord", years: "2002–2006", transponder: "Philips Crypto 2 / ID46 (PCF7936AS) OR Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Honda Accord", years: "2006–2008", transponder: "Sokymat Crypto 8E (Honda ID8E)", oemKey: "—" },
  { model: "Honda Accord", years: "2008–2012", transponder: "Philips Crypto 2 / Hitag2 / ID46 (PCF7941, PCF7936)", oemKey: "KR55WK49308" },
  { model: "Honda Accord", years: "2013+", transponder: "Philips Crypto 3 / Hitag3 / ID47 (PCF7961x, NCF2952x)", oemKey: "72147-T2A-A22" },
  { model: "Honda Brio", years: "2011+", transponder: "Philips Crypto 2 / Hitag2 / ID46", oemKey: "—" },
  { model: "Honda City", years: "2002–2008", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Honda City", years: "2008–2013", transponder: "Philips Crypto 2 / Hitag2 / ID46", oemKey: "—" },
  { model: "Honda City", years: "2014+", transponder: "Philips Crypto 3 / Hitag3 / ID47", oemKey: "72147-T9A-H01" },
  { model: "Honda Civic", years: "1995–2001", transponder: "Megamos ID13 OR Philips ID33", oemKey: "—" },
  { model: "Honda Civic", years: "1999–2006", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Honda Civic", years: "2006–2013", transponder: "Philips Crypto 2 / Hitag2 / ID46", oemKey: "35118-SDA-A01" },
  { model: "Honda Civic", years: "2013+", transponder: "Philips Crypto 3 / Hitag3 / ID47", oemKey: "35118-T2A-A20" },
  { model: "Honda CR-V", years: "1997–2000", transponder: "Megamos ID13", oemKey: "—" },
  { model: "Honda CR-V", years: "1999–2006", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Honda CR-V", years: "2007–2013", transponder: "Philips Crypto 2 / Hitag2 / ID46", oemKey: "—" },
  { model: "Honda CR-V", years: "2014+", transponder: "Philips Crypto 3 / Hitag3 / ID47", oemKey: "—" },
  { model: "Honda Fit / Jazz", years: "2007–2008", transponder: "Sokymat Crypto 8E", oemKey: "OUCG8D380HA" },
  { model: "Honda Fit / Jazz", years: "2009–2014", transponder: "Philips Crypto 2 / Hitag2 / ID46", oemKey: "MLBHLIK-1T" },
  { model: "Honda Fit / Jazz", years: "2015+", transponder: "Philips Crypto 3 / Hitag3 / ID47", oemKey: "72147-T7S-A01" },
  { model: "Honda Odyssey", years: "1998–2004", transponder: "Megamos ID13", oemKey: "—" },
  { model: "Honda Odyssey", years: "2005–2013", transponder: "Philips Crypto 2 / Hitag2 / ID46", oemKey: "35111-SHJ-305" },
  { model: "Honda Odyssey", years: "2014+", transponder: "Philips Crypto 3 / Hitag3 / ID47", oemKey: "72147-THR-A11" },
  { model: "Honda Pilot", years: "2003–2005", transponder: "Megamos ID13", oemKey: "—" },
  { model: "Honda Pilot", years: "2005–2015", transponder: "Philips Crypto 2 / Hitag2 / ID46", oemKey: "KR55WK49308" },
  { model: "Honda Pilot", years: "2015+", transponder: "Philips Crypto 3 / Hitag3 / ID47", oemKey: "72147-TG7-A11" },
  { model: "Honda Ridgeline", years: "2006–2014", transponder: "Philips Crypto 2 / Hitag2 / ID46", oemKey: "OUCG8D380HA" },
  { model: "Honda Ridgeline", years: "2017+", transponder: "Philips Crypto 3 / Hitag3 / ID47", oemKey: "72147-T6Z-A01" },
  { model: "Honda Passport", years: "1998–2002", transponder: "Megamos ID13", oemKey: "—" },
  { model: "Honda Passport", years: "2019+", transponder: "Philips Crypto 3 / Hitag3 / ID47", oemKey: "72147-TG7-AB1" },
  { model: "Honda Insight", years: "2000–2006", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Honda Insight", years: "2010–2014", transponder: "Philips Crypto 2 / Hitag2 / ID46", oemKey: "35118-TP6-A20" },
  { model: "Honda Insight", years: "2019+", transponder: "Philips Crypto 3 / Hitag3 / ID47", oemKey: "72147-TWAA11" },
];

export function HondaTransponderPage({ onBack }: HondaTransponderPageProps) {
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
              <h1 className="text-gray-900">Honda Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Honda vehicles
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
                {hondaTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Honda vehicles show a clear transponder evolution through four generations: 
            early models (1995-2001) used basic Megamos ID13 or Philips ID33, late 1990s to mid-2000s adopted 
            Megamos Crypto 48 (ID48) encryption, mid-2000s to early 2010s transitioned to Philips Crypto 2 / Hitag 2 
            (ID46), with some models using proprietary Sokymat Crypto 8E (Honda ID8E) in the 2006-2008 transition period, 
            and modern vehicles (2013+) use advanced Philips Crypto 3 / Hitag 3 (ID47) for maximum security. Popular 
            models like the Accord, Civic, and CR-V show clear progression through all four generations.
          </p>
        </div>
      </div>
    </div>
  );
}
