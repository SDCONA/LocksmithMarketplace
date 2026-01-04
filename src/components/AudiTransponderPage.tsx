import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface AudiTransponderPageProps {
  onBack: () => void;
}

const audiTransponderData = [
  { model: "Audi 80", years: "1996", transponder: "TP05 / ID13 fixed" },
  { model: "Audi A1", years: "2010–2017", transponder: "TP25 / ID48 crypto precoded" },
  { model: "Audi A1", years: "2018+", transponder: "AES / ID49 / MQB" },
  { model: "Audi A2", years: "2000–2005", transponder: "TP08 / ID48 crypto" },
  { model: "Audi A3", years: "1996–1998", transponder: "TP05 / ID13 fixed" },
  { model: "Audi A3", years: "1998–2004", transponder: "TP08 / ID48 crypto" },
  { model: "Audi A3", years: "2004–2012", transponder: "TP25 / ID48 crypto precoded" },
  { model: "Audi A3", years: "2013–2018", transponder: "AES / ID49 / MQB" },
  { model: "Audi A4 / S4", years: "1995–1997", transponder: "TP05 / ID13 fixed" },
  { model: "Audi A4 / S4", years: "1997–2003", transponder: "TP08 / ID48 crypto" },
  { model: "Audi A4 / S4", years: "2004–2008", transponder: "TP25 / ID48 crypto precoded" },
  { model: "Audi A4 / S4", years: "2008–2016", transponder: "PCF7945AC / Hitag Extended" },
  { model: "Audi A5 / S5", years: "2007–2016", transponder: "PCF7945AC / Hitag Extended" },
  { model: "Audi A6 / S6", years: "1995–1997", transponder: "TP05 / ID13 fixed" },
  { model: "Audi A6 / S6", years: "1997–2004", transponder: "TP08 / ID48 crypto" },
  { model: "Audi A6 / S6 (C6 4F)", years: "2004–2010", transponder: "ID8E / Sokymat Crypto" },
  { model: "Audi A6 / S6 (C7 4G)", years: "2011–2018", transponder: "PCF7945AC / Hitag Extended" },
  { model: "Audi A7 / S7", years: "2010–2018", transponder: "PCF7945AC / Hitag Extended" },
  { model: "Audi A8 / S8", years: "1995–1997", transponder: "TP05 / ID13 fixed" },
  { model: "Audi A8 / S8", years: "1997–2003", transponder: "TP08 / ID48 crypto" },
  { model: "Audi A8 / S8", years: "2004–2009", transponder: "TP12 / Hitag2" },
  { model: "Audi A8 / S8 (D4)", years: "2010–2017", transponder: "PCF7945AC / Hitag Extended" },
  { model: "Audi Allroad", years: "2000–2005", transponder: "TP08 / ID48 crypto" },
  { model: "Audi Allroad (C6 4F)", years: "2004–2010", transponder: "ID8E / Sokymat Crypto" },
  { model: "Audi Allroad (C7 4G)", years: "2010–2017", transponder: "PCF7945AC / Hitag Extended" },
  { model: "Audi Cabrio", years: "1995–1997", transponder: "TP05 / ID13 fixed" },
  { model: "Audi Cabrio", years: "1997+", transponder: "TP08 / ID48 crypto" },
  { model: "Audi Coupe / S2", years: "1995–1997", transponder: "TP05 / ID13 fixed" },
  { model: "Audi Coupe / S2", years: "1997+", transponder: "TP08 / ID48 crypto" },
  { model: "Audi Q7 (4L)", years: "2006–2015", transponder: "ID8E / Sokymat Crypto" },
  { model: "Audi Q5", years: "2008–2016", transponder: "PCF7945AC / Hitag Extended" },
  { model: "Audi Q3", years: "2011–2018", transponder: "TP25 / ID48 crypto precoded" },
  { model: "Audi Q2", years: "2016+", transponder: "AES / ID49 / MQB" },
  { model: "Audi TT", years: "1998–1999", transponder: "TP08 / ID48 crypto" },
  { model: "Audi TT", years: "2000–2006", transponder: "TP08 / ID48 crypto" },
  { model: "Audi TT", years: "2006–2013", transponder: "TP25 / ID48 crypto precoded" },
  { model: "Audi TT / TTS", years: "2014–2018", transponder: "AES / ID49 / MQB" },
];

export function AudiTransponderPage({ onBack }: AudiTransponderPageProps) {
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
              <h1 className="text-gray-900">Audi Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Audi vehicles
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
                {audiTransponderData.map((item, index) => (
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
            <strong>Note:</strong> This reference shows the original transponder types for Audi vehicles. 
            Always verify compatibility with your specific key programming equipment before ordering transponders.
          </p>
        </div>
      </div>
    </div>
  );
}
