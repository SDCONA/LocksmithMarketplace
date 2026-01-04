import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface HyundaiTransponderPageProps {
  onBack: () => void;
}

const hyundaiTransponderData = [
  { model: "Accent", years: "1996–1999", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Accent", years: "1999–2012", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Accent", years: "2011–2014", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "—" },
  { model: "Accent", years: "2011–2018", transponder: "Texas Crypto DST80 (ID6E)", oemKey: "—" },
  { model: "Accent", years: "2014–2017", transponder: "Philips Crypto 2 (ID46, PCF7952, precoded)", oemKey: "SVI-MDFGE03, 95440-1R700" },
  { model: "Accent", years: "2017+", transponder: "Philips Crypto 3 / Hitag-3 (ID47)", oemKey: "95440-M5300, 95440-J0100" },
  { model: "Amica", years: "1999–2003", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Amica", years: "2003+", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Atos", years: "1997–2000", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Atos", years: "2001+", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Atos Prime", years: "1999–2001", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Atos Prime", years: "2002+", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Azera", years: "2005–2011", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Azera", years: "2012–2017", transponder: "Texas Crypto DST AES", oemKey: "95440-3V035" },
  { model: "Avante", years: "2000–2011", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Avante", years: "2011–2015", transponder: "Texas Crypto DST80 (ID6E) OR Philips Crypto 2 (ID46, PCF7952A)", oemKey: "SY5HMFNA04, 95440-2M350" },
  { model: "Avante", years: "2016+", transponder: "Texas Crypto DST AES", oemKey: "95440-F2000, 95440-F3000" },
  { model: "Coupe", years: "1996–2001", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Coupe", years: "2002–2008", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Creta", years: "2015+", transponder: "Texas Crypto DST AES OR Philips Crypto 3 (Hitag-3)", oemKey: "—" },
  { model: "Elantra", years: "2000–2011", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Elantra", years: "2011–2015", transponder: "Texas Crypto DST80 OR Philips Crypto 2 (ID46, PCF7952A)", oemKey: "SY5HMFNA04, 95440-2M350" },
  { model: "Elantra", years: "2016+", transponder: "Texas Crypto DST AES", oemKey: "95440-F2000, 95440-F3000" },
  { model: "Entourage", years: "2006–2009", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Eon", years: "2011–2019", transponder: "Texas Crypto DST80 (ID6E)", oemKey: "—" },
  { model: "Equus", years: "2011–2019", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "—" },
  { model: "Genesis", years: "2009–2013", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "—" },
  { model: "Genesis", years: "2014+", transponder: "Philips Crypto 3 (Hitag-3)", oemKey: "SY5DHFNA433, 95440-B1210" },
  { model: "Getz", years: "2002–2009", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Grandeur", years: "1998–2005", transponder: "Texas Crypto 4D60", oemKey: "—" },
  { model: "Grandeur", years: "2005–2011", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "Grandeur", years: "2012–2017", transponder: "Texas Crypto DST AES", oemKey: "95440-3V035" },
  { model: "H1 / i800", years: "1999–2006", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "H1 / i800", years: "2006–2010", transponder: "Texas Crypto 4D60", oemKey: "—" },
  { model: "H1 / i800", years: "2007–2016", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "H1 / i800", years: "2016+", transponder: "Texas Crypto DST AES", oemKey: "95430-4H401" },
  { model: "i10", years: "2008–2013", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "i10", years: "2014+", transponder: "Philips Crypto 3 (Hitag-3)", oemKey: "95430-B9500" },
  { model: "i20", years: "2009–2014", transponder: "Philips Crypto 2 (ID46) / PCF7936", oemKey: "—" },
  { model: "i20", years: "2014+", transponder: "Philips Crypto 3 (Hitag-3)", oemKey: "95430-B9100" },
  { model: "i30", years: "2007–2011", transponder: "Philips Crypto (ID46) / PCF7936", oemKey: "—" },
  { model: "i30", years: "2012–2016", transponder: "Texas Crypto DST80 OR Philips Crypto (ID46)", oemKey: "—" },
  { model: "i30", years: "2017+", transponder: "Texas Crypto DST AES OR Philips Crypto 3", oemKey: "—" },
  { model: "Ioniq", years: "2016+", transponder: "Philips Crypto 3 (ID47)", oemKey: "95440-G2100" },
  { model: "Kona", years: "2016+", transponder: "Texas Crypto DST AES OR Philips Crypto 3", oemKey: "95440-J9110" },
  { model: "Santa Fe", years: "2000–2002", transponder: "Texas Crypto 4D60", oemKey: "—" },
  { model: "Santa Fe", years: "2002–2006", transponder: "Philips Crypto (ID46)", oemKey: "—" },
  { model: "Santa Fe", years: "2007–2011", transponder: "Philips Crypto (ID46, precoded)", oemKey: "—" },
  { model: "Santa Fe", years: "2012–2015", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "SY5HMFNA04, 95440-3V021" },
  { model: "Santa Fe", years: "2016+", transponder: "Philips Crypto 3 (Hitag-3)", oemKey: "SY5DMFNA433, 95440-B8100" },
  { model: "Sonata", years: "1996–1998", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Sonata", years: "1998–2004", transponder: "Texas Crypto 4D60", oemKey: "—" },
  { model: "Sonata", years: "2005–2010", transponder: "Philips Crypto (ID46)", oemKey: "—" },
  { model: "Sonata", years: "2011–2014", transponder: "Philips Crypto 2 (ID46, precoded)", oemKey: "SY5HMFNA04" },
  { model: "Sonata", years: "2014+", transponder: "Texas Crypto DST80 OR Philips Crypto (ID46, precoded)", oemKey: "—" },
  { model: "Tucson", years: "2004–2009", transponder: "Philips Crypto (ID46)", oemKey: "—" },
  { model: "Tucson", years: "2009–2014", transponder: "Philips Crypto 2 (ID46, PCF7952A)", oemKey: "SY5HMFNA04" },
  { model: "Tucson", years: "2015+", transponder: "Texas Crypto DST80", oemKey: "95430-D3010" },
  { model: "Veloster", years: "2010+", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Veracruz", years: "2006–2012", transponder: "Philips Crypto (ID46)", oemKey: "—" },
];

export function HyundaiTransponderPage({ onBack }: HyundaiTransponderPageProps) {
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
              <h1 className="text-gray-900">Hyundai Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Hyundai vehicles
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
                {hyundaiTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Hyundai vehicles demonstrate a complex transponder evolution with dual-path 
            development across five generations: early models (1996-2001) used basic Texas 4C (ID4C), late 1990s 
            to mid-2000s adopted Texas Crypto 4D60 for larger vehicles while smaller models used Philips Crypto 
            (ID46 / PCF7936), the 2000s-2010s saw widespread adoption of Philips Crypto and Crypto 2 (ID46) with 
            precoded variants, the 2010s introduced Texas Crypto DST80 (ID6E) alongside Philips systems creating 
            a dual-technology approach, and modern vehicles (2014+) primarily use Texas Crypto DST AES or Philips 
            Crypto 3 / Hitag-3 (ID47) for maximum security. Popular models like Accent, Elantra, and Santa Fe show 
            this dual-path evolution clearly, with many models offering both Texas and Philips options during 
            transition periods.
          </p>
        </div>
      </div>
    </div>
  );
}
