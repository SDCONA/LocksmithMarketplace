import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface DaciaTransponderPageProps {
  onBack: () => void;
}

const daciaTransponderData = [
  { model: "Dacia Dokker", years: "2012+", transponder: "Hitag AES 128-bit / ID4A / PCF7939M / PCF7961M", oemKey: "—" },
  { model: "Dacia Duster I", years: "2010–2017", transponder: "Hitag 2 / PCF7936 / PCF7947 / PCF7946 / JMA TP12", oemKey: "—" },
  { model: "Dacia Duster II", years: "2017+", transponder: "Hitag AES 128-bit / ID4A / PCF7939M / PCF7961M", oemKey: "805673071R / 998108016R" },
  { model: "Dacia Lodgy", years: "2012+", transponder: "Hitag AES 128-bit / ID4A / PCF7939M / PCF7961M", oemKey: "—" },
  { model: "Dacia Logan I", years: "2005–2014", transponder: "Hitag 2 / PCF7936 / PCF7947 / PCF7946 / JMA TP12", oemKey: "—" },
  { model: "Dacia Logan II", years: "2012–2020", transponder: "Hitag AES 128-bit / ID4A / PCF7939M / PCF7961M", oemKey: "805657288R / 805654613R" },
  { model: "Dacia Logan III", years: "2020+", transponder: "Hitag AES / NCF29A / NCF29A1M / PCF7953M", oemKey: "—" },
  { model: "Dacia Sandero I", years: "2007–2014", transponder: "Hitag 2 / PCF7936 / PCF7947 / PCF7946 / JMA TP12", oemKey: "—" },
  { model: "Dacia Sandero II", years: "2012–2020", transponder: "Hitag AES 128-bit / ID4A / PCF7939M / PCF7961M", oemKey: "805657288R / 805654613R" },
  { model: "Dacia Sandero III", years: "2020+", transponder: "Hitag AES / NCF29A / NCF29A1M / PCF7953M", oemKey: "—" },
  { model: "Dacia SuperNova", years: "2000–2003", transponder: "Philips ID33 / PCF7930 / PCF7931 / JMA TP05 / T5 / X27", oemKey: "—" },
  { model: "Dacia Solenza", years: "2003–2005", transponder: "Hitag 2 / PCF7936 / JMA TP12", oemKey: "—" },
];

export function DaciaTransponderPage({ onBack }: DaciaTransponderPageProps) {
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
              <h1 className="text-gray-900">Dacia Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Dacia vehicles
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
                {daciaTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Dacia vehicles (Renault subsidiary) evolved from Philips ID33 in early 2000s to Hitag 2 transponders 
            in the late 2000s. Modern Dacia models (2012+) use advanced Hitag AES 128-bit encryption for enhanced security. 
            The latest generation (2020+) features NCF29A technology.
          </p>
        </div>
      </div>
    </div>
  );
}
