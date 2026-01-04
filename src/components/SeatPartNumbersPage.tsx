import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface SeatPartNumbersPageProps {
  onBack: () => void;
}

export function SeatPartNumbersPage({ onBack }: SeatPartNumbersPageProps) {
  const seatData = [
    {
      model: "SEAT ALHAMBRA",
      years: "1996-1997",
      parts: [
        "7M0837219B / 433MHz / 2-BUTTONS",
        "7M0837219C / 433MHz / 2-BUTTONS",
        "7M0837219T / 433MHz / 2-BUTTONS",
        "7M0837219BG / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT ALHAMBRA",
      years: "1997-2001",
      parts: [
        "6K0959753B / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT ALHAMBRA",
      years: "2001-2010",
      parts: [
        "6K0959753B / 433MHz / 2-BUTTONS",
        "7M3959753F / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT ALHAMBRA",
      years: "2011-2015",
      parts: [
        "7N5837202D / 434MHz / 3-BUTTONS",
        "6J0837202E / 434MHz / 3-BUTTONS",
        "7N5837202S / 434MHz / WITH KESSY",
        "7N5837202T / 434MHz / WITH KESSY",
        "7N5837202E / 434MHz / E.S.DOORS",
        "7N5837202K / 434MHz / E.S.DOORS"
      ]
    },
    {
      model: "SEAT ALHAMBRA",
      years: "2016-2021",
      parts: [
        "6J0837202G / 434MHz / 3-BUTTONS",
        "7N5837202P / 434MHz / 3-BUTTONS",
        "7N5837202AJ / 434MHz / 3-BUTTONS",
        "7N5837202AM / 434MHz / 3-BUTTONS",
        "7N5837202R / 434MHz / WITH KESSY",
        "7N5837202Q / 434MHz / WITH KESSY",
        "7N5837202AK / 434MHz / WITH KESSY",
        "7N5837202AL / 434MHz / WITH KESSY"
      ]
    },
    {
      model: "SEAT ALTEA",
      years: "2004-2009",
      parts: [
        "1K0959753G / 433MHz / 3-BUTTONS",
        "1K0959753H / 315MHz / 3-BUTTONS",
        "5P0959753A / 315MHz / 2-BUTTONS",
        "5P0959753D / 315MHz / 2-BUTTONS",
        "5P0959753B / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT ALTEA",
      years: "2010-2015",
      parts: [
        "7N5837202D / 434MHz / 3-BUTTONS",
        "7N5837202H / 434MHz / 3-BUTTONS",
        "6J0837202E / 434MHz / 3-BUTTONS",
        "6J0837202B / 315MHz / 3-BUTTONS",
        "6J0837202D / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT AROSA",
      years: "1997-2005",
      parts: [
        "1M0959753C / 433MHz / 2-BUTTONS",
        "1M0959753E / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT ARONA",
      years: "2017-2021",
      parts: [
        "6F0959752L / 434MHz / 3-BUTTONS",
        "6F0959752N / 434MHz / 3-BUTTONS",
        "6F0959752P / 434MHz / 3-BUTTONS",
        "6F0959752C / 315MHz / 4-BUTTONS",
        "6F0959752E / 315MHz / 4-BUTTONS"
      ]
    },
    {
      model: "SEAT ATECA",
      years: "2016-2021",
      parts: [
        "575959752J / 434MHz / 3-BUTTONS",
        "575959752B / 434MHz / 3-BUTTONS",
        "575959752L / 434MHz / 3-BUTTONS",
        "575959752AL / 434MHz / 3-BUTTONS",
        "575959752AP / 434MHz / 3-BUTTONS",
        "575959752AQ / 434MHz / 3-BUTTONS",
        "575959752C / 315MHz / 4-BUTTONS",
        "575959752K / 315MHz / 4-BUTTONS"
      ]
    },
    {
      model: "SEAT CORDOBA",
      years: "1997-2002",
      parts: [
        "6K0959753B / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT CORDOBA",
      years: "2003-2009",
      parts: [
        "1M0959753E / 433MHz / 2-BUTTONS",
        "1J0959753CT / 433MHz / 2-BUTTONS",
        "1J0959753DD / 315MHz / 2-BUTTONS",
        "1J0959753AL / 315MHz / 3+1 BUTTONS",
        "1J0959753DB / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "SEAT EXEO",
      years: "2008-2013",
      parts: [
        "3R0837220 / 433MHz / 3-BUTTONS",
        "3R0837220A / 433MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT IBIZA",
      years: "1997-2001",
      parts: [
        "6K0959753B / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT IBIZA",
      years: "2002-2010",
      parts: [
        "1M0959753E / 433MHz / 2-BUTTONS",
        "1J0959753CT / 433MHz / 2-BUTTONS",
        "1J0959753DD / 315MHz / 2-BUTTONS",
        "1J0959753AL / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "SEAT IBIZA",
      years: "2010-2012",
      parts: [
        "1K0959753N / 434MHz / 3-BUTTONS",
        "7N5837202 / 434MHz / 3-BUTTONS",
        "7N5837202D / 434MHz / 3-BUTTONS",
        "1K0959753P / 315MHz / 3-BUTTONS",
        "6J0837202A / 315MHz / 3-BUTTONS",
        "6J0837202B / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT IBIZA",
      years: "2013-2015",
      parts: [
        "6J0837202E / 434MHz / 3-BUTTONS",
        "6J0837202F / 315MHz / 3-BUTTONS",
        "6J0837202D / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT IBIZA",
      years: "2016-2017",
      parts: [
        "5F0959752D / 434MHz / 3-BUTTONS",
        "5F0959752F / 434MHz / 3-BUTTONS",
        "5F0959752E / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "SEAT IBIZA",
      years: "2018-2021",
      parts: [
        "6F0959752L / 434MHz / 3-BUTTONS",
        "6F0959752D / 434MHz / 3-BUTTONS",
        "6F0959752N / 434MHz / 3-BUTTONS",
        "6F0959752P / 434MHz / 3-BUTTONS",
        "6F0959752C / 315MHz / 3+ BUTTONS",
        "6F0959752E / 315MHz / 3+ BUTTONS"
      ]
    },
    {
      model: "SEAT INCA",
      years: "1997-2003",
      parts: [
        "6K0959753B / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT LEON",
      years: "1999-2005",
      parts: [
        "1M0959753C / 433MHz / 2-BUTTONS",
        "1M0959753E / 433MHz / 2-BUTTONS",
        "1J0959753CT / 433MHz / 2-BUTTONS",
        "1J0959753AL / 433MHz / 3-BUTTONS",
        "1J0959753DD / 315MHz / 2-BUTTONS",
        "1J0959753Q / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT LEON",
      years: "2006-2010",
      parts: [
        "1K0959753G / 433MHz / 3-BUTTONS",
        "1K0959753H / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT LEON",
      years: "2011-2012",
      parts: [
        "1K0959753N / 433MHz / 3-BUTTONS",
        "7N5837202D / 434MHz / 3-BUTTONS",
        "6J0837202B / 315MHz / 3-BUTTONS",
        "1K0959753P / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT LEON",
      years: "2013-2016",
      parts: [
        "5F0959752D / 434MHz / 3-BUTTONS",
        "5F0959752C / 315MHz / 3+1 BUTTONS",
        "5F0959752E / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "SEAT LEON",
      years: "2017-2020",
      parts: [
        "575959752D / 434MHz / 3-BUTTONS",
        "575959752AL / 434MHz / 3-BUTTONS",
        "575959752AN / 434MHz / 3-BUTTONS",
        "575959752AH / 434MHz / 3-BUTTONS",
        "575959752C / 315MHz / 3+1 BUTTONS",
        "575959752E / 315MHz / 3+1 BUTTONS",
        "575959752AE / 315MHz / 3+1 BUTTONS",
        "575959752AJ / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "SEAT LEON",
      years: "2020-2021",
      parts: [
        "5FA959752 / 434MHz / 3-BUTTONS",
        "5FA959752B / 434MHz / 3-BUTTONS",
        "5FA959752E / 434MHz / 3-BUTTONS",
        "5FA959752D / 434MHz / 3-BUTTONS",
        "5FA959752G / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT Mii",
      years: "2012-2019",
      parts: [
        "6J0837202E / 434MHz / 3-BUTTONS",
        "6J0837202G / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT e-Mii",
      years: "2020 +",
      parts: [
        "6J0837202G / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT TARRACO",
      years: "2019-2021",
      parts: [
        "575959752J / 434MHz / WITH KESSY",
        "575959752AL / 434MHz / WITH KESSY",
        "575959752AS / 434MHz / WITH KESSY",
        "575959752C / 315MHz / WITH KESSY",
        "575959752K / 315MHz / WITH KESSY",
        "575959752AT / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "SEAT TOLEDO",
      years: "1997-1998",
      parts: [
        "6K0959753B / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SEAT TOLEDO",
      years: "1999-2001",
      parts: [
        "1M0959753C / 433MHz / 2-BUTTONS",
        "1M0959753E / 433MHz / 2-BUTTONS",
        "1J0959753F / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT TOLEDO",
      years: "2002-2004",
      parts: [
        "1J0959753CT / 433MHz / 2-BUTTONS",
        "1J0959753DA / 433MHz / 3-BUTTONS",
        "1J0959753DC / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT TOLEDO",
      years: "2005-2010",
      parts: [
        "1K0959753G / 433MHz / 3-BUTTONS",
        "1K0959753H / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SEAT TOLEDO",
      years: "2012-2015",
      parts: [
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202E / 434MHz / WITH KESSY",
        "5K0837202AE / 315MHz / 3-BUTTONS",
        "5K0837202AK / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "SEAT TOLEDO",
      years: "2016-2019",
      parts: [
        "5K0837202BH / 434MHz / 3-BUTTONS",
        "5K0837202DH / 434MHz / 3-BUTTONS",
        "5K0837202BN / 434MHz / WITH KESSY",
        "5K0837202DM / 434MHz / WITH KESSY"
      ]
    }
  ];

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
              <h1 className="text-gray-900">SEAT Part Numbers</h1>
              <p className="text-sm text-gray-600">
                Cross-reference part numbers for SEAT vehicles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Data List */}
        <div className="space-y-4">
          {seatData.map((item, index) => (
            <div key={index} className="bg-white rounded-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                <h3 className="text-white">
                  {item.model}
                </h3>
                <p className="text-sm text-blue-100">
                  {item.years}
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {item.parts.map((part, partIndex) => (
                    <div
                      key={partIndex}
                      className="text-sm text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200"
                    >
                      {part}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> SEAT part numbers typically start with specific prefixes 
            and often share components with other VAG brands. This database will help identify 
            cross-compatible parts across Audi, Skoda, and Volkswagen, as SEAT models frequently 
            share platforms with these brands (e.g., Leon/Golf, Ibiza/Polo).
          </p>
        </div>
      </div>
    </div>
  );
}
