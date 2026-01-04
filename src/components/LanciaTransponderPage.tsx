import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface LanciaTransponderPageProps {
  onBack: () => void;
}

const lanciaTransponderData = [
  { model: "Lancia Dedra", years: "1995–1997", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Lancia Dedra", years: "1997–1999", transponder: "Temic 11", oemKey: "—" },
  { model: "Lancia Delta", years: "1995–1999", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Lancia Delta (Chrysler)", years: "2008–2014", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Lancia Flavia (Chrysler)", years: "2012–2014", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Lancia K", years: "1995–2001", transponder: "Philips 33 (ID33)", oemKey: "—" },
  { model: "Lancia K Coupe", years: "1997–2001", transponder: "Philips 33 (ID33)", oemKey: "—" },
  { model: "Lancia Lybra", years: "1999–2006", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Lancia Musa", years: "2004–2008", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Lancia Musa", years: "2009–2012", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Lancia Phedra", years: "2002–2011", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Lancia Thema (Chrysler)", years: "2011–2015", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Lancia Thesis", years: "2001–2009", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Lancia Y", years: "1995–2003", transponder: "Temic 11", oemKey: "—" },
  { model: "Lancia Ypsilon", years: "2003–2010", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Lancia Ypsilon", years: "2011+", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Lancia Z 2000", years: "1998+", transponder: "Philips 33 (ID33)", oemKey: "—" },
  { model: "Lancia Voyager (Chrysler)", years: "2011–2016", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
];

export function LanciaTransponderPage({ onBack }: LanciaTransponderPageProps) {
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
              <h1 className="text-gray-900">Lancia Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Lancia vehicles
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
                {lanciaTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Lancia vehicles demonstrate an interesting transponder evolution reflecting both 
            Italian automotive heritage and later Chrysler partnership. Mid-1990s models used diverse technologies: 
            Megamos 13 (ID13) for Dedra and Delta, unique Temic 11 for Dedra and Y, and Philips 33 (ID33) for the 
            flagship K models. The 2000s saw transition to Megamos Crypto 48 (ID48) across multiple models (Lybra, 
            Thesis, Musa, Ypsilon). Following Fiat-Chrysler partnership, later models (2008+) adopted Philips Crypto 2 
            (ID46, Hitag 2), including rebadged Chrysler vehicles: Delta (2008-2014), Flavia, Thema, and Voyager. 
            The Ypsilon shows the complete evolution from Temic 11 (as Y) to Megamos Crypto 48 to modern Philips 
            Crypto 2, representing Lancia's full technological journey.
          </p>
        </div>
      </div>
    </div>
  );
}
