import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface PorscheTransponderPageProps {
  onBack: () => void;
}

const porscheTransponderData = [
  { model: "Porsche 911", years: "1998–1999", transponder: "Megamos 13 (ID13)", oemKey: "—" },
  { model: "Porsche 911", years: "1999–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Porsche Boxster 986", years: "1999–2005", transponder: "Megamos Crypto 48 (ID48)", oemKey: "—" },
  { model: "Porsche Boxster 986", years: "2005–2009", transponder: "Philips Crypto 2", oemKey: "—" },
  { model: "Porsche Cayenne", years: "2004–2009", transponder: "Philips Crypto 2", oemKey: "7L5959753" },
  { model: "Porsche Cayenne", years: "2011–", transponder: "Smart key • PCF7945AC", oemKey: "5WK50136" },
  { model: "Porsche Cayman", years: "2009–", transponder: "Philips Crypto 2", oemKey: "—" },
  { model: "Porsche Panamera", years: "2009–", transponder: "Smart key • PCF7945AC", oemKey: "5WK50138" },
];

export function PorscheTransponderPage({ onBack }: PorscheTransponderPageProps) {
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
              <h1 className="text-gray-900">Porsche Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Porsche vehicles
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
                {porscheTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Porsche vehicles demonstrate a three-generation transponder evolution reflecting 
            premium German automotive engineering standards. Late 1990s models (911) used basic Megamos 13 (ID13) 
            transponders. From 1999-2005, Porsche adopted Megamos Crypto 48 (ID48) encryption across the 911 and 
            Boxster 986 lineup, representing the first major security upgrade. The mid-2000s saw a transition to 
            Philips Crypto 2 technology across multiple models including the Boxster 986 (2005-2009), Cayenne 
            (2004-2009), and Cayman (2009+), providing enhanced immobilizer protection. Modern 2009+ luxury models 
            (Cayenne 2011+, Panamera) utilize advanced smart key systems with PCF7945AC chips and documented OEM 
            key numbers (5WK50136 for Cayenne, 5WK50138 for Panamera), representing state-of-the-art keyless entry 
            and push-button start technology. Porsche's limited model range allows for comprehensive documentation 
            and precise transponder specification across all vehicle lines.
          </p>
        </div>
      </div>
    </div>
  );
}
