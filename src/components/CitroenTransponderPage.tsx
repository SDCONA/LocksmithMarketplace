import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface CitroenTransponderPageProps {
  onBack: () => void;
}

const citroenTransponderData = [
  { model: "Citroën Berlingo", years: "1998–2001", transponder: "TP01 / TP05 / ID33 fixed", oemKey: "—" },
  { model: "Citroën Berlingo", years: "2001–2008", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën Berlingo", years: "2008–2016", transponder: "ID46 Hitag2", oemKey: "PCF7941 / PCF7961" },
  { model: "Citroën C1", years: "2005–2014", transponder: "Texas 4D / ID4D67–70", oemKey: "—" },
  { model: "Citroën C1", years: "2014+", transponder: "DST AES / ID74–75", oemKey: "—" },
  { model: "Citroën C2", years: "2003–2010", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën C3", years: "2002–2008", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën C3", years: "2008–2016", transponder: "ID46 Hitag2", oemKey: "PCF7941 / PCF7961" },
  { model: "Citroën C3", years: "2016+", transponder: "AES / ID4A–ID51", oemKey: "98167108ZD" },
  { model: "Citroën C3 Picasso", years: "2008–2017", transponder: "ID46 Hitag2", oemKey: "PCF7941 / PCF7961" },
  { model: "Citroën C3 Pluriel", years: "2003–2010", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën C4", years: "2005–2010", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën C4", years: "2010–2017", transponder: "ID46 Hitag2", oemKey: "1608480080 / 96742552ZD" },
  { model: "Citroën C4 Aircross", years: "2012–2017", transponder: "ID46 Hitag2", oemKey: "1608480080 / 96742552ZD" },
  { model: "Citroën C4 Picasso", years: "2006–2013", transponder: "ID46 Hitag2", oemKey: "PCF7941 / PCF7961" },
  { model: "Citroën C4 Picasso", years: "2013–2016", transponder: "ID46 Hitag2", oemKey: "1608480080 / 96742552ZD" },
  { model: "Citroën C4 Picasso", years: "2017+", transponder: "AES / ID4A–ID51", oemKey: "98167108ZD" },
  { model: "Citroën C5", years: "2001–2008", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën C5", years: "2008–2011", transponder: "ID46 Hitag2", oemKey: "6490A3 / 649073" },
  { model: "Citroën C5", years: "2011–2017", transponder: "ID46 Hitag2", oemKey: "1608480080 / 96742552ZD" },
  { model: "Citroën C5 Aircross", years: "2018+", transponder: "AES / ID4A–ID51", oemKey: "1617021380" },
  { model: "Citroën C6", years: "2006–2012", transponder: "ID46 Hitag2", oemKey: "649097 / 6554TE" },
  { model: "Citroën C8", years: "2002–2005", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën C8", years: "2005–2014", transponder: "ID46 Hitag2", oemKey: "6490AN / 6490SF" },
  { model: "Citroën Cactus", years: "2014–2017", transponder: "ID46 Hitag2", oemKey: "1612121480 / 1612121380" },
  { model: "Citroën Cactus", years: "2017+", transponder: "AES / ID4A–ID51", oemKey: "98167108ZD" },
  { model: "Citroën C-Crosser", years: "2007–2012", transponder: "ID46 Hitag2", oemKey: "PCF7941" },
  { model: "Citroën C-Elysée", years: "2013–2016", transponder: "ID46 Hitag2", oemKey: "1612121480 / 1612121380" },
  { model: "Citroën C-Zero", years: "2011–2016", transponder: "ID46 Hitag2", oemKey: "1612121480 / 1612121380" },
  { model: "Citroën Dispatch", years: "2002–2006", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën Dispatch", years: "2007–2016", transponder: "ID46 Hitag2", oemKey: "PCF7941" },
  { model: "Citroën Dispatch", years: "2016+", transponder: "AES / ID4A–ID51", oemKey: "1617021380" },
  { model: "Citroën DS3", years: "2010–2018", transponder: "ID46 Hitag2", oemKey: "1610436980 / 1610437180" },
  { model: "Citroën DS4", years: "2011–2016", transponder: "ID46 Hitag2", oemKey: "98004801ZD" },
  { model: "Citroën DS4", years: "2016+", transponder: "AES / ID4A–ID51", oemKey: "—" },
  { model: "Citroën DS5", years: "2012–2016", transponder: "ID46 Hitag2", oemKey: "98004801ZD" },
  { model: "Citroën DS5", years: "2016+", transponder: "AES / ID4A–ID51", oemKey: "—" },
  { model: "Citroën Evasion", years: "1998–2002", transponder: "TP01 / TP05 / ID33 fixed", oemKey: "—" },
  { model: "Citroën Jumper", years: "1996–2001", transponder: "TP05 / ID13 fixed", oemKey: "—" },
  { model: "Citroën Jumper", years: "2001–2005", transponder: "TP08 / ID48 crypto", oemKey: "—" },
  { model: "Citroën Jumper", years: "2006–2010", transponder: "TP08 / ID48 OR ID46 Hitag2", oemKey: "—" },
  { model: "Citroën Jumper", years: "2010+", transponder: "ID46 Hitag2", oemKey: "PCF7941 / PCF7936" },
  { model: "Citroën Jumpy", years: "1998–2001", transponder: "TP01 / TP05 / ID33 fixed", oemKey: "—" },
  { model: "Citroën Jumpy", years: "2002–2006", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën Jumpy", years: "2006–2016", transponder: "ID46 Hitag2", oemKey: "PCF7941" },
  { model: "Citroën Jumpy", years: "2016+", transponder: "AES / ID4A–ID51", oemKey: "1617021380 / 1617021280" },
  { model: "Citroën Nemo", years: "2008–2017", transponder: "ID46 Hitag2", oemKey: "71765697 / 1611652580" },
  { model: "Citroën Relay", years: "1996–2001", transponder: "TP05 / ID13 fixed", oemKey: "—" },
  { model: "Citroën Relay", years: "2001–2005", transponder: "TP08 / ID48 crypto", oemKey: "—" },
  { model: "Citroën Relay", years: "2006–2010", transponder: "TP08 / ID48 OR ID46 Hitag2", oemKey: "—" },
  { model: "Citroën Relay", years: "2010+", transponder: "ID46 Hitag2", oemKey: "PCF7941 / PCF7936" },
  { model: "Citroën Saxo", years: "1998–2000", transponder: "TP01 / TP05 / ID33 fixed", oemKey: "—" },
  { model: "Citroën Saxo", years: "2000–2003", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën SpaceTourer", years: "2016+", transponder: "AES / ID4A–ID51", oemKey: "—" },
  { model: "Citroën Synergie", years: "1998–2002", transponder: "TP01 / TP05 / ID33 fixed", oemKey: "—" },
  { model: "Citroën Xantia", years: "1997–1999", transponder: "TP01 / TP05 / ID33 fixed", oemKey: "—" },
  { model: "Citroën Xantia", years: "1999–2001", transponder: "TP08 / ID48 crypto", oemKey: "—" },
  { model: "Citroën Xsara", years: "1997–2001", transponder: "TP01 / TP05 / ID33 fixed", oemKey: "—" },
  { model: "Citroën Xsara", years: "2001–2006", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
  { model: "Citroën Xsara Picasso", years: "2000–2006", transponder: "TP12 / ID46 Hitag2", oemKey: "—" },
];

export function CitroenTransponderPage({ onBack }: CitroenTransponderPageProps) {
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
              <h1 className="text-gray-900">Citroën Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Citroën vehicles
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
                {citroenTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Citroën vehicles transitioned from TP01/TP05 fixed transponders in the late 1990s to TP12/ID46 Hitag2 in the 2000s, 
            and more recently to advanced AES encryption systems. Always verify the exact transponder type for your specific vehicle year.
          </p>
        </div>
      </div>
    </div>
  );
}
