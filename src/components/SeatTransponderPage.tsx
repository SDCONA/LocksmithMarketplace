import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface SeatTransponderPageProps {
  onBack: () => void;
}

const seatTransponderData = [
  { model: "SEAT Alhambra", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "SEAT Alhambra", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "SEAT Alhambra", years: "2000–2004", transponder: "Philips Crypto ID44 (W3)", oemKey: "—" },
  { model: "SEAT Alhambra", years: "2005–2009", transponder: "Megamos Crypto SEAT-CAN", oemKey: "—" },
  { model: "SEAT Alhambra", years: "2010–", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "SEAT Altea", years: "2004–2009", transponder: "Megamos Crypto SEAT-CAN", oemKey: "—" },
  { model: "SEAT Altea", years: "2010–2015", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "SEAT Ateca", years: "2016–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "575959752J, 575959752C" },
  { model: "SEAT Arosa", years: "1997–1999", transponder: "Philips ID33", oemKey: "—" },
  { model: "SEAT Arosa", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "SEAT Arosa", years: "2001–", transponder: "Philips Crypto ID44 (W3)", oemKey: "—" },
  { model: "SEAT Arona", years: "2017–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "6F0959752N, 6F0959752E" },
  { model: "SEAT Cordoba", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "SEAT Cordoba", years: "1999–2002", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "SEAT Cordoba", years: "2002–2009", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "SEAT Exeo", years: "2009–2014", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "SEAT Ibiza", years: "1995–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "SEAT Ibiza", years: "1998–2002", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "SEAT Ibiza", years: "2002–2004", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "SEAT Ibiza", years: "2004–2009", transponder: "Megamos Crypto SEAT-CAN", oemKey: "—" },
  { model: "SEAT Ibiza", years: "2010–2015", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "SEAT Ibiza", years: "2016–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "5F0959752D, 6F0959752C" },
  { model: "SEAT Inca", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "SEAT Inca", years: "1998–2000", transponder: "Philips Crypto ID42", oemKey: "—" },
  { model: "SEAT Inca", years: "2000–2002", transponder: "Philips Crypto ID44", oemKey: "—" },
  { model: "SEAT Mii", years: "2012–2017", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "SEAT Leon", years: "2000–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "SEAT Leon", years: "2005–2008", transponder: "Megamos Crypto SEAT-CAN", oemKey: "—" },
  { model: "SEAT Leon", years: "2009–2015", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "SEAT Leon", years: "2016–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "575959752AN, 575959752AJ" },
  { model: "SEAT Marbella", years: "1997–1998", transponder: "Temic 11 / Philips ID33", oemKey: "—" },
  { model: "SEAT Toledo", years: "1995–1999", transponder: "Philips ID33", oemKey: "—" },
  { model: "SEAT Toledo", years: "1997–1999", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "SEAT Toledo", years: "2000–2004", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "SEAT Toledo", years: "2005–2009", transponder: "Megamos Crypto SEAT-CAN", oemKey: "—" },
  { model: "SEAT Toledo", years: "2010–2015", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "SEAT Toledo", years: "2016–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "5F0959752F, 5F0959752D" },
];

export function SeatTransponderPage({ onBack }: SeatTransponderPageProps) {
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
              <h1 className="text-gray-900">SEAT Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for SEAT vehicles
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
                {seatTransponderData.map((item, index) => (
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
            <strong>Note:</strong> SEAT vehicles (Spanish Volkswagen Group subsidiary, founded 1950) demonstrate 
            a comprehensive four-generation transponder evolution perfectly aligned with VAG (Volkswagen Auto Group) 
            standards. Mid-1990s models (Alhambra, Arosa, Cordoba, Ibiza, Inca, Marbella, Toledo) used basic 
            Philips ID33 transponders and transitional Temic 11 technology, representing first-generation immobilizers. 
            Late 1990s to early 2000s saw widespread adoption of Philips Crypto ID42 and ID44 (W3) across the entire 
            lineup (Alhambra, Arosa, Cordoba, Ibiza, Inca, Toledo), with some Toledo models uniquely using Megamos 13 
            (ID13). From 2000-2015, SEAT implemented advanced Megamos Crypto 48 (ID48) technology, evolving through 
            standard ID48, SEAT-CAN integration (Alhambra, Altea, Ibiza, Leon, Toledo), and precoded dealer keys 
            (Alhambra, Altea, Exeo, Ibiza, Leon, Mii, Toledo) requiring dealership programming. Modern 2016+ vehicles 
            (Ateca, Arona, Ibiza, Leon, Toledo) use cutting-edge Megamos Crypto AES on the VAG MQB platform (ID49) 
            with comprehensive OEM key documentation (575959752J/C for Ateca, 6F0959752N/E for Arona, 5F0959752D and 
            6F0959752C for Ibiza, 575959752AN/AJ for Leon, 5F0959752F/D for Toledo). SEAT's alignment with Volkswagen 
            Group standards ensures locksmiths can leverage extensive VAG technical knowledge, making key programming 
            highly systematic and well-documented across all model years.
          </p>
        </div>
      </div>
    </div>
  );
}
