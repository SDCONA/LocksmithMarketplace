import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface RoverTransponderPageProps {
  onBack: () => void;
}

const roverTransponderData = [
  { model: "Rover 400", years: "1997–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Rover 416", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Rover 600", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Rover 618", years: "1996–1999", transponder: "Philips ID33", oemKey: "—" },
  { model: "Rover 620", years: "1996–1999", transponder: "Philips ID33", oemKey: "—" },
  { model: "Rover 800", years: "1996–1998", transponder: "Philips ID33", oemKey: "—" },
  { model: "Rover 75", years: "1999–2003", transponder: "Philips ID33", oemKey: "—" },
  { model: "Rover 75", years: "2003–2005", transponder: "Philips ID73", oemKey: "—" },
  { model: "Rover 45", years: "2000–2005", transponder: "Philips ID73", oemKey: "—" },
];

export function RoverTransponderPage({ onBack }: RoverTransponderPageProps) {
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
              <h1 className="text-gray-900">Rover Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Rover vehicles
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
                {roverTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Rover vehicles (British automotive marque, ceased production 2005) demonstrate 
            a two-generation transponder evolution reflecting the brand's final years. Mid-1990s models (400, 416, 
            600, 618, 620, 800) used basic Philips ID33 transponders, representing the first generation of 
            immobilizer technology. The flagship 75 model began with ID33 (1999-2003) before transitioning to the 
            more advanced Philips ID73 in its final years (2003-2005). The 45 model (2000-2005) exclusively used 
            Philips ID73, representing the brand's most modern security implementation before ceasing production. 
            Rover's compact model lineup and limited production years make transponder documentation straightforward 
            for locksmiths working with these classic British vehicles. The brand's heritage continues through 
            MG Rover successor vehicles and the automotive aftermarket.
          </p>
        </div>
      </div>
    </div>
  );
}
