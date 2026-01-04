import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface VolvoTransponderPageProps {
  onBack: () => void;
}

const volvoTransponderData = [
  { model: "Volvo 850", years: "1996–1997", transponder: "Philips ID73 (PCF7930 / PCF7931)", oemKey: "—" },
  { model: "Volvo 940", years: "1996–1998", transponder: "Philips ID73 (PCF7930 / PCF7931)", oemKey: "—" },
  { model: "Volvo 960", years: "1996–1998", transponder: "Philips ID73 (PCF7930 / PCF7931)", oemKey: "—" },
  { model: "Volvo C70", years: "1997–1998", transponder: "Philips ID73 (PCF7930 / PCF7931)", oemKey: "—" },
  { model: "Volvo C70", years: "1998–2005", transponder: "Philips Crypto ID44 (PCF7935)", oemKey: "—" },
  { model: "Volvo C70", years: "2006–2013", transponder: "Megamos Crypto 48 (ID48)", oemKey: "KR55WK49250, 31252739" },
  { model: "Volvo Polar", years: "1996–1998", transponder: "Philips ID73 (PCF7930 / PCF7931)", oemKey: "—" },
  { model: "Volvo S40", years: "1996–1998", transponder: "Philips ID73 (PCF7930 / PCF7931)", oemKey: "—" },
  { model: "Volvo S40", years: "1998–2004", transponder: "Philips Crypto ID44 (PCF7935)", oemKey: "—" },
  { model: "Volvo S40", years: "2004–2012", transponder: "Megamos Crypto 48 (ID48)", oemKey: "30772187, 30667905" },
  { model: "Volvo S60", years: "2000–2010", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Volvo S60", years: "2010–2018", transponder: "Hitag 2 ID46 (PCF7953A)", oemKey: "30659502, 30659637" },
  { model: "Volvo S60", years: "2018–", transponder: "Texas Crypto AES", oemKey: "31652610, 32256983" },
  { model: "Volvo S70", years: "1997–1998", transponder: "Philips ID73 (PCF7930 / PCF7931)", oemKey: "—" },
  { model: "Volvo S70", years: "1998–2000", transponder: "Philips Crypto ID44 (PCF7935)", oemKey: "—" },
  { model: "Volvo S80", years: "1998–1999", transponder: "Philips Crypto ID44 (PCF7935)", oemKey: "—" },
  { model: "Volvo S80", years: "1999–2007", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Volvo S80", years: "2006–2016", transponder: "Hitag 2 ID46 (PCF7953A)", oemKey: "30659502, 30659637" },
  { model: "Volvo S90", years: "2017–", transponder: "Texas Crypto AES", oemKey: "31652607, 32256986" },
  { model: "Volvo V40", years: "1996–1998", transponder: "Philips ID73 (PCF7930 / PCF7931)", oemKey: "—" },
  { model: "Volvo V40", years: "1998–2004", transponder: "Philips Crypto ID44 (PCF7935)", oemKey: "—" },
  { model: "Volvo V40", years: "2012–2016", transponder: "Hitag 2 ID46 (PCF7953A)", oemKey: "30659502, 30659637" },
  { model: "Volvo V50", years: "2004–2012", transponder: "Megamos Crypto 48 (ID48)", oemKey: "30772187, 30667905" },
  { model: "Volvo V60", years: "2011–2018", transponder: "Hitag 2 ID46 (PCF7953)", oemKey: "30659502, 30659637" },
  { model: "Volvo V60", years: "2019–", transponder: "Texas Crypto AES", oemKey: "31652607, 32256986" },
  { model: "Volvo V70", years: "1996–1999", transponder: "Philips ID73 (PCF7930 / PCF7931)", oemKey: "—" },
  { model: "Volvo V70", years: "1999–2000", transponder: "Philips Crypto ID44 (PCF7935)", oemKey: "—" },
  { model: "Volvo V70", years: "2000–2007", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Volvo V70", years: "2007–2016", transponder: "Hitag 2 ID46 (PCF7953A)", oemKey: "30659502, 30659637" },
  { model: "Volvo V90", years: "2016–", transponder: "Texas Crypto AES", oemKey: "31652607, 32256986" },
  { model: "Volvo XC40", years: "2020–", transponder: "Texas Crypto AES", oemKey: "31652607, 32256986" },
  { model: "Volvo XC60", years: "2008–2017", transponder: "Hitag 2 ID46 (PCF7953A)", oemKey: "30659502, 30659637" },
  { model: "Volvo XC60", years: "2016–", transponder: "Texas Crypto AES", oemKey: "31652607, 32256986" },
  { model: "Volvo XC70", years: "2000–2007", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Volvo XC70", years: "2007–2016", transponder: "Hitag 2 ID46 (PCF7953A)", oemKey: "30659502, 30659637" },
  { model: "Volvo XC90", years: "2003–2015", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Volvo XC90", years: "2015–", transponder: "Texas Crypto AES", oemKey: "31652607, 32256986" },
  { model: "Volvo FM (truck)", years: "1998–", transponder: "Philips Crypto ID44 (PCF7935)", oemKey: "—" },
  { model: "Volvo FH12 (truck)", years: "1998–2010", transponder: "Philips Crypto ID44 (PCF7935)", oemKey: "—" },
  { model: "Volvo SX12 (truck)", years: "2007–", transponder: "Philips Crypto ID44 (PCF7935)", oemKey: "—" },
];

export function VolvoTransponderPage({ onBack }: VolvoTransponderPageProps) {
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
              <h1 className="text-gray-900">Volvo Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Volvo vehicles
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
                {volvoTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Volvo vehicles (Swedish automotive manufacturer, founded 1927, premium safety-focused 
            brand) demonstrate a comprehensive five-generation transponder evolution across both passenger vehicles and 
            commercial trucks spanning nearly three decades. Mid-1990s models (850, 940, 960, C70, Polar, S40, S70, V40, 
            V70) used distinctive Philips ID73 (PCF7930/PCF7931) transponders representing first-generation immobilizers, 
            a technology unique to Volvo and rarely found in other manufacturers. Late 1990s to early 2000s saw widespread 
            transition to Philips Crypto ID44 (PCF7935) across the entire lineup (C70, S40, S70, S80, V40, V70) and 
            commercial truck division (FM, FH12, SX12 models from 1998 onwards), establishing this as Volvo's core 
            transponder platform for nearly a decade. From 2000-2015, Volvo adopted Megamos Crypto 48 (ID48) technology 
            across passenger vehicles (C70, S40, S60, S80, V50, V70, XC70, XC90) with comprehensive OEM documentation 
            (30772187, 30667905, 31252739 series and KR55WK49250). The 2006-2018 era introduced Hitag 2 ID46 (PCF7953/PCF7953A) 
            representing enhanced encryption (S60, S80, V40, V60, V70, XC60, XC70), with standardized OEM part numbers 
            (30659502, 30659637) simplifying identification and replacement procedures. Modern 2015+ vehicles transitioned 
            to advanced Texas Crypto AES technology (S60, S90, V60, V90, XC40, XC60, XC90), with consistent OEM documentation 
            (31652607, 31652610, 32256983, 32256986 series) representing cutting-edge immobilizer encryption. Volvo's 
            commercial truck division maintains legacy Philips Crypto ID44 (PCF7935) technology across FM (1998+), FH12 
            (1998-2010), and SX12 (2007+) models, prioritizing long-term parts availability and service simplicity in 
            commercial fleet operations. Volvo's transponder ecosystem represents a progressive evolution through five 
            distinct technology tiers (Philips ID73 → Philips Crypto ID44 → Megamos Crypto 48 → Hitag 2 ID46 → Texas 
            Crypto AES) with excellent OEM documentation and standardized part numbering, though locksmiths must maintain 
            compatibility with specialized Philips ID73 technology for 1996-1998 models and recognize the distinct 
            transponder pathways between passenger vehicles (progressive technology upgrades) and commercial trucks 
            (stable Philips Crypto ID44 platform).
          </p>
        </div>
      </div>
    </div>
  );
}
