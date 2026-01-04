import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface PeugeotTransponderPageProps {
  onBack: () => void;
}

const peugeotTransponderData = [
  { model: "Peugeot 1007", years: "2005–2009", transponder: "Hitag2 (ID46)", oemKey: "—" },
  { model: "Peugeot 2008", years: "2013–2017", transponder: "Hitag2 (ID46)", oemKey: "1608504480, 1608504380" },
  { model: "Peugeot 2008", years: "2017–", transponder: "Hitag AES (ID4A)", oemKey: "PCF7939M / NCF29A1M" },
  { model: "Peugeot 3008", years: "2009–2016", transponder: "Hitag2 (ID46)", oemKey: "6490R8, 6490R9" },
  { model: "Peugeot 3008", years: "2017–", transponder: "Hitag AES (ID4A)", oemKey: "98105588ZD, 98124195ZD" },
  { model: "Peugeot 4007", years: "2007–2012", transponder: "Hitag2 (ID46)", oemKey: "1608504480, 1608504380" },
  { model: "Peugeot 4008", years: "2012–2017", transponder: "Hitag AES (ID4A)", oemKey: "98105588ZD" },
  { model: "Peugeot 5008", years: "2009–2016", transponder: "Hitag2 (ID46)", oemKey: "649081, 6554GQ" },
  { model: "Peugeot 5008", years: "2017–", transponder: "Hitag AES (ID4A)", oemKey: "98105588ZD" },
  { model: "Peugeot 106", years: "1996–2000", transponder: "Philips ID33", oemKey: "—" },
  { model: "Peugeot 106", years: "2000–2004", transponder: "Hitag2 (ID46)", oemKey: "—" },
  { model: "Peugeot 107", years: "2005–2014", transponder: "Texas Crypto 4D (4D70)", oemKey: "—" },
  { model: "Peugeot 108", years: "2014–", transponder: "Texas AES (4D74)", oemKey: "1612489380, 1612489280" },
  { model: "Peugeot 206", years: "1997–2001", transponder: "Philips Crypto (ID45, precoded)", oemKey: "—" },
  { model: "Peugeot 206", years: "2001–2009", transponder: "Hitag2 (ID46)", oemKey: "—" },
  { model: "Peugeot 206+", years: "2009–", transponder: "Hitag2 (ID46)", oemKey: "—" },
  { model: "Peugeot 207", years: "2006–2012", transponder: "Hitag2 (ID46)", oemKey: "649075, 649034" },
  { model: "Peugeot 301", years: "2012–", transponder: "Hitag2 (ID46)", oemKey: "9807343377" },
  { model: "Peugeot 306", years: "1997–2003", transponder: "Philips ID33", oemKey: "—" },
  { model: "Peugeot 307", years: "2001–2009", transponder: "Hitag2 (ID46)", oemKey: "6554NN, 649076" },
  { model: "Peugeot 308", years: "2007–2012", transponder: "Hitag2 (ID46)", oemKey: "6490CS, 6490CT" },
  { model: "Peugeot 308", years: "2013–2017", transponder: "Hitag2 (ID46)", oemKey: "6490SK, 98124195ZD" },
  { model: "Peugeot 308", years: "2017–", transponder: "Hitag AES (ID4A)", oemKey: "98105588ZD" },
  { model: "Peugeot 406", years: "1997–1999", transponder: "Philips ID33", oemKey: "—" },
  { model: "Peugeot 406", years: "1999–2001", transponder: "Philips Crypto (ID45, precoded)", oemKey: "—" },
  { model: "Peugeot 406", years: "2001–2004", transponder: "Hitag2 (ID46)", oemKey: "—" },
  { model: "Peugeot 407", years: "2004–2011", transponder: "Hitag2 (ID46)", oemKey: "6490R5, 6490R4" },
  { model: "Peugeot 408", years: "2010–", transponder: "Hitag2 (ID46)", oemKey: "—" },
  { model: "Peugeot 508", years: "2011–2014", transponder: "Hitag2 (ID46)", oemKey: "1609365280" },
  { model: "Peugeot 508", years: "2014–2016", transponder: "Hitag2 (ID46)", oemKey: "96728357XT" },
  { model: "Peugeot 508", years: "2016–", transponder: "Hitag AES (ID4A)", oemKey: "98105588ZD" },
  { model: "Peugeot 607", years: "2001–2004", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Peugeot 607", years: "2004–2010", transponder: "Hitag2 (ID46)", oemKey: "6490A0, 6554GN" },
  { model: "Peugeot 806", years: "1997–2002", transponder: "Philips ID33", oemKey: "—" },
  { model: "Peugeot 807", years: "2002–2014", transponder: "Hitag2 (ID46)", oemKey: "6490Z4, 6490Z5" },
  { model: "Peugeot Bipper", years: "2008–2017", transponder: "Hitag2 (ID46)", oemKey: "1611652580" },
  { model: "Peugeot Boxer", years: "1996–2001", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Peugeot Boxer", years: "2002–2008", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Peugeot Boxer", years: "2007–2016", transponder: "Hitag2+ (ID46)", oemKey: "71752589" },
  { model: "Peugeot Boxer", years: "2016–", transponder: "Hitag2+ (ID46)", oemKey: "—" },
  { model: "Peugeot Expert", years: "1997–2001", transponder: "Philips ID33", oemKey: "—" },
  { model: "Peugeot Expert", years: "2001–2006", transponder: "Hitag2 (ID46)", oemKey: "—" },
  { model: "Peugeot Expert", years: "2007–2016", transponder: "Hitag2 (ID46)", oemKey: "649094, 6490AF" },
  { model: "Peugeot Expert", years: "2016–", transponder: "Hitag AES (ID4A)", oemKey: "9810666677" },
  { model: "Peugeot Ion", years: "2010–", transponder: "Hitag2 (ID46)", oemKey: "6490QF, 6490QE" },
  { model: "Peugeot Partner", years: "1997–2001", transponder: "Philips ID33", oemKey: "—" },
  { model: "Peugeot Partner", years: "2002–2008", transponder: "Hitag2 (ID46)", oemKey: "—" },
  { model: "Peugeot Partner", years: "2008–2017", transponder: "Hitag2 (ID46)", oemKey: "6490C9, 649043" },
  { model: "Peugeot Partner", years: "2018–", transponder: "Hitag AES (ID4A)", oemKey: "98105588ZD" },
  { model: "Peugeot Ranch", years: "1997–2001", transponder: "Philips ID33", oemKey: "—" },
  { model: "Peugeot Ranch", years: "2002–2008", transponder: "Hitag2 (ID46)", oemKey: "—" },
  { model: "Peugeot RCZ", years: "2010–", transponder: "Hitag2 (ID46)", oemKey: "6490LQ, 6490LR" },
  { model: "Peugeot Rifter", years: "2018–", transponder: "Hitag AES (ID4A)", oemKey: "98105588ZD" },
  { model: "Peugeot Traveller", years: "2016–", transponder: "Hitag AES (ID4A)", oemKey: "98105588ZD" },
  { model: "Peugeot Scooters", years: "1996–", transponder: "Temic 11 (ID11)", oemKey: "—" },
];

export function PeugeotTransponderPage({ onBack }: PeugeotTransponderPageProps) {
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
              <h1 className="text-gray-900">Peugeot Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Peugeot vehicles
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
                {peugeotTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Peugeot vehicles (part of PSA Group/Stellantis) demonstrate a comprehensive 
            multi-generation transponder evolution with extensive OEM key documentation. Mid-1990s models (106, 206, 
            306, 406, 806, Expert, Partner, Ranch) used basic Philips ID33 transponders. Late 1990s saw adoption of 
            Philips Crypto (ID45, precoded) on select models (206, 406). Commercial vehicles (Boxer) uniquely used 
            Megamos 13 (ID13) and later Megamos Crypto 48 (ID48), with the 607 luxury sedan also using ID48. From 
            2001-2017, the lineup transitioned to widespread Hitag2 (ID46) technology with comprehensive OEM key 
            numbers documented across all segments including small cars (106, 206+, 207, 301), compacts (307, 308), 
            mid-size (407, 408, 508), large (607, 807), crossovers (1007, 2008, 3008, 4007, 5008), sports (RCZ), 
            commercial vans (Bipper, Expert, Partner, Ranch), and electric vehicles (Ion). The 107 uniquely used 
            Texas Crypto 4D (4D70), while the 108 uses Texas AES (4D74). Modern 2016+ vehicles across the lineup 
            use advanced Hitag AES (ID4A) encryption (2008, 3008, 4008, 5008, 308, 508, Expert, Partner, Rifter, 
            Traveller). Uniquely, Peugeot Scooters use Temic 11 (ID11) from 1996 onwards. Peugeot stands out for 
            documenting specific OEM key part numbers extensively across their entire range.
          </p>
        </div>
      </div>
    </div>
  );
}
