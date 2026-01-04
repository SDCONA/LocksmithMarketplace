import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface LexusTransponderPageProps {
  onBack: () => void;
}

const lexusTransponderData = [
  { model: "Lexus CT 200h", years: "2011–2018", transponder: "Texas Crypto 4D (80-bit, ID6B)", oemKey: "—" },
  { model: "Lexus ES 300", years: "1998–2003", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus ES 330", years: "2004–2007", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus ES 350", years: "2006–2012", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus ES 350", years: "2013+", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus ES 350h", years: "2019–2020", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus GS 300", years: "1998–2005", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus GS 300", years: "2005–2008", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus GS 350", years: "2007–2012", transponder: "Texas Crypto 4D (4D67 / 4D68)", oemKey: "—" },
  { model: "Lexus GS 350", years: "2013+", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus GS 400", years: "1998–2001", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus GS 430", years: "2001–2005", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus GS 430", years: "2005–2007", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus GS 450h", years: "2007–2012", transponder: "Texas Crypto 4D (4D67 / 4D68)", oemKey: "—" },
  { model: "Lexus GS 450h", years: "2013–2018", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus GS 460", years: "2007–2011", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus GX 460", years: "2010–2019", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus GX 470", years: "2003–2009", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus HS 250h", years: "2010+", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus IS 200", years: "1999–2005", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus IS 220d", years: "2005+", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus IS 250", years: "2006–2013", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus IS 250", years: "2014+", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus IS 300", years: "2001–2005", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus IS 300", years: "2016+", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus IS 350", years: "2006–2013", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus IS 350", years: "2014+", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus IS-C", years: "2009–2014", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus IS-F", years: "2007–2012", transponder: "Texas Crypto 4D (4D67 / 4D68)", oemKey: "—" },
  { model: "Lexus LC 500", years: "2018–2022", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus LC 500h", years: "2018–2022", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus LS / LS200", years: "1999–2001", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus LS / LS400", years: "1997–2003", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus LS / LS430", years: "2001–2007", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus LS / LS460", years: "2007–2012", transponder: "Texas Crypto 4D (4D67 / 4D68)", oemKey: "—" },
  { model: "Lexus LS / LS460", years: "2013–2017", transponder: "Texas Crypto 4D (4D67 / 4D68)", oemKey: "—" },
  { model: "Lexus LS / LS500", years: "2018–2021", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus LS 500h", years: "2018–2021", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus LS 600h", years: "2007–2009", transponder: "Texas Crypto 4D (4D67 / 4D68)", oemKey: "—" },
  { model: "Lexus LS 600h", years: "2013–2017", transponder: "Texas Crypto 4D (4D67 / 4D68)", oemKey: "—" },
  { model: "Lexus LX / LX450", years: "1998–1999", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus LX / LX470", years: "1999–2002", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus LX / LX470", years: "2002–2007", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus LX / LX470", years: "2009–2011", transponder: "Texas Crypto 4D (4D67 / 4D68)", oemKey: "—" },
  { model: "Lexus LX / LX570", years: "2008–2014", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus LX / LX570", years: "2014–2021", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus NX 200", years: "2015–2021", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus NX 200t", years: "2015–2021", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus NX 300", years: "2015–2021", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus NX 300h", years: "2015–2021", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus RC 200t", years: "2015+", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus RC 300", years: "2015+", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus RC 350", years: "2015+", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus RX 300", years: "1999–2003", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus RX 300", years: "2004–2007", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus RX 350", years: "2007–2009", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus RX 350", years: "2010–2015", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus RX 350", years: "2015–2021", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus RX 400h", years: "2005–2009", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus RX 450h", years: "2010–2015", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
  { model: "Lexus RX 450h", years: "2015–2022", transponder: "Texas Crypto DST AES (128-bit)", oemKey: "—" },
  { model: "Lexus SC 300", years: "1998–2003", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus SC 400", years: "1998–2003", transponder: "Texas 4C (ID4C)", oemKey: "—" },
  { model: "Lexus SC 430", years: "2002–2010", transponder: "Texas Crypto 4D (4D68)", oemKey: "—" },
];

export function LexusTransponderPage({ onBack }: LexusTransponderPageProps) {
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
              <h1 className="text-gray-900">Lexus Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Lexus vehicles
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
                {lexusTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Lexus vehicles demonstrate a clear three-generation transponder evolution 
            reflecting Toyota's luxury division's commitment to security advancement. Late 1990s to early 2000s 
            models across all lines (ES, GS, IS, LS, LX, RX, SC) used basic Texas 4C (ID4C) transponders. The 
            mid-2000s saw a comprehensive transition to Texas Crypto 4D (4D68), with flagship and performance 
            models also using enhanced 4D67 variants. From 2010-2015, depending on the model line, Lexus began 
            adopting advanced Texas Crypto DST AES (128-bit) encryption, with earlier adoption on hybrid models 
            (HS 250h from 2010). By 2015, all new model lines (NX, RC) and refreshed models (RX, IS, ES) 
            standardized on DST AES technology, representing state-of-the-art automotive key security. The CT 200h 
            uniquely used an 80-bit variant (ID6B) during its production run.
          </p>
        </div>
      </div>
    </div>
  );
}
