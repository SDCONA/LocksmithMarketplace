import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface VolkswagenTransponderPageProps {
  onBack: () => void;
}

const volkswagenTransponderData = [
  { model: "VW Amarok", years: "2010–", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Arteon", years: "2017–", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "3G0959752BT, 3G0959752CB" },
  { model: "VW Atlas", years: "2018–", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "5G6959752BF, 3G0959752S" },
  { model: "VW Beetle", years: "1998–2003", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Beetle", years: "2003–2007", transponder: "Megamos Crypto VW-CAN", oemKey: "—" },
  { model: "VW Beetle", years: "2008–", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Bora", years: "1998–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Caddy", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "VW Caddy", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "VW Caddy", years: "2000–2003", transponder: "Philips Crypto ID44", oemKey: "—" },
  { model: "VW Caddy", years: "2004–2008", transponder: "Megamos Crypto VW-CAN", oemKey: "—" },
  { model: "VW Caddy", years: "2009–2015", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Caddy", years: "2016–", transponder: "Megamos Crypto AES (ID49, MQB) or ID48 (precoded)", oemKey: "—" },
  { model: "VW Caravelle", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "VW Caravelle", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "VW Caravelle", years: "2000–2004", transponder: "Philips Crypto ID44", oemKey: "—" },
  { model: "VW Caravelle", years: "2004–2009", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Caravelle", years: "2008–2016", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Caravelle", years: "2016–", transponder: "Megamos Crypto AES (ID49, MQB) or ID48 (precoded)", oemKey: "—" },
  { model: "VW Crafter", years: "2006–2016", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Crafter", years: "2016–", transponder: "Megamos Crypto AES (ID49, MQB) or ID48 (precoded)", oemKey: "—" },
  { model: "VW EOS", years: "2006–", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Golf", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "VW Golf", years: "1998–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Golf MK5", years: "2003–2007", transponder: "Megamos Crypto ID48 VW-CAN", oemKey: "—" },
  { model: "VW Golf MK6", years: "2008–2015", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Golf MK7", years: "2013–2020", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "5G0959752DD, 5G0959752CA" },
  { model: "VW Jetta", years: "2000–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Jetta", years: "2006–2010", transponder: "Megamos Crypto ID48 VW-CAN", oemKey: "—" },
  { model: "VW Jetta", years: "2009–2018", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Jetta", years: "2019–", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "5G6959752BL, 5G6959752CT" },
  { model: "VW LT", years: "2000–", transponder: "Temic ID12", oemKey: "—" },
  { model: "VW Lupo", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "VW Lupo", years: "2000–", transponder: "Philips Crypto ID44", oemKey: "—" },
  { model: "VW Multivan", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "VW Multivan", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "VW Multivan", years: "2000–2004", transponder: "Philips Crypto ID44", oemKey: "—" },
  { model: "VW Multivan", years: "2004–2009", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Multivan", years: "2008–2016", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Multivan", years: "2016–", transponder: "Megamos Crypto AES (ID49, MQB) or ID48 (precoded)", oemKey: "—" },
  { model: "VW Passat", years: "1995–1997", transponder: "Philips ID33", oemKey: "—" },
  { model: "VW Passat", years: "1997–1999", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "VW Passat", years: "1999–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Passat B6", years: "2006–2010", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "3C0959752AJ, 3C0959752AK" },
  { model: "VW Passat B7", years: "2010–2014", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "3C0959752BE, 3C0959752BG" },
  { model: "VW Passat B8", years: "2014–", transponder: "Megamos Crypto AES (ID49, MQB) or ID48 (precoded)", oemKey: "—" },
  { model: "VW Phaeton", years: "2002–", transponder: "Philips Crypto 2 (ID46)", oemKey: "—" },
  { model: "VW Polo", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "VW Polo", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "VW Polo", years: "2000–2001", transponder: "Philips Crypto ID44", oemKey: "—" },
  { model: "VW Polo", years: "2001–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Polo", years: "2005–2009", transponder: "Megamos Crypto VW-CAN", oemKey: "—" },
  { model: "VW Polo", years: "2009–2015", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Polo", years: "2014–2018", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "5G6959752CF, 5G6959752S" },
  { model: "VW Routan", years: "2009–", transponder: "Philips Crypto 2 (ID46)", oemKey: "7B0959754xx" },
  { model: "VW Scirocco", years: "2008–", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Sharan", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "VW Sharan", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "VW Sharan", years: "2000–2005", transponder: "Philips Crypto ID44", oemKey: "—" },
  { model: "VW Sharan", years: "2001–2006", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Sharan", years: "2007–2010", transponder: "Megamos Crypto VW-CAN", oemKey: "—" },
  { model: "VW Sharan", years: "2010–", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW T-Cross", years: "2019–", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "2G6959752AD, 2G6959752J" },
  { model: "VW Teramont", years: "2019–", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "5G6959752CF, 5G6959752CT" },
  { model: "VW Tiguan", years: "2007–2015", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Tiguan", years: "2015–", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "5G6959752BQ, 5G6959752AP" },
  { model: "VW Touareg", years: "2003–2009", transponder: "Philips Crypto 2 (ID46)", oemKey: "3D0959753G" },
  { model: "VW Touareg", years: "2010–2018", transponder: "Hitag VAG Extended (PCF7945AC)", oemKey: "7P6959754AA" },
  { model: "VW Touran", years: "2003–2006", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Touran", years: "2006–2014", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Touran", years: "2015–2021", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "5G6959752AL" },
  { model: "VW Transporter", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "VW Transporter", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "VW Transporter", years: "2000–2004", transponder: "Philips Crypto ID44", oemKey: "—" },
  { model: "VW Transporter", years: "2004–2009", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "VW Transporter", years: "2008–2016", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
  { model: "VW Transporter", years: "2016–", transponder: "Megamos Crypto AES (ID49, MQB) or ID48 (precoded)", oemKey: "—" },
  { model: "VW T-Roc", years: "2018–", transponder: "Megamos Crypto AES (ID49, MQB)", oemKey: "5G6959752BL, 5G6959752BP" },
  { model: "VW Vento", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "VW Up!", years: "2012–", transponder: "Megamos Crypto ID48 (precoded)", oemKey: "—" },
];

export function VolkswagenTransponderPage({ onBack }: VolkswagenTransponderPageProps) {
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
              <h1 className="text-gray-900">Volkswagen Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Volkswagen vehicles
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
                {volkswagenTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Volkswagen vehicles (German automotive manufacturer, founded 1937, world's 
            second-largest automaker) demonstrate one of the automotive industry's most complex and diverse 
            transponder evolution patterns across seven distinct technology generations spanning nearly three decades. 
            Mid-1990s models (Caddy, Caravelle, Golf, Multivan, Passat, Polo, Sharan, Transporter, Vento) used basic 
            Philips ID33 transponders representing first-generation immobilizers. Late 1990s saw brief adoption of 
            Megamos 13 (ID13) in Passat 1997-1999, followed by widespread transition to Philips Crypto technology 
            (ID42 for 1998-2000, ID44 for 2000-2005) across multiple models (Caddy, Caravelle, Lupo, Multivan, Polo, 
            Sharan, Transporter). From 1998-2005, VW transitioned to Megamos Crypto 48 (ID48) technology across the 
            entire lineup (Beetle, Bora, Caravelle, Golf, Jetta, Multivan, Passat, Polo, Sharan, Transporter), 
            establishing this as the core platform. The 2003-2010 era introduced Megamos Crypto VW-CAN variant 
            representing enhanced CAN-bus integration (Beetle, Caddy, Golf MK5, Jetta, Polo, Sharan). From 2006-2016, 
            VW adopted Megamos Crypto ID48 (precoded) as the standard immobilizer system across most models (Amarok, 
            Beetle, Caddy, Caravelle, Crafter, EOS, Golf MK6, Jetta, Multivan, Passat B6/B7, Polo, Scirocco, Sharan, 
            Tiguan, Touran, Transporter, Up!), creating the most widespread transponder implementation in VW history. 
            Modern 2013+ vehicles transitioned to advanced Megamos Crypto AES (ID49, MQB platform) with comprehensive 
            OEM documentation (Arteon, Atlas, Caddy, Caravelle, Crafter, Golf MK7, Jetta, Multivan, Passat B8, Polo, 
            T-Cross, Teramont, Tiguan, Touran, Transporter, T-Roc), representing cutting-edge encryption technology. 
            Notable exceptions include: Phaeton and Routan using Philips Crypto 2 (ID46), LT using rare Temic ID12, 
            Touareg 2010-2018 using specialized Hitag VAG Extended (PCF7945AC), and market-dependent dual-transponder 
            compatibility in 2016+ commercial vehicles (Caddy, Caravelle, Crafter, Multivan, Passat B8, Transporter) 
            offering both ID49 MQB and ID48 precoded options. Volkswagen's transponder ecosystem represents the 
            industry's most complex implementation requiring locksmiths to navigate seven technology generations 
            (Philips ID33 → Megamos ID13 → Philips Crypto ID42/44 → Megamos Crypto 48 → Megamos VW-CAN → Megamos 
            ID48 precoded → Megamos AES ID49 MQB), with extensive OEM part number documentation (3C0/5G0/5G6/7B0 
            series) and platform-specific variations (MQB architecture), though this complexity demands specialized 
            diagnostic equipment and year-specific identification procedures for accurate transponder programming.
          </p>
        </div>
      </div>
    </div>
  );
}
