import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface SkodaPartNumbersPageProps {
  onBack: () => void;
}

export function SkodaPartNumbersPage({ onBack }: SkodaPartNumbersPageProps) {
  const skodaData = [
    {
      model: "SKODA CITIGO",
      years: "2012-2020",
      parts: [
        "3T0837202H / 434MHz / 3-BUTTONS",
        "3T0837202L / 434MHz / 3-BUTTONS",
        "3T0837202Q / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA FABIA",
      years: "2000-2006",
      parts: [
        "6Y0959753E / 433MHz / 2-BUTTONS",
        "6Y0959753F / 315MHz / 2-BUTTONS",
        "1J0959753AA / 433MHz / 2-BUTTONS",
        "1J0959753DA / 433MHz / 3-BUTTONS",
        "1J0959753DE / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA FABIA",
      years: "2006-2010",
      parts: [
        "1J0959753DA / 433MHz / 3-BUTTONS",
        "1J0959753DE / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA FABIA",
      years: "2011-2015",
      parts: [
        "3T0837202C / 434MHz / 3-BUTTONS",
        "3T0837202H / 434MHz / 3-BUTTONS",
        "3T0837202L / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA FABIA",
      years: "2016-2021",
      parts: [
        "6V0959752D / 434MHz / 3-BUTTONS",
        "6V0959752K / 434MHz / 3-BUTTONS",
        "6V0959752E / 434MHz / WITH KESSY",
        "6V0959752L / 434MHz / WITH KESSY",
        "6V0959752H / 434MHz / WITH KESSY",
        "6V0959752M / 434MHz / WITH KESSY"
      ]
    },
    {
      model: "SKODA KAMIQ",
      years: "2019 +",
      parts: [
        "654959752E / 434MHz / 3-BUTTONS",
        "654959752F / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA KAROQ / KODIAQ",
      years: "2016-2021",
      parts: [
        "6V0959752D / 434MHz / 3-BUTTONS",
        "6V0959752K / 434MHz / 3-BUTTONS",
        "3V0959752 / 434MHz / WITH KESSY",
        "3V0959752K / 434MHz / WITH KESSY",
        "3V0959752G / 434MHz / WITH KESSY",
        "3V0959752B / 434MHz / WITH KESSY"
      ]
    },
    {
      model: "SKODA OCTAVIA",
      years: "2001-2003",
      parts: [
        "1U0837231D / 433MHz / 2-BUTTONS",
        "1J0959753N / 433MHz / 2-BUTTONS",
        "1J0959753CT / 433MHz / 2-BUTTONS",
        "1J0959753DD / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "SKODA OCTAVIA",
      years: "2010-2013",
      parts: [
        "3T0837202 / 434MHz / 3-BUTTONS",
        "3T0837202C / 434MHz / 3-BUTTONS",
        "3T0837202H / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA OCTAVIA",
      years: "2014-2017",
      parts: [
        "5E0959752 / 434MHz / 3-BUTTONS",
        "5E0959752A / 434MHz / WITH KESSY"
      ]
    },
    {
      model: "SKODA OCTAVIA",
      years: "2015-2021",
      parts: [
        "3T0837202Q / 434MHz / 3-BUTTONS",
        "5E0959752K / 434MHz / 3-BUTTONS",
        "5E0959752E / 434MHz / WITH KESSY",
        "5E0959752L / 434MHz / WITH KESSY",
        "5E0959752J / 434MHz / WITH KESSY",
        "5E0959752M / 434MHz / WITH KESSY"
      ]
    },
    {
      model: "SKODA OCTAVIA",
      years: "2020 +",
      parts: [
        "5E3959752B / 434MHz / 3-BUTTONS",
        "5E3959752C / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA RAPID",
      years: "2012-2015",
      parts: [
        "3T0837202H / 434MHz / 3-BUTTONS",
        "3T0837202L / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA RAPID",
      years: "2015-2021",
      parts: [
        "3T0837202Q / 434MHz / 3-BUTTONS",
        "5E0959752K / 434MHz / 3-BUTTONS",
        "5E0959752L / 434MHz / WITH KESSY",
        "5E0959752J / 434MHz / WITH KESSY"
      ]
    },
    {
      model: "SKODA ROOMSTER / PRAKTIK",
      years: "2006-2010",
      parts: [
        "1J0959753DA / 433MHz / 3-BUTTONS",
        "1J0959753DE / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA SUPERB",
      years: "2008-2013",
      parts: [
        "3T0837202 / 434MHz / 3-BUTTONS",
        "3T0837202C / 434MHz / 3-BUTTONS",
        "3T0837202H / 434MHz / 3-BUTTONS",
        "3T0837202A / 434MHz / WITH KESSY",
        "3T0837202K / 434MHz / WITH KESSY"
      ]
    },
    {
      model: "SKODA YETI",
      years: "2009-2013",
      parts: [
        "3T0837202 / 434MHz / 3-BUTTONS",
        "3T0837202C / 434MHz / 3-BUTTONS",
        "3T0837202H / 434MHz / 3-BUTTONS",
        "3T0837202D / 315MHz / 3-BUTTONS",
        "3T0837202J / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "SKODA YETI",
      years: "2013-2017",
      parts: [
        "3T0837202L / 434MHz / 3-BUTTONS",
        "3T0837202N / 434MHz / WITH KESSY"
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
              <h1 className="text-gray-900">Skoda Part Numbers</h1>
              <p className="text-sm text-gray-600">
                Cross-reference part numbers for Skoda vehicles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Data List */}
        <div className="space-y-4">
          {skodaData.map((item, index) => (
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
            <strong>Note:</strong> Skoda part numbers typically start with specific prefixes 
            and often share components with other VAG brands. This database will help identify 
            cross-compatible parts across Audi, SEAT, and Volkswagen, as Skoda models frequently 
            share platforms with these brands (e.g., Octavia/Golf, Fabia/Polo).
          </p>
        </div>
      </div>
    </div>
  );
}
