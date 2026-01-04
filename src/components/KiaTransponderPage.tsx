import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface KiaTransponderPageProps {
  onBack: () => void;
}

const kiaTransponderData = [
  { model: "Kia Amanti", years: "2004–2006", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Kia Amanti", years: "2007–2010", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Borrego", years: "2008–2011", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Borrego", years: "2011+", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "—" },
  { model: "Kia Cadenza", years: "2009–2013", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "—" },
  { model: "Kia Cadenza", years: "2013–2016", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "—" },
  { model: "Kia Cadenza", years: "2016–2019", transponder: "Philips Crypto 3", oemKey: "—" },
  { model: "Kia Carens", years: "2001–2005", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Kia Carens", years: "2001–2012", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Carens", years: "2013+", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Kia Carnival", years: "1998–2001", transponder: "Megamos Crypto 48", oemKey: "—" },
  { model: "Kia Carnival", years: "2000–2002", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Kia Carnival", years: "2002–2013", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Carnival", years: "2013–2015", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Kia Carnival", years: "2015–2020", transponder: "Philips Crypto 3", oemKey: "—" },
  { model: "Kia Ceed", years: "2006–2012", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Ceed", years: "2012–2017", transponder: "Texas Crypto DST80 / Philips Crypto 2", oemKey: "—" },
  { model: "Kia Ceed", years: "2018+", transponder: "Philips Crypto 3 / Texas AES", oemKey: "—" },
  { model: "Kia Cerato", years: "2004–2008", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Cerato", years: "2008–2012", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Clarus", years: "1998–2001", transponder: "Megamos 13", oemKey: "—" },
  { model: "Kia Forte", years: "2008–2012", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Joice", years: "1999–2002", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Kia K900", years: "2012+", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "—" },
  { model: "Kia Magentis", years: "2001–2010", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Magentis", years: "2011+", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Mentor", years: "2002–2004", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Mohave", years: "2009–2011", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Mohave", years: "2011+", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "—" },
  { model: "Kia Niro", years: "2016+", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Kia Opirus", years: "2004–2006", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Kia Opirus", years: "2007–2010", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Optima", years: "2001–2010", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Optima", years: "2010–2015", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Optima", years: "2015–2020", transponder: "Philips Crypto 3", oemKey: "—" },
  { model: "Kia Picanto", years: "2003–2011", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Picanto", years: "2011–2017", transponder: "Texas Crypto DST80 / Philips Crypto 2", oemKey: "—" },
  { model: "Kia Picanto", years: "2017+", transponder: "Texas Crypto DST80 / Texas AES", oemKey: "—" },
  { model: "Kia Pride", years: "1999–2000", transponder: "Megamos 13", oemKey: "—" },
  { model: "Kia Retona", years: "1998–2003", transponder: "Megamos Crypto 48 / Texas Crypto 4D", oemKey: "—" },
  { model: "Kia Rio", years: "2001–2005", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Kia Rio", years: "2006–2011", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Rio", years: "2011–2017", transponder: "Texas Crypto DST80 / Philips Crypto 2", oemKey: "—" },
  { model: "Kia Rio", years: "2016+", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Kia Rondo", years: "2006–2012", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Rondo", years: "2013+", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Kia Sedona", years: "2002–2013", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Sedona", years: "2013–2015", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Kia Sedona", years: "2015–2020", transponder: "Philips Crypto 3", oemKey: "—" },
  { model: "Sephia / Shuma", years: "1997–1999", transponder: "Megamos 13", oemKey: "—" },
  { model: "Sephia / Shuma", years: "2000+", transponder: "Megamos Crypto 48 / Texas Crypto 4D", oemKey: "—" },
  { model: "Kia Sorento", years: "2002–2009", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Sorento", years: "2010–2014", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Sorento", years: "2014–2017", transponder: "Texas Crypto DST80 / Philips Crypto 2", oemKey: "—" },
  { model: "Kia Sorento", years: "2018+", transponder: "Philips Crypto 3", oemKey: "—" },
  { model: "Kia Soul", years: "2008–2013", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Soul", years: "2014+", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Kia Spectra", years: "2005–2009", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Sportage", years: "1996–1998", transponder: "Megamos 13", oemKey: "—" },
  { model: "Kia Sportage", years: "1999–2001", transponder: "Megamos Crypto 48", oemKey: "—" },
  { model: "Kia Sportage", years: "2001–2002", transponder: "Texas Crypto 4D (ID60)", oemKey: "—" },
  { model: "Kia Sportage", years: "2004–2010", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Sportage", years: "2010–2015", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Sportage", years: "2014–2017", transponder: "Texas Crypto DST80 / Philips Crypto 2", oemKey: "—" },
  { model: "Kia Sportage", years: "2018+", transponder: "Philips Crypto 3 / Texas AES", oemKey: "—" },
  { model: "Kia Stinger", years: "2018+", transponder: "Philips Crypto 3 / Texas AES", oemKey: "—" },
  { model: "Kia Stonic", years: "2017+", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Kia Venga", years: "2009–2014", transponder: "Philips Crypto 2 (ID46, Hitag 2)", oemKey: "—" },
  { model: "Kia Venga", years: "2014+", transponder: "Texas Crypto DST80 / Philips Crypto 2", oemKey: "—" },
];

export function KiaTransponderPage({ onBack }: KiaTransponderPageProps) {
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
              <h1 className="text-gray-900">Kia Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Kia vehicles
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
                {kiaTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Kia vehicles demonstrate a comprehensive transponder evolution across five distinct 
            generations: late 1990s models (Clarus, Pride, early Sportage) used basic Megamos 13, late 1990s to early 
            2000s saw transition to Megamos Crypto 48 and Texas Crypto 4D (ID60), mid-2000s to early 2010s adopted 
            widespread Philips Crypto 2 (ID46, Hitag 2) across nearly all model lines, 2011-2017 models transitioned 
            to Texas Crypto DST80 (often with dual compatibility), and modern 2015+ vehicles use advanced Philips 
            Crypto 3 and Texas AES technologies. Notable patterns: flagship models (Amanti, Opirus, Cadenza, K900) 
            often adopted new technologies first, popular models (Sportage, Sorento, Rio, Ceed) show the complete 
            evolution through all generations, and many 2012-2017 models offered dual transponder support during the 
            transition period. The Sportage specifically demonstrates all five generations from 1996 to present.
          </p>
        </div>
      </div>
    </div>
  );
}