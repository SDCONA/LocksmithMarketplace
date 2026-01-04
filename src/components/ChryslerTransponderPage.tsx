import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface ChryslerTransponderPageProps {
  onBack: () => void;
}

const chryslerTransponderData = [
  { model: "Chrysler Aspen", years: "2005–2009", transponder: "ID46 / Hitag2", oemKey: "KOBDT04A / 05179514AA / 56038757AE" },
  { model: "Chrysler Cirrus", years: "1999–2000", transponder: "Texas 4D / 4D64", oemKey: "—" },
  { model: "Chrysler Concorde", years: "1998–2004", transponder: "Texas 4D / 4D64", oemKey: "—" },
  { model: "Chrysler Crossfire", years: "2003–2008", transponder: "ID33 fixed (precoded)", oemKey: "—" },
  { model: "Chrysler Intrepid", years: "1998–2004", transponder: "Texas 4D / 4D64", oemKey: "—" },
  { model: "Chrysler LHS", years: "1999–2001", transponder: "Texas 4D / 4D64", oemKey: "—" },
  { model: "Chrysler Neon", years: "2000–2005", transponder: "Texas 4D / 4D64", oemKey: "—" },
  { model: "Chrysler Pacifica", years: "2004–2008", transponder: "ID46 / Hitag2", oemKey: "M3N65981772 / 04589053AC" },
  { model: "Chrysler Pacifica", years: "2017–2021", transponder: "AES / ID4A", oemKey: "M3N97395900 / 68217829" },
  { model: "Chrysler PT Cruiser", years: "2001–2005", transponder: "Texas 4D / 4D64", oemKey: "—" },
  { model: "Chrysler PT Cruiser", years: "2006–2010", transponder: "ID46 / Hitag2", oemKey: "OHT692427AA / 05191963AA" },
  { model: "Chrysler Sebring", years: "1998–2006", transponder: "Texas 4D / 4D64–61", oemKey: "—" },
  { model: "Chrysler Sebring", years: "2007–2010", transponder: "ID46 / Hitag2", oemKey: "OHT692427AA / 05175815AA" },
  { model: "Chrysler Stratus", years: "1998–2006", transponder: "Texas 4D / 4D64–60", oemKey: "—" },
  { model: "Chrysler Town & Country", years: "1999–2003", transponder: "Texas 4D / 4D64–60", oemKey: "—" },
  { model: "Chrysler Town & Country", years: "2004–2007", transponder: "ID46 / Hitag2", oemKey: "M3N5WY72XX / 05183681" },
  { model: "Chrysler Town & Country", years: "2008–2016", transponder: "ID46 / Hitag2", oemKey: "IYZ-C01C / 68043583AA" },
  { model: "Chrysler Voyager", years: "2000–2003", transponder: "Texas 4D / 4D64–60", oemKey: "—" },
  { model: "Chrysler Voyager", years: "2020–2021", transponder: "AES / ID4A", oemKey: "M3N97395900 / 68217827" },
  { model: "Chrysler 200", years: "2011–2014", transponder: "ID46 / Hitag2", oemKey: "OHT692427AA / 68001710AB" },
  { model: "Chrysler 200", years: "2015–2017", transponder: "AES / ID4A", oemKey: "M3M40821302 / 68155687" },
  { model: "Chrysler 300", years: "1999–2004", transponder: "Texas 4D / 4D64–60", oemKey: "—" },
  { model: "Chrysler 300", years: "2005–2007", transponder: "ID46 / Hitag2", oemKey: "KOBDT04A / 68004413AA" },
  { model: "Chrysler 300", years: "2008–2010", transponder: "ID46 / Hitag2", oemKey: "IYZ-C01C / 68044060AC" },
  { model: "Chrysler 300", years: "2011–2021", transponder: "AES / ID4A", oemKey: "M3M40821302 / 68155687AB" },
];

export function ChryslerTransponderPage({ onBack }: ChryslerTransponderPageProps) {
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
              <h1 className="text-gray-900">Chrysler Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Chrysler vehicles
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
                {chryslerTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Older Chrysler models (late 1990s–mid 2000s) used Texas 4D/4D64 transponders. 
            Mid-2000s through 2010 models transitioned to ID46/Hitag2 technology. Modern Chrysler vehicles (2011+) 
            primarily use AES/ID4A advanced encryption systems for enhanced security.
          </p>
        </div>
      </div>
    </div>
  );
}
