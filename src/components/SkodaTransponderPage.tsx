import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface SkodaTransponderPageProps {
  onBack: () => void;
}

const skodaTransponderData = [
  { model: "Skoda Citygo", years: "2012–", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "3T0837202L, 3T0837202Q" },
  { model: "Skoda Fabia", years: "2000–2007", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Skoda Fabia", years: "2007–2009", transponder: "Megamos Crypto SKODA-CAN", oemKey: "—" },
  { model: "Skoda Fabia", years: "2009–2014", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "Skoda Fabia", years: "2014–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "6V0959752K, 6V0959752M" },
  { model: "Skoda Felicia", years: "1996–1999", transponder: "Philips ID33", oemKey: "—" },
  { model: "Skoda Felicia", years: "1999–2001", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Skoda Kamiq", years: "2019–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "654959752E, 654959752F" },
  { model: "Skoda Karoq", years: "2017–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "6V0959752D, 6V0959752E" },
  { model: "Skoda Kodiaq", years: "2016–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "6V0959752K, 3V0959752G" },
  { model: "Skoda Octavia", years: "1997–2000", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Skoda Octavia", years: "2000–2004", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Skoda Octavia", years: "2004–2009", transponder: "Megamos Crypto SKODA-CAN", oemKey: "—" },
  { model: "Skoda Octavia", years: "2009–2013", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "Skoda Octavia", years: "2013–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "5E0959752D, 5E0959752M" },
  { model: "Skoda Pick-Up", years: "1996–1999", transponder: "Philips ID33", oemKey: "—" },
  { model: "Skoda Pick-Up", years: "1999–2001", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Skoda Praktik", years: "2006–2010", transponder: "Megamos Crypto SKODA-CAN", oemKey: "—" },
  { model: "Skoda Praktik", years: "2010–2015", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "3T0837202L, 3T0837202H" },
  { model: "Skoda Rapid", years: "2012–2015", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "Skoda Rapid", years: "2014–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "5E0959752K, 5E0959752J" },
  { model: "Skoda Roomster", years: "2006–2010", transponder: "Megamos Crypto SKODA-CAN", oemKey: "—" },
  { model: "Skoda Roomster", years: "2010–2015", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "Skoda Scala", years: "2019–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "654959752C, 654959752F" },
  { model: "Skoda Scout", years: "2006–2010", transponder: "Megamos Crypto SKODA-CAN", oemKey: "—" },
  { model: "Skoda Scout", years: "2010–2015", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "Skoda Superb", years: "2002–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Skoda Superb", years: "2006–2009", transponder: "Megamos Crypto SKODA-CAN", oemKey: "—" },
  { model: "Skoda Superb", years: "2009–2014", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
  { model: "Skoda Superb", years: "2015–", transponder: "Megamos Crypto AES (VAG MQB, ID49)", oemKey: "6V0959752D, 3V0959752G" },
  { model: "Skoda Yeti", years: "2009–", transponder: "Megamos Crypto ID48 (precoded, dealer key)", oemKey: "—" },
];

export function SkodaTransponderPage({ onBack }: SkodaTransponderPageProps) {
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
              <h1 className="text-gray-900">Skoda Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Skoda vehicles
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
                {skodaTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Skoda vehicles (Czech Volkswagen Group subsidiary, founded 1895) demonstrate 
            a comprehensive four-generation transponder evolution perfectly aligned with VAG (Volkswagen Auto Group) 
            standards. Mid-1990s models (Felicia, Pick-Up) used basic Philips ID33 transponders representing 
            first-generation immobilizers, with some models transitioning to Megamos 13 (ID13) by the late 1990s 
            (Octavia, Pick-Up). From 2000-2009, Skoda implemented advanced Megamos Crypto 48 (ID48) technology across 
            the lineup (Fabia, Felicia, Octavia, Superb), evolving to SKODA-CAN integration in mid-2000s models 
            (Fabia, Octavia, Praktik, Roomster, Scout, Superb). The 2009-2015 generation introduced precoded dealer 
            keys requiring dealership programming (Citygo, Fabia, Octavia, Praktik, Rapid, Roomster, Scout, Superb, 
            Yeti), with comprehensive OEM documentation for Citygo (3T0837202L/Q) and Praktik (3T0837202L/H). Modern 
            2013+ vehicles use cutting-edge Megamos Crypto AES on the VAG MQB platform (ID49) with extensive OEM key 
            part numbers: Fabia (6V0959752K/M), Kamiq (654959752E/F), Karoq (6V0959752D/E), Kodiaq (6V0959752K and 
            3V0959752G), Octavia (5E0959752D/M), Rapid (5E0959752K/J), Scala (654959752C/F), and Superb (6V0959752D 
            and 3V0959752G). Skoda's alignment with Volkswagen Group standards ensures locksmiths can leverage 
            extensive VAG technical knowledge, making key programming highly systematic and well-documented across 
            all model years and platforms.
          </p>
        </div>
      </div>
    </div>
  );
}
