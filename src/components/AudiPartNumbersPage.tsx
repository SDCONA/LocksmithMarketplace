import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface AudiPartNumbersPageProps {
  onBack: () => void;
}

export function AudiPartNumbersPage({ onBack }: AudiPartNumbersPageProps) {
  const audiData = [
    {
      model: "AUDI A1",
      years: "2010-2018",
      parts: [
        "8X0837220 / 434MHz / 3-BUTTONS",
        "8X0837220R / 434MHz / 3-BUTTONS",
        "8X0837220A / 315MHz / 3+1 BUTTONS",
        "8X0837220C / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "AUDI A1",
      years: "2018-2021",
      parts: [
        "82A837220H / 434MHz / 3-BUTTONS",
        "82A837220D / 434MHz / 3-BUTTONS",
        "82A837220E / 315MHz / 3-BUTTONS",
        "82A837220F / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A2",
      years: "2000-2005",
      parts: [
        "8Z0837231 / 433.92MHz / 3-BUTTONS",
        "8Z0837231D / 433.92MHz / 3-BUTTONS",
        "8Z0837231G / 315MHz / 3-BUTTONS",
        "8Z0837231A / 315MHz / 3-BUTTONS",
        "8Z0837231E / 315MHz / 3-BUTTONS",
        "8Z0837231C / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A3",
      years: "1997-1999",
      parts: [
        "8L0837231A / 433.92MHz / 2-BUTTONS",
        "8L0837231R / 433.92MHz / 2-BUTTONS",
        "4D0837231R / 433.92MHz / 2-BUTTONS",
        "8L0837231C / 315MHz / 2-BUTTONS",
        "4D0837231S / 315MHz / 2-BUTTONS",
        "4D0837231T / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "AUDI A3",
      years: "2000-2003",
      parts: [
        "4D0837231N / 433.92MHz / 3-BUTTONS",
        "4D0837231P / 315MHz / 2-BUTTONS",
        "4D0837231S / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "AUDI A3",
      years: "2004-2007",
      parts: [
        "8P0837231 / 434MHz / 3-BUTTONS",
        "8P0837231A / 315MHz / 3-BUTTONS",
        "8P0837231C / 315MHz / 3-BUTTONS",
        "8P0837220D / 434MHz / 3-BUTTONS",
        "8P0837220E / 315MHz / 3-BUTTONS",
        "8P0837220F / 315MHz / 3-BUTTONS",
        "8P0837220G / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A3",
      years: "2008-2012",
      parts: [
        "8P0837220D / 434MHz / 3-BUTTONS",
        "8P0837220E / 315MHz / 3-BUTTONS",
        "8P0837220F / 315MHz / 3-BUTTONS",
        "8P0837220G / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A3",
      years: "2013-2019",
      parts: [
        "8V0837220D / 434MHz / 3-BUTTONS",
        "8V0837220E / 315MHz / 3-BUTTONS",
        "8V0837220F / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A3",
      years: "2019-2021",
      parts: [
        "8Y0959754A / 434MHz / 3-BUTTONS",
        "8Y0959754D / 434MHz / 3-BUTTONS",
        "8Y0959754B / 315MHz / 3-BUTTONS",
        "8Y0959754E / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A4",
      years: "1995-1997",
      parts: [
        "8L0837231A / 433.92MHz / 2-BUTTONS",
        "8L0837231C / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "AUDI A4",
      years: "1998-2002",
      parts: [
        "4D0837231R / 433.92MHz / 2-BUTTONS",
        "4D0837231N / 433.92MHz / 3-BUTTONS",
        "4D0837231S / 315MHz / 2-BUTTONS",
        "4D0837231T / 315MHz / 2-BUTTONS",
        "4D0837231P / 315MHz / 3-BUTTONS",
        "4D0837231Q / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A4",
      years: "2001-2004",
      parts: [
        "8Z0837231 / 433.92MHz / 3-BUTTONS",
        "8Z0837231D / 433.92MHz / 3-BUTTONS",
        "8Z0837231B / 315MHz / 3+1 BUTTONS",
        "8Z0837231F / 315MHz / 3+1 BUTTONS",
        "8Z0837231A / 315MHz / 3-BUTTONS",
        "8Z0837231E / 315MHz / 3-BUTTONS",
        "8Z0837231C / 315MHz / 3-BUTTONS",
        "8Z0837231G / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A4",
      years: "2005-2008",
      parts: [
        "8E0837220Q / 434MHz / 3-BUTTONS",
        "8E0837220R / 315MHz / 3-BUTTONS",
        "8E0837220S / 315MHz / 3-BUTTONS",
        "8E0837220T / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A4",
      years: "2008-2016",
      parts: [
        "8K0959754D / 868MHz / WITH KESSY",
        "8K0959754H / 868MHz / WITH KESSY",
        "8K0959754BD / 868MHz / WITH KESSY",
        "8K0959754AD / 868MHz / WITH KESSY",
        "8T0959754K / 868MHz / WITH KESSY",
        "8K0959754CD / 868MHz / WITH KESSY (S/RS sign)",
        "8T0959754D / 868MHz / REMOTE",
        "8T0959754C / 868MHz / REMOTE",
        "8T0959754F / 434MHz / WITH KESSY",
        "8K0959754A / 434MHz / WITH KESSY",
        "8K0959754CL / 434MHz / WITH KESSY",
        "8K0959754CA / 433MHz / WITH KESSY (S/RS sign)",
        "8K0959754 / 434MHz / REMOTE",
        "8K0959754B / 315MHz / WITH KESSY",
        "8K0959754BB / 315MHz / WITH KESSY",
        "8T0959754G / 315MHz / WITH KESSY",
        "8K0959754AB / 315MHz / WITH KESSY",
        "8K0959754BC / 315MHz / WITH KESSY (S/RS sign)",
        "8K0959754CC / 315MHz / WITH KESSY (S/RS sign)",
        "8K0959754CB / 315MHz / WITH KESSY (S/RS sign)",
        "8K0959754C / 315MHz / WITH KESSY",
        "8T0959754A / 315MHz / REMOTE",
        "8T0959754H / 315MHz / REMOTE",
        "8T0959754J / 315MHz / REMOTE"
      ]
    },
    {
      model: "AUDI A4",
      years: "2016-2020",
      parts: [
        "4M0959754T / 433MHz",
        "4M0959754AJ / 433MHz",
        "4M0959754BR / 433MHz",
        "4M0959754AK / 433MHz",
        "8W0959754AM / 433MHz",
        "8W0959754DK / 433MHz",
        "8W0959754AN / 433MHz",
        "4M0959754AL / 315MHz",
        "8W0959754AP / 315MHz"
      ]
    },
    {
      model: "AUDI A4",
      years: "2020 +",
      parts: [
        "4M0959754CF / 433MHz",
        "4M0959754CK / 433MHz",
        "8W0959754CT / 433MHz",
        "8W0959754EQ / 433MHz",
        "8W0959754DA / 433MHz",
        "4M0959754CB / 315MHz",
        "8W0959754DB / 315MHz"
      ]
    },
    {
      model: "AUDI A5",
      years: "2007-2016",
      parts: [
        "8K0959754C / 315MHz / WITH KESSY",
        "8T0959754G / 315MHz / WITH KESSY",
        "8K0959754B / 315MHz / WITH KESSY",
        "8K0959754AB / 315MHz / WITH KESSY",
        "8K0959754BB / 315MHz / WITH KESSY",
        "8K0959754BC / WITH KESSY (S/RS sign)",
        "8K0959754CC / 315MHz / WITH KESSY (S/RS sign)",
        "8K0959754CB / 315MHz / WITH KESSY (S/RS sign)",
        "8T0959754A / 315MHz / REMOTE",
        "8T0959754H / 315MHz / REMOTE",
        "8T0959754J / 315MHz / REMOTE",
        "8K0959754A / 434MHz / WITH KESSY",
        "8K0959754CL / 434MHz / WITH KESSY",
        "8T0959754F / 434MHz / WITH KESSY",
        "8K0959754CA / 433MHz / WITH KESSY (S/RS sign)",
        "8K0959754 / 434MHz / REMOTE",
        "8T0959754K / 868MHz / WITH KESSY",
        "8K0959754D / 868MHz / WITH KESSY",
        "8K0959754H / 868MHz / WITH KESSY",
        "8K0959754BD / 868MHz / WITH KESSY",
        "8K0959754AD / 868MHz / WITH KESSY",
        "8K0959754CD / 868MHz / WITH KESSY (S/RS sign)",
        "8T0959754D / 868MHz / REMOTE",
        "8T0959754C / 868MHz / REMOTE"
      ]
    },
    {
      model: "AUDI A5",
      years: "2017-2020",
      parts: [
        "4M0959754AL / 315MHz",
        "8W0959754AP / 315MHz",
        "4M0959754AJ / 433MHz",
        "4M0959754BR / 433MHz",
        "4M0959754AK / 433MHz",
        "8W0959754AM / 433MHz",
        "8W0959754DK / 433MHz",
        "8W0959754AN / 433MHz"
      ]
    },
    {
      model: "AUDI A5",
      years: "2020 +",
      parts: [
        "4M0959754CB / 315MHz",
        "8W0959754DB / 315MHz",
        "4M0959754CF / 433MHz",
        "4M0959754CK / 433MHz",
        "8W0959754CT / 433MHz",
        "8W0959754EQ / 433MHz",
        "8W0959754DA / 433MHz"
      ]
    },
    {
      model: "AUDI A6",
      years: "1997-1999",
      parts: [
        "8L0837231A / 433.92MHz / 2-BUTTONS",
        "8L0837231C / 315MHz / 2-BUTTONS",
        "8L0837231B / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A6 (C5)",
      years: "2000-2005",
      parts: [
        "4D0837231R / 433.92MHz / 2-BUTTONS",
        "4D0837231N / 433.92MHz / 3-BUTTONS",
        "4D0837231K / 433.92MHz / 3-BUTTONS",
        "4D0837231Q / 315MHz / 3-BUTTONS",
        "4D0837231S / 315MHz / 2-BUTTONS",
        "4D0837231T / 315MHz / 2-BUTTONS",
        "4D0837231P / 315MHz / 3-BUTTONS",
        "4D0837231L / 315MHz / 3-BUTTONS",
        "4D0837231M / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A6 (C6)",
      years: "2004-2011",
      parts: [
        "4F0837220R / 868MHz / REMOTE",
        "4F0837220AK / 868MHz / WITH KESSY",
        "4F0837220M / 433MHz / REMOTE",
        "4F0837220AF / 433MHz / WITH KESSY",
        "4F0837220N / 315MHz / REMOTE",
        "4F0837220P / 315MHz / REMOTE",
        "4F0837220Q / 315MHz / REMOTE",
        "4F0837220AG / 315MHz / WITH KESSY",
        "4F0837220AH / 315MHz / WITH KESSY",
        "4F0837220AJ / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "AUDI A6 (C7)",
      years: "2011-2018",
      parts: [
        "8K0959754D / 868MHz",
        "4G0959754K / 868MHz",
        "4G0959754DP / 868MHz",
        "4G0959754DT / 868MHz",
        "4G0959754DK / 868MHz (S/RS sign)",
        "8K0959754CL / 433MHz",
        "4G0959754EH / 433MHz",
        "4G0959754DQ / 433MHz",
        "4G0959754EQ / 433MHz",
        "4G0959754ES / 433MHz (S/RS sign)",
        "8K0959754B / 315MHz",
        "8K0959754C / 315MHz",
        "4G0959754G / 315MHz",
        "4G0959754BG / 315MHz",
        "4G0959754DR / 315MHz",
        "4G0959754DN / 315MHz",
        "4G0959754DS / 315MHz",
        "4G0959754DM / 315MHz",
        "4G0959754DJ / 315MHz (S/RS sign)"
      ]
    },
    {
      model: "AUDI A6 (C8)",
      years: "2019-2021",
      parts: [
        "4K0959754G / 433MHz",
        "4K0959754J / 433MHz",
        "4K0959754T / 433MHz",
        "4K0959754AA / 433MHz",
        "4K0959754B / 315MHz",
        "4K0959754C / 315MHz",
        "4K0959754D / 315MHz",
        "4K0959754S / 315MHz"
      ]
    },
    {
      model: "AUDI A7",
      years: "2010-2018",
      parts: [
        "8K0959754D / 868MHz",
        "4G0959754K / 868MHz",
        "4G0959754DP / 868MHz",
        "4G0959754DT / 868MHz",
        "4G0959754DK / 868MHz (S/RS sign)",
        "8K0959754CL / 433MHz",
        "4G0959754EH / 433MHz",
        "4G0959754DQ / 433MHz",
        "4G0959754EQ / 433MHz",
        "4G0959754ES / 433MHz (S/RS sign)",
        "8K0959754B / 315MHz",
        "8K0959754C / 315MHz",
        "4G0959754G / 315MHz",
        "4G0959754BG / 315MHz",
        "4G0959754DR / 315MHz",
        "4G0959754DN / 315MHz",
        "4G0959754DS / 315MHz",
        "4G0959754DM / 315MHz",
        "4G0959754DJ / 315MHz (S/RS sign)"
      ]
    },
    {
      model: "AUDI A7",
      years: "2019-2021",
      parts: [
        "4K0959754G / 433MHz",
        "4K0959754J / 433MHz",
        "4K0959754T / 433MHz",
        "4K0959754AA / 433MHz",
        "4K0959754B / 315MHz",
        "4K0959754C / 315MHz",
        "4K0959754D / 315MHz",
        "4K0959754S / 315MHz"
      ]
    },
    {
      model: "AUDI A8",
      years: "1999-2003",
      parts: [
        "4D0837231R / 433.92MHz / 2-BUTTONS",
        "4D0837231N / 433.92MHz / 3-BUTTONS",
        "4D0837231S / 315MHz / 2-BUTTONS",
        "4D0837231T / 315MHz / 2-BUTTONS",
        "4D0837231P / 315MHz / 3-BUTTONS",
        "4D0837231Q / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI A8 (D3)",
      years: "2003-2010",
      parts: [
        "4E0837220J / 433.92MHz / REMOTE",
        "4E0837220L / 433.92MHz / WITH KESSY",
        "4E0837220B / 315MHz / REMOTE",
        "4E0837220D / 315MHz / WITH KESSY",
        "4E0837220R / 315MHz / REMOTE",
        "4E0837220M / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "AUDI A8 (D4)",
      years: "2010-2017",
      parts: [
        "4H0959754G / 868MHz",
        "4H0959754K / 868MHz",
        "4H0959754AA / 868MHz",
        "4H0959754N / 868MHz (S sign)",
        "4H0959754 / 433MHz",
        "4H0959754DB / 433MHz",
        "4H0959754J / 315MHz",
        "4H0959754AF / 315MHz",
        "4H0959754M / 315MHz (S sign)"
      ]
    },
    {
      model: "AUDI A8 (D5)",
      years: "2018-2021",
      parts: [
        "4N0959754G / 433MHz",
        "4N0959754J / 433MHz",
        "4N0959754C / 315MHz"
      ]
    },
    {
      model: "AUDI Q2",
      years: "2016-2021",
      parts: [
        "8V0837220D / 434MHz / 3-BUTTONS",
        "8V0837220E / 315MHz / 3-BUTTONS",
        "8V0837220F / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI Q3",
      years: "2011-2018",
      parts: [
        "8U0837220D / 434MHz / 3-BUTTONS",
        "8U0837220E / 315MHz / 3-BUTTONS",
        "8U0837220F / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI Q3",
      years: "2019-2021",
      parts: [
        "8Y0959754A / 434MHz / 3-BUTTONS",
        "8Y0959754D / 434MHz / 3-BUTTONS",
        "8Y0959754B / 315MHz / 3-BUTTONS",
        "8Y0959754E / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI Q5",
      years: "2008-2016",
      parts: [
        "8K0959754D / 868MHz / WITH KESSY",
        "8K0959754H / 868MHz / WITH KESSY",
        "8K0959754BD / 868MHz / WITH KESSY",
        "8K0959754AD / 868MHz / WITH KESSY",
        "8T0959754K / 868MHz / WITH KESSY",
        "8K0959754CD / 868MHz / WITH KESSY (S/RS sign)",
        "8T0959754D / 868MHz / REMOTE",
        "8T0959754C / 868MHz / REMOTE",
        "8T0959754F / 434MHz / WITH KESSY",
        "8K0959754A / 434MHz / WITH KESSY",
        "8K0959754CL / 434MHz / WITH KESSY",
        "8K0959754CA / 433MHz / WITH KESSY (S/RS sign)",
        "8K0959754 / 434MHz / REMOTE",
        "8K0959754B / 315MHz / WITH KESSY",
        "8K0959754BB / 315MHz / WITH KESSY",
        "8T0959754G / 315MHz / WITH KESSY",
        "8K0959754AB / 315MHz / WITH KESSY",
        "8K0959754BC / 315MHz / WITH KESSY (S/RS sign)",
        "8K0959754CC / 315MHz / WITH KESSY (S/RS sign)",
        "8K0959754CB / 315MHz / WITH KESSY (S/RS sign)",
        "8K0959754C / 315MHz / WITH KESSY",
        "8T0959754A / 315MHz / REMOTE",
        "8T0959754H / 315MHz / REMOTE",
        "8T0959754J / 315MHz / REMOTE"
      ]
    },
    {
      model: "AUDI Q5",
      years: "2017-2021",
      parts: [
        "4M0959754T / 433MHz",
        "4M0959754AJ / 433MHz",
        "4M0959754BR / 433MHz",
        "4M0959754AK / 433MHz",
        "8W0959754AM / 433MHz",
        "8W0959754DK / 433MHz",
        "8W0959754AN / 433MHz",
        "4M0959754AL / 315MHz",
        "8W0959754AP / 315MHz"
      ]
    },
    {
      model: "AUDI Q7",
      years: "2006-2015",
      parts: [
        "4F0837220R / 868MHz / REMOTE",
        "4F0837220AK / 868MHz / WITH KESSY",
        "4F0837220M / 433MHz / REMOTE",
        "4F0837220AF / 433MHz / WITH KESSY",
        "4F0837220N / 315MHz / REMOTE",
        "4F0837220P / 315MHz / REMOTE",
        "4F0837220Q / 315MHz / REMOTE",
        "4F0837220AG / 315MHz / WITH KESSY",
        "4F0837220AH / 315MHz / WITH KESSY",
        "4F0837220AJ / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "AUDI Q7",
      years: "2016-2021",
      parts: [
        "4M0959754T / 433MHz",
        "4M0959754AJ / 433MHz",
        "4M0959754BR / 433MHz",
        "4M0959754AK / 433MHz",
        "8W0959754AM / 433MHz",
        "8W0959754DK / 433MHz",
        "8W0959754AN / 433MHz",
        "4M0959754AL / 315MHz",
        "8W0959754AP / 315MHz"
      ]
    },
    {
      model: "AUDI Q8",
      years: "2018-2021",
      parts: [
        "4N0959754G / 433MHz",
        "4N0959754J / 433MHz",
        "4N0959754C / 315MHz"
      ]
    },
    {
      model: "AUDI E-TRON",
      years: "2018-2021",
      parts: [
        "4N0959754G / 433MHz",
        "4N0959754J / 433MHz",
        "4N0959754C / 315MHz"
      ]
    },
    {
      model: "AUDI TT / ROADSTER",
      years: "1999-2002",
      parts: [
        "8L0837231A / 433.92MHz / 2-BUTTONS",
        "8L0837231C / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "AUDI TT / ROADSTER",
      years: "2003-2006",
      parts: [
        "8Z0837231 / 433.92MHz / 3-BUTTONS",
        "8Z0837231D / 433.92MHz / 3-BUTTONS",
        "8Z0837231B / 315MHz / 3+1 BUTTONS",
        "8Z0837231F / 315MHz / 3+1 BUTTONS",
        "8Z0837231A / 315MHz / 3-BUTTONS",
        "8Z0837231E / 315MHz / 3-BUTTONS",
        "8Z0837231C / 315MHz / 3-BUTTONS",
        "8Z0837231G / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI TT / ROADSTER",
      years: "2007-2014",
      parts: [
        "8J0837220D / 434MHz / 3-BUTTONS",
        "8J0837220E / 315MHz / 3-BUTTONS",
        "8J0837220F / 315MHz / 3-BUTTONS",
        "8J0837220G / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI TT / ROADSTER",
      years: "2014-2015",
      parts: [
        "8V0837220D / 434MHz / 3-BUTTONS",
        "8V0837220E / 315MHz / 3-BUTTONS",
        "8V0837220F / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI TT / ROADSTER",
      years: "2015-2019",
      parts: [
        "8S0959754 / 434MHz / 3-BUTTONS",
        "8S0959754A / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "AUDI TT / ROADSTER",
      years: "2019-2021",
      parts: [
        "8S0959754D / 434MHz / 3-BUTTONS",
        "8S0959754E / 434MHz / 3-BUTTONS",
        "8S0959754B / 315MHz / 3-BUTTONS",
        "8S0959754F / 315MHz / 3-BUTTONS"
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
              <h1 className="text-gray-900">Audi Part Numbers</h1>
              <p className="text-sm text-gray-600">
                Cross-reference part numbers for Audi vehicles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Data List */}
        <div className="space-y-4">
          {audiData.map((item, index) => (
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
            <strong>Note:</strong> Audi part numbers typically start with specific prefixes 
            (e.g., 8E0, 4F0, 8K0) and often share components with other VAG brands. This 
            database helps identify cross-compatible parts across SEAT, Skoda, and Volkswagen.
          </p>
        </div>
      </div>
    </div>
  );
}