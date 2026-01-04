import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface ToyotaTransponderPageProps {
  onBack: () => void;
}

const toyotaTransponderData = [
  { model: "Toyota Alphard", years: "2003–2005", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Alphard", years: "2006–2014", transponder: "Texas Crypto 4D (ID67)", oemKey: "89904-28091, 89904-28090" },
  { model: "Toyota Alphard", years: "2015–", transponder: "Texas Crypto DST-AES (ID74/75)", oemKey: "89904-58360" },
  { model: "Toyota Aqua", years: "2012–2015", transponder: "Texas Crypto DST80 (ID72)", oemKey: "HYQ14FBA, 89904-0E091" },
  { model: "Toyota Aurion", years: "2006–2010", transponder: "Texas Crypto 4D (ID67)", oemKey: "89904-33100" },
  { model: "Toyota Aurion", years: "2011–2017", transponder: "Texas Crypto DST-AES", oemKey: "89904-33460" },
  { model: "Toyota Auris", years: "2006–2009", transponder: "Texas Crypto 4D (ID67/70)", oemKey: "—" },
  { model: "Toyota Auris", years: "2010–2012", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Toyota Auris", years: "2013–", transponder: "Texas Crypto DST-AES", oemKey: "89904-0D130" },
  { model: "Toyota Avalon", years: "1999–2004", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Avalon", years: "2005–2012", transponder: "Texas Crypto 4D (ID67)", oemKey: "89904-06041" },
  { model: "Toyota Avalon", years: "2013–2017", transponder: "Texas Crypto DST-AES", oemKey: "89904-33450" },
  { model: "Toyota Avalon", years: "2018–", transponder: "DST-AES (AA Keys)", oemKey: "—" },
  { model: "Toyota Avanza", years: "2004–2010", transponder: "Texas Crypto 4D (ID67)", oemKey: "—" },
  { model: "Toyota Avanza", years: "2010–2013", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Toyota Avanza", years: "2014–", transponder: "Texas Crypto DST-AES", oemKey: "—" },
  { model: "Toyota Avensis", years: "1997–2000", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Avensis", years: "2000–2003", transponder: "Texas Crypto 4D60", oemKey: "—" },
  { model: "Toyota Avensis", years: "2004–2010", transponder: "Texas Crypto 4D (ID70)", oemKey: "—" },
  { model: "Toyota Avensis", years: "2010–", transponder: "Texas Crypto DST80", oemKey: "89904-60A50" },
  { model: "Toyota Aygo", years: "2005–2013", transponder: "Texas Crypto 4D (ID70)", oemKey: "—" },
  { model: "Toyota Aygo", years: "2014–", transponder: "Texas Crypto DST-AES", oemKey: "89904-0H010" },
  { model: "Toyota Aygo X", years: "2022–", transponder: "Hitag AES (BA Keys)", oemKey: "—" },
  { model: "Toyota bZ4X", years: "2022–", transponder: "DST-AES (BA Keys)", oemKey: "—" },
  { model: "Toyota Camry", years: "1998–2004", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Camry", years: "2003–2010", transponder: "Texas Crypto 4D (ID67)", oemKey: "—" },
  { model: "Toyota Camry", years: "2011–2013", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Toyota Camry", years: "2013–2017", transponder: "Texas Crypto DST-AES", oemKey: "89070-06420" },
  { model: "Toyota Camry", years: "2018–", transponder: "DST-AES (A9 Keys)", oemKey: "—" },
  { model: "Toyota Corolla", years: "1996–2003", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Corolla", years: "2002–2007", transponder: "Texas Crypto 4D (ID67/70)", oemKey: "—" },
  { model: "Toyota Corolla", years: "2008–2012", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Toyota Corolla", years: "2013–2017", transponder: "Texas Crypto DST-AES", oemKey: "89070-02880" },
  { model: "Toyota Corolla", years: "2018–2021", transponder: "Hitag AES (AA Keys)", oemKey: "—" },
  { model: "Toyota Corolla (E210)", years: "2022–", transponder: "Hitag AES (BA Keys)", oemKey: "—" },
  { model: "Corolla Cross", years: "2022–", transponder: "Hitag AES (BA Keys)", oemKey: "8990H-0A020" },
  { model: "Corolla GR", years: "2022–", transponder: "Hitag AES (BA Keys)", oemKey: "—" },
  { model: "Toyota Highlander", years: "2001–2003", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Highlander", years: "2004–2009", transponder: "Texas Crypto 4D (ID67)", oemKey: "—" },
  { model: "Toyota Highlander", years: "2008–2013", transponder: "Texas Crypto DST80", oemKey: "89904-48A80" },
  { model: "Toyota Highlander", years: "2014–2017", transponder: "Texas Crypto DST-AES", oemKey: "89904-48F01" },
  { model: "Toyota Highlander", years: "2018–", transponder: "DST-AES (AA Keys)", oemKey: "—" },
  { model: "Toyota Hilux", years: "1999–2004", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Hilux", years: "2005–2009", transponder: "Texas Crypto 4D (ID67/70)", oemKey: "—" },
  { model: "Toyota Hilux", years: "2009–2014", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Toyota Hilux", years: "2015–", transponder: "Texas Crypto DST-AES", oemKey: "89904-0K051" },
  { model: "Toyota Land Cruiser", years: "1997–2003", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Land Cruiser", years: "2002–2009", transponder: "Texas Crypto 4D (ID67)", oemKey: "—" },
  { model: "Toyota Land Cruiser", years: "2008–2015", transponder: "Texas Crypto DST80", oemKey: "89904-0R060" },
  { model: "Toyota Land Cruiser", years: "2015–2020", transponder: "Texas Crypto DST-AES", oemKey: "89904-60N10" },
  { model: "Toyota Land Cruiser (J300)", years: "2021–", transponder: "DST-AES (BA Keys)", oemKey: "—" },
  { model: "Toyota Prius", years: "1998–2003", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Prius", years: "2004–2009", transponder: "Texas Crypto 4D (ID67)", oemKey: "89994-47061" },
  { model: "Toyota Prius", years: "2010–2015", transponder: "Texas Crypto DST80", oemKey: "89904-47230" },
  { model: "Toyota Prius", years: "2015–2017", transponder: "Texas Crypto DST-AES", oemKey: "89904-47460" },
  { model: "Toyota Prius", years: "2018–2021", transponder: "DST-AES (A9 Keys)", oemKey: "—" },
  { model: "Toyota Prius", years: "2022–", transponder: "DST-AES (BA Keys)", oemKey: "—" },
  { model: "Toyota RAV4", years: "1996–2004", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota RAV4", years: "2005–2010", transponder: "Texas Crypto 4D (ID67/70)", oemKey: "89070-42660" },
  { model: "Toyota RAV4", years: "2010–2012", transponder: "Texas Crypto DST80", oemKey: "89070-0R050" },
  { model: "Toyota RAV4", years: "2013–2017", transponder: "Texas Crypto DST-AES", oemKey: "89904-42180" },
  { model: "Toyota RAV4", years: "2018–2021", transponder: "DST-AES (AA Keys)", oemKey: "—" },
  { model: "Toyota RAV4 (XA50)", years: "2022–", transponder: "DST-AES (BA Keys)", oemKey: "—" },
  { model: "Toyota Tacoma", years: "2005–2010", transponder: "Texas Crypto 4D (ID67)", oemKey: "—" },
  { model: "Toyota Tacoma", years: "2010–2015", transponder: "Texas Crypto DST80", oemKey: "—" },
  { model: "Toyota Tacoma", years: "2015–", transponder: "Texas Crypto DST-AES", oemKey: "89070-0R130" },
  { model: "Toyota Yaris", years: "1999–2005", transponder: "Texas 4C", oemKey: "—" },
  { model: "Toyota Yaris", years: "2005–2011", transponder: "Texas Crypto 4D (ID67/70)", oemKey: "89070-52850" },
  { model: "Toyota Yaris", years: "2011–2018", transponder: "Texas Crypto DST80", oemKey: "89070-35170" },
  { model: "Toyota Yaris", years: "2017–2019", transponder: "Philips Crypto 3", oemKey: "WAZSKE13D01" },
  { model: "Toyota Yaris (XP210)", years: "2020–", transponder: "Hitag AES (BA Keys)", oemKey: "—" },
  { model: "Yaris Cross", years: "2021–", transponder: "Hitag AES (BA Keys)", oemKey: "—" },
  { model: "Yaris GR", years: "2021–", transponder: "Hitag AES (BA Keys)", oemKey: "—" },
];

export function ToyotaTransponderPage({ onBack }: ToyotaTransponderPageProps) {
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
              <h1 className="text-gray-900">Toyota Transponder Fitment</h1>
              <p className="text-sm text-gray-600">
                Complete transponder reference for Toyota vehicles
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
                {toyotaTransponderData.map((item, index) => (
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
            <strong>Note:</strong> Toyota vehicles (Japanese automotive manufacturer, founded 1937, world's largest 
            automaker) demonstrate the industry's most comprehensive and well-documented transponder evolution across 
            seven distinct generations spanning nearly three decades. Late 1990s to early 2000s models (Alphard, 
            Avalon, Avensis, Camry, Corolla, Highlander, Hilux, Land Cruiser, Prius, RAV4, Yaris) used basic Texas 4C 
            transponders representing first-generation immobilizers. Early 2000s saw brief adoption of Texas Crypto 4D60 
            in select models (Avensis 2000-2003). From 2002-2010, Toyota transitioned to Texas Crypto 4D technology 
            with dual variants ID67 and ID70 across the entire lineup, with extensive OEM documentation (Alphard, 
            Aurion, Auris, Avalon, Avanza, Avensis, Aygo, Camry, Corolla, Highlander, Hilux, Land Cruiser, Prius, RAV4, 
            Tacoma, Yaris). The 2008-2015 era introduced Texas Crypto DST80 (ID72) representing third-generation 
            technology (Aqua, Auris, Avanza, Avensis, Camry, Corolla, Highlander, Hilux, Land Cruiser, Prius, RAV4, 
            Tacoma, Yaris). From 2013-2021, Toyota adopted advanced Texas Crypto DST-AES (ID74/75) across the lineup 
            with comprehensive part number documentation (Alphard, Aurion, Auris, Avalon, Avanza, Aygo, Camry, Corolla, 
            Highlander, Hilux, Land Cruiser, Prius, RAV4, Tacoma). Modern 2018-2022 vehicles transitioned to proprietary 
            DST-AES systems using generation-specific key codes (A9 Keys for Camry/Prius 2018-2021, AA Keys for 
            Avalon/Corolla/Highlander/RAV4 2018-2021, BA Keys for newest 2021-2022+ models including bZ4X, Corolla E210, 
            Land Cruiser J300, Prius, RAV4 XA50). Latest 2020+ models introduce cutting-edge Hitag AES technology 
            exclusively using BA Keys (Aygo X, Corolla 2018-2021 and E210 2022+, Corolla Cross, Corolla GR, Yaris 
            XP210, Yaris Cross, Yaris GR). One notable exception: Yaris 2017-2019 uniquely used Philips Crypto 3 
            (WAZSKE13D01), representing Toyota's rare deviation from Texas Instruments technology. Toyota's industry-leading 
            documentation with comprehensive OEM part numbers (89xxx series) and systematic technology progression makes 
            this manufacturer the gold standard for locksmith transponder reference, though the complexity of seven 
            overlapping transponder generations (Texas 4C → 4D60 → 4D67/70 → DST80 → DST-AES → DST-AES with key 
            generations → Hitag AES) requires careful year-based identification and specialized programming equipment 
            for each technology tier.
          </p>
        </div>
      </div>
    </div>
  );
}
