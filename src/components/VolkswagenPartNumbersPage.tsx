import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface VolkswagenPartNumbersPageProps {
  onBack: () => void;
}

export function VolkswagenPartNumbersPage({ onBack }: VolkswagenPartNumbersPageProps) {
  const vwData = [
    {
      model: "VW AMAROK",
      years: "2010-2021",
      parts: [
        "7E0837202BD / 434MHz / 2-BUTTONS",
        "7E0837202CF / 434MHz / 2-BUTTONS",
        "7E0837202BQ / 434MHz / 2-BUTTONS",
        "7E0837202BF / 434MHz / 2-BUTTONS",
        "7E0837202BP / 434MHz / 2-BUTTONS",
        "7E0837202CE / 434MHz / 2-BUTTONS",
        "7E0837202BH / 434MHz / 2-BUTTONS",
        "7E0837202CC / 434MHz / 2-BUTTONS",
        "7E0837202BE / 434MHz / 2+1 BUTTONS",
        "7E0837202CB / 434MHz / 2+1 BUTTONS"
      ]
    },
    {
      model: "VW ARTEON",
      years: "2017 +",
      parts: [
        "3G0959752BT / 434MHz / 3-BUTTONS",
        "3G0959752CD / 434MHz / 3-BUTTONS",
        "3G0959752CA / 434MHz / 3+1 BUTTONS",
        "3G0959752CB / 434MHz / 4+1 BUTTONS"
      ]
    },
    {
      model: "VW AMEO",
      years: "2016 +",
      parts: [
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202CT / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW ATLAS",
      years: "2018 +",
      parts: [
        "3G0959752S / WITH KESSY",
        "3G0959752AM / WITH KESSY",
        "3G0959752AR / WITH KESSY",
        "3G0959752BH / WITH KESSY",
        "5G6959752CF / WITHOUT KESSY",
        "5G6959752BF / WITHOUT KESSY",
        "5G6959752CS / WITHOUT KESSY",
        "5G6959752AC / WITHOUT KESSY"
      ]
    },
    {
      model: "VW BEETLE",
      years: "1998-2001",
      parts: [
        "1J0959753F / 315MHz / 3-BUTTONS",
        "1J0959753T / 315MHz / 3-BUTTONS",
        "1J0959753B / 433MHz / 3-BUTTONS",
        "1J0959753P / 433MHz / 3-BUTTONS",
        "1J0959753D / 433MHz / 3-BUTTONS",
        "1J0959753N / 433MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW BEETLE",
      years: "2002-2010",
      parts: [
        "1J0959753DC / 315MHz / 3-BUTTONS",
        "1J0959753AM / 315MHz / 3-BUTTONS",
        "1J0959753AH / 433MHz / 3-BUTTONS",
        "1J0959753DA / 433MHz / 3-BUTTONS",
        "1J0959753DL / 433MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW BEETLE",
      years: "2012-2016",
      parts: [
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202E / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202AJ / 434MHz / 3-BUTTONS",
        "5K0837202AM / 434MHz / WITH KESSY",
        "5K0837202AF / 315MHz / 3-BUTTONS",
        "5K0837202F / 315MHz / WITH KESSY",
        "5K0837202AK / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW BEETLE",
      years: "2017 +",
      parts: [
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202CT / 434MHz / 3-BUTTONS",
        "5K0837202BH / 434MHz / 3-BUTTONS",
        "5K0837202DH / 434MHz / 3-BUTTONS",
        "5K0837202AJ / 434MHz / WITH KESSY",
        "5K0837202DD / 434MHz / WITH KESSY",
        "5K0837202BN / 434MHz / WITH KESSY",
        "5K0837202DM / 434MHz / WITH KESSY",
        "5K0837202AE / 315MHz / 4-BUTTONS",
        "5K0837202BJ / 315MHz / 3+1 BUTTONS",
        "5K0837202AK / 315MHz / WITH KESSY",
        "5K0837202BP / 315MHz / WITH KESSY",
        "5K0837202BQ / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW BORA",
      years: "1998-2005",
      parts: [
        "1J0959753A / 433MHz / 2-BUTTONS",
        "1J0959753N / 433MHz / 2-BUTTONS",
        "1J0959753DA / 434MHz / 3-BUTTONS",
        "1J0959753CT / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW CADDY",
      years: "1996-2003",
      parts: [
        "6K0959753A"
      ]
    },
    {
      model: "VW CADDY",
      years: "2004-2011",
      parts: [
        "1K0959753G / 434MHz / 3-BUTTONS",
        "1K0959753M / 434MHz / 3-BUTTONS",
        "1K0959753J / 315MHz / 3-BUTTONS",
        "1K0959753H / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "VW CADDY",
      years: "2012-2015",
      parts: [
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202AA / 434MHz / 3-BUTTONS",
        "5K0837202AH / 434MHz / 3-BUTTONS",
        "5K0837202R / 315MHz / 3+1 BUTTONS",
        "5K0837202AE / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "VW CADDY",
      years: "2016-2020",
      parts: [
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202BH / 434MHz / 3-BUTTONS",
        "5K0837202DH / 434MHz / 3-BUTTONS",
        "5K0837202AE / 315MHz / 3+1 BUTTONS",
        "5K0837202BJ / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "VW CRAFTER",
      years: "2006-2016",
      parts: [
        "2E0959753A / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW CRAFTER",
      years: "2016-2021",
      parts: [
        "7C0959752F / 434MHz / 3-BUTTONS",
        "7C0959752C / 434MHz / 3-BUTTONS",
        "7C0959752G / 434MHz / 3-BUTTONS",
        "5G6959752CF / 434MHz / 3-BUTTONS",
        "5G6959752BF / 434MHz / 3-BUTTONS",
        "5G6959752CS / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW E-CRAFTER",
      years: "2019 +",
      parts: [
        "7C0959752F / 434MHz / 3-BUTTONS",
        "7C0959752C / 434MHz / 3-BUTTONS",
        "7C0959752G / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW EOS",
      years: "2005-2010",
      parts: [
        "1K0959753G / 434MHz / 3-BUTTONS",
        "1K0959753M / 434MHz / 3-BUTTONS",
        "1K0959753J / 315MHz / 3 BUTTONS",
        "1K0959753K / 315MHz / 3 BUTTONS",
        "1K0959753H / 315MHz / 3+1 BUTTONS",
        "1K0959753P / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "VW EOS",
      years: "2010-2015",
      parts: [
        "5K0837202R / 315MHz / 3+1 BUTTONS",
        "5K0837202AE / 315MHz / 3+1 BUTTONS",
        "5K0837202F / 315MHz / WITH KESSY",
        "5K0837202AK / 315MHz / WITH KESSY",
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202E / 434MHz / WITH KESSY",
        "5K0837202AJ / 434MHz / WITH KESSY"
      ]
    },
    {
      model: "VW GOLF",
      years: "1998-1999",
      parts: [
        "3B0959753G / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "VW GOLF",
      years: "2000-2001",
      parts: [
        "1J0959753A / 433MHz / 2-BUTTONS",
        "1J0959753N / 433MHz / 2-BUTTONS",
        "1J0959753F / 315MHz / 3-BUTTONS",
        "1J0959753T / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW GOLF",
      years: "2002-2006",
      parts: [
        "1J0959753DC / 315MHz / 3-BUTTONS",
        "1J0959753DA / 433MHz / 3-BUTTONS",
        "1J0959753CT / 433MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW GOLF",
      years: "2007-2011",
      parts: [
        "1K0959753N / 434MHz / 3-BUTTONS",
        "1K0959753S / 434MHz / 3-BUTTONS",
        "1K0959753H / 315MHz / 3+1 BUTTONS",
        "1K0959753P / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "VW GOLF",
      years: "2009-2014",
      parts: [
        "5K0837202Q / 315MHz / 3-BUTTONS",
        "5K0837202B / 315MHz / 3-BUTTONS",
        "5K0837202C / 315MHz / 3-BUTTONS",
        "5K0837202E / 315MHz / WITH KESSY",
        "5K0837202F / 315MHz / WITH KESSY",
        "5K0837202G / 315MHz / WITH KESSY",
        "5K0837202A / 315MHz / 3+1 BUTTON",
        "5K0837202AK / 315MHz / WITH KESSY",
        "5K0837202H / 315MHz / WITH KESSY",
        "5K0837202AM / 315MHz / WITH KESSY",
        "5K0837202 / 434MHz / 3-BUTTONS",
        "5K0837202D / 434MHz / 3-BUTTONS",
        "5K0837202E / 434MHz / WITH KESSY",
        "5K0837202F / 434MHz / WITH KESSY",
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202AA / 434MHz / 3-BUTTONS",
        "5K0837202AJ / 434MHz / WITH KESSY",
        "5K0837202J / 434MHz / WITH KESSY"
      ]
    },
    {
      model: "VW GOLF / E-GOLF",
      years: "2013-2020",
      parts: [
        "5G0959752BA / 434MHz / 3-BUTTONS",
        "5G0959752BC / 434MHz / WITH KESSY",
        "5G0959752BJ / 434MHz / 3-BUTTONS",
        "5G0959752BK / 434MHz / WITH KESSY",
        "5G0959752BA / 434MHz / 3-BUTTONS",
        "5G0959752DD / 434MHz / 3-BUTTONS",
        "5G0959752DF / 434MHz / WITH KESSY",
        "5G0959752BS / 434MHz / WITH KESSY",
        "5G0959752BE / 315MHz / WITH KESSY",
        "5G0959752BT / 315MHz / WITH KESSY",
        "5G0959752CA / 315MHz / WITH KESSY",
        "5G0959752BH / 315MHz / WITH KESSY",
        "5G0959752BF / 315MHz / 3-BUTTONS",
        "5G0959752BD / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "VW GOLF / E-GOLF",
      years: "2020 +",
      parts: [
        "5G0959752DG / 434MHz / 3-BUTTONS",
        "5G0959752DQ / 434MHz / WITH KESSY",
        "5G0959752DJ / 315MHz / 3+1 BUTTONS",
        "5G0959752DL / 315MHz / 3-BUTTONS",
        "5G0959752DR / 315MHz / WITH KESSY",
        "5G0959752DT / 315MHz / WITH KESSY",
        "5H0959753 / 434MHz / 3-BUTTONS",
        "5H0959753G / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW JETTA",
      years: "2006-2010",
      parts: [
        "1K0959753G / 434MHz / 3-BUTTONS",
        "1K0959753N / ~ 434MHz / 3-BUTTONS",
        "1K0959753J / 315MHz / 3-BUTTONS",
        "1K0959753Q / 315MHz / 3-BUTTONS",
        "1K0959753R / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW JETTA",
      years: "2009-2018",
      parts: [
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202AA / 434MHz / 3-BUTTONS",
        "5K0837202E / 434MHz / WITH KESSY",
        "5K0837202AJ / 434MHz / 3-BUTTONS",
        "5K0837202AM / 434MHz / 3-BUTTONS",
        "5K0837202J / 434MHz / 3-BUTTONS",
        "5K0837202R / 315MHz / 3+1 BUTTONS",
        "5K0837202AE / 315MHz / 3+1 BUTTONS",
        "5K0837202T / 315MHz / 3-BUTTONS",
        "5K0837202AG / 315MHz / 3-BUTTONS",
        "5K0837202F / 315MHz / WITH KESSY",
        "5K0837202AK / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW JETTA",
      years: "2019 +",
      parts: [
        "5G6959752Q / 434MHz / 3-BUTTONS",
        "5G6959752CF / 434MHz / 3-BUTTONS",
        "5G6959752BF / 434MHz / 3-BUTTONS",
        "5G6959752CS / 434MHz / 3-BUTTONS",
        "5G6959752CJ / 434MHz / WITH KESSY",
        "5G6959752BL / 434MHz / WITH KESSY",
        "5G6959752DD / 434MHz / WITH KESSY",
        "5G6959752BQ / 434MHz / WITH KESSY",
        "5G6959752DJ / 434MHz / WITH KESSY",
        "5G6959752AC / 315MHz / 3+1 BUTTON",
        "5G6959752BG / 315MHz / 3+1 BUTTON",
        "5G6959752CT / 315MHz / 3+1 BUTTON",
        "3G0959752S / 315MHz / WITH KESSY",
        "3G0959752BA / 315MHz / WITH KESSY",
        "3G0959752T / 315MHz / WITH KESSY",
        "3G0959752BB / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW LUPO",
      years: "1998-2005",
      parts: [
        "3B0959753G / 433MHz / 2-BUTTONS",
        "3B0959753L / 433MHz / 2-BUTTONS",
        "3B0959753F / 315MHz / 2-BUTTONS",
        "3B0959753J / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "VW PASSAT",
      years: "1997-2001",
      parts: [
        "3B0959753G / 433MHz / 2-BUTTONS",
        "1J0959753A / 433MHz / 2-BUTTONS",
        "1J0959753F / 315MHz / 3-BUTTONS",
        "1J0959753C / 315MHz / 2-BUTTONS",
        "1J0959753E / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "VW PASSAT",
      years: "2001-2005",
      parts: [
        "1J0959753DA / 434MHz / 3-BUTTONS",
        "1J0959753DL / 434MHz / 3-BUTTONS",
        "1J0959753DC / 315MHz / 3-BUTTONS",
        "1J0959753DE / 315MHz / 3-BUTTONS",
        "1J0959753DF / 315MHz / 3-BUTTONS",
        "1J0959753DJ / 315MHz / 3-BUTTONS",
        "1J0959753DH / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW PASSAT",
      years: "2005-2014",
      parts: [
        "3C0959752M / 434MHz / 3-BUTTONS",
        "3C0959752BF / 434MHz / 3-BUTTONS",
        "3C0959752AR / 434MHz / 3-BUTTONS",
        "3C0959752AL / 434MHz / 3-BUTTONS",
        "3C0959752AD / 434MHz / 3-BUTTONS",
        "3C0959752BA / 434MHz / 3-BUTTONS",
        "3C0959752AJ / 434MHz / 3-BUTTONS",
        "3C0959752BG / 434MHz / WITH KESSY",
        "3C0959752BB / 315MHz / 3+1 BUTTONS",
        "3C0959752BD / 315MHz / 3-BUTTONS",
        "3C0959752BE / 315MHz / 3-BUTTONS",
        "3C0959752AK / 315MHz / 3-BUTTONS",
        "3C0959752AP / 315MHz / 3-BUTTONS",
        "3C0959752AQ / 315MHz / 3-BUTTONS",
        "3C0959752AH / 315MHz / 3-BUTTONS",
        "3C0959752AP / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW PASSAT",
      years: "2014-2020",
      parts: [
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202AM / 434MHz / 3-BUTTONS",
        "5K0837202DQ / 434MHz / 3-BUTTONS",
        "5K0837202AJ / 434MHz / WITH KESSY",
        "5K0837202EB / 434MHz / WITH KESSY",
        "5K0837202R / 315MHz / 3+1 BUTTONS",
        "5K0837202AE / 315MHz / 3+1 BUTTONS",
        "5K0837202DS / 315MHz / 3+1 BUTTONS",
        "5K0837202F / 315MHz / WITH KESSY",
        "5K0837202AK / 315MHz / WITH KESSY",
        "561837202A / 315MHz / WITH KESSY",
        "561837202D / 315MHz / WITH KESSY",
        "5K0837202EC / 315MHz / WITH KESSY",
        "561837202J / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW PASSAT",
      years: "2014-2021",
      parts: [
        "3G0959752K / 434MHz / 3-BUTTONS",
        "3G0959752C / 434MHz / 3-BUTTONS",
        "3G0959752AL / 434MHz / 3-BUTTONS",
        "3G0959752BT / 434MHz / 3-BUTTONS",
        "3G0959752AP / 434MHz / 3-BUTTONS",
        "3G0959752CD / 434MHz / 3-BUTTONS",
        "3G0959752B / 315MHz / 3-BUTTONS",
        "3G0959752AN / 315MHz / 3-BUTTONS",
        "3G0959752CC / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW PHAETON",
      years: "2002-2007",
      parts: [
        "3D0959753P / 433MHz / 3-BUTTONS",
        "3D0959753S / 433MHz / WITH KESSY",
        "3D0959753F / 315MHz / 2+1 BUTTONS",
        "3D0959753Q / 315MHz / 3+1 BUTTONS",
        "3D0959753G / 315MHz / WITH KESSY",
        "3D0959753T / 315MHz / WITH KESSY",
        "3D0959753R / 315MHz / 3-BUTTONS",
        "3D0959753AA / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW PHAETON",
      years: "2008-2010",
      parts: [
        "3D0959753AK / 434MHz / 3-BUTTONS",
        "3D0959753AR / 434MHz / 3-BUTTONS",
        "3D0959753AM / 434MHz / WITH KESSY",
        "3D0959753AT/ 434MHz / WITH KESSY",
        "3D0959753AL / 315MHz / 3-BUTTONS",
        "3D0959753BE / 315MHz / 3-BUTTONS",
        "3D0959753AN / 315MHz / WITH KESSY",
        "3D0959753BA / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW PHAETON",
      years: "2011-2016",
      parts: [
        "3D0959753BG / 434MHz / 3-BUTTONS",
        "3D0959753BJ / 434MHz / WITH KESSY",
        "3D0959753BE / 315MHz / 3-BUTTONS",
        "3D0959753BC / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW POLO",
      years: "1997-1999",
      parts: [
        "6K0959753A / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "VW POLO",
      years: "1999-2002",
      parts: [
        "3B0959753G / 433MHz / 2-BUTTONS",
        "3B0959753F / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "VW POLO",
      years: "2003-2010",
      parts: [
        "1J0959753DA / 434MHz / 3-BUTTONS",
        "1J0959753DL / 434MHz / 3-BUTTONS",
        "1J0959753CT / 434MHz / 2-BUTTONS",
        "1J0959753DE / 315MHz / 3-BUTTONS",
        "1J0959753DJ / 315MHz / 3-BUTTONS",
        "1J0959753DC / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW POLO",
      years: "2009-2012",
      parts: [
        "1K0959753N / 434MHz / 3-BUTTONS",
        "1K0959753S / 434MHz / 3-BUTTONS",
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202CT / 434MHz / 3-BUTTONS",
        "5K0837202AA / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202AH / 434MHz / 3-BUTTONS",
        "1K0959753Q / 315MHz / 3-BUTTONS",
        "5K0837202S / 315MHz / 3-BUTTONS",
        "5K0837202AF / 315MHz / 3-BUTTONS",
        "5K0837202AG / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW POLO",
      years: "2012-2015",
      parts: [
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202AH / 434MHz / 3-BUTTONS",
        "5K0837202AF / 315MHz / 3-BUTTONS",
        "5K0837202AG / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW POLO",
      years: "2015-2020",
      parts: [
        "5G6959752CF / 434MHz / 3-BUTTONS",
        "5G6959752AK / 434MHz / 3-BUTTONS",
        "5G6959752S / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW POLO",
      years: "2018-2021",
      parts: [
        "2G6959752 / 434MHz / 3-BUTTONS",
        "2G6959752AD / 434MHz / 3-BUTTONS",
        "2G6959752D / 434MHz / WITH KESSY",
        "2G6959752AF / 434MHz / WITH KESSY",
        "2G6959752H / 434MHz / WITH KESSY",
        "2G6959752AP / 434MHz / WITH KESSY",
        "2G6959752B / 315MHz / 3-BUTTONS",
        "2G6959752F / 315MHz / WITH KESSY",
        "2G6959752J / 315MHz / WITH KESSY",
        "2G6959752AQ / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW ROUTAN",
      years: "2009-2014",
      parts: [
        "7B0959754 / REMOTE START",
        "7B0959754D / REMOTE START",
        "7B0959754A / 6-BUTTONS",
        "7B0959754B / 5-BUTTONS",
        "7B0959754C / 3-BUTTONS"
      ]
    },
    {
      model: "VW SAVEIRO",
      years: "2005-2010",
      parts: [
        "5Z0959753C / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "VW SAVEIRO",
      years: "2010-2013",
      parts: [
        "5U7959753 / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW SAVEIRO",
      years: "2014-2021",
      parts: [
        "7E0837202AD / 434MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW SCIROCCO",
      years: "2008-2011",
      parts: [
        "1K0959753G / 434MHz / 3-BUTTONS",
        "1K0959753N / 434MHz / 3-BUTTONS",
        "1K0959753M / 434MHz / 3-BUTTONS",
        "1K0959753S / 434MHz / 3-BUTTONS",
        "1K0959753J / 315MHz / 3-BUTTONS",
        "1K0959753Q / 315MHz / 3-BUTTONS",
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202E / 434MHz / WITH KESSY",
        "5K0837202AJ / 434MHz / WITH KESSY",
        "5K0837202S / 315MHz / 3-BUTTONS",
        "5K0837202AF / 315MHz / 3-BUTTONS",
        "5K0837202G / 315MHz / WITH KESSY",
        "5K0837202AL / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW SCIROCCO",
      years: "2011-2014",
      parts: [
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202E / 434MHz / WITH KESSY",
        "5K0837202AJ / 434MHz / WITH KESSY",
        "5K0837202S / 315MHz / 3-BUTTONS",
        "5K0837202AF / 315MHz / 3-BUTTONS",
        "5K0837202G / 315MHz / WITH KESSY",
        "5K0837202AL / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW SCIROCCO",
      years: "2014-2017",
      parts: [
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202BH / 434MHz / 3-BUTTONS",
        "5K0837202AJ / 434MHz / WITH KESSY",
        "5K0837202BN / 434MHz / WITH KESSY",
        "5K0837202AF / 315MHz / 3-BUTTONS",
        "5K0837202AG / 315MHz / 3-BUTTONS",
        "5K0837202BL / 315MHz / 3-BUTTONS",
        "5K0837202AL / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW SHARAN",
      years: "1995-2000",
      parts: [
        "7M0959753E / 433MHz / 2-BUTTONS",
        "7M0959753F / 315MHz / 2-BUTTONS"
      ]
    },
    {
      model: "VW SHARAN",
      years: "2000-2010",
      parts: [
        "7M3959753F / 433MHz / 2-BUTTONS"
      ]
    },
    {
      model: "VW SHARAN",
      years: "2011-2016",
      parts: [
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202CT / 434MHz / 3-BUTTONS",
        "5K0837202E / 434MHz / WITH KESSY",
        "5K0837202AJ / 434MHz / WITH KESSY",
        "5K0837202AN / 434MHz / WITH KESSY",
        "5K0837202S / 315MHz / 3-BUTTONS",
        "5K0837202AF / 315MHz / 3-BUTTONS",
        "5K0837202G / 315MHz / WITH KESSY",
        "5K0837202AL / 315MHz / WITH KESSY",
        "7N0837202F / 434MHZ / KESSY+E.S.DOOR",
        "7N0837202K / 434MHZ / E.S.DOOR",
        "7N0837202C / 434MHZ / KESSY+E.S.DOOR",
        "7N0837202N / 434MHZ / KESSY+E.S.DOOR",
        "7N0837202L / 315MHZ / E.S.DOOR",
        "7N0837202H / 315MHZ / E.S.DOOR",
        "7N0837202D / 315MHZ / KESSY+E.S.DOOR",
        "7N0837202P / 315MHZ / KESSY+E.S.DOOR"
      ]
    },
    {
      model: "VW SHARAN",
      years: "2016-2020",
      parts: [
        "5K0837202AH / 434MHz / 3-BUTTONS",
        "5K0837202DL / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202BH / 434MHz / 3-BUTTONS",
        "5K0837202DH / 434MHz / 3-BUTTONS",
        "5K0837202AJ / 434MHz / WITH KESSY",
        "5K0837202BN / 434MHz / WITH KESSY",
        "5K0837202DM / 434MHz / WITH KESSY",
        "5K0837202AF / 315MHz / 3-BUTTONS",
        "5K0837202BK / 315MHz / 3-BUTTONS",
        "5K0837202AL / 315MHz / WITH KESSY",
        "5K0837202BQ / 315MHz / WITH KESSY",
        "7N0837202K / 434MHZ / E.S.DOOR",
        "7N0837202M / 434MHZ / E.S.DOOR",
        "7N0837202AG / 434MHZ / E.S.DOOR",
        "7N0837202AR / 434MHZ / E.S.DOOR",
        "7N0837202AC / 434MHZ / E.S.DOOR",
        "7N0837202AP / 434MHZ / E.S.DOOR",
        "7N0837202N / 434MHZ / KESSY+E.S.DOOR",
        "7N0837202AE / 434MHZ / KESSY+E.S.DOOR",
        "7N0837202AQ / 434MHZ / KESSY+E.S.DOOR",
        "7N0837202L / 315MHZ / E.S.DOOR",
        "7N0837202AD / 315MHZ / E.S.DOOR",
        "7N0837202P / 315MHZ / KESSY+E.S.DOOR",
        "7N0837202AF / 315MHZ / KESSY+E.S.DOOR"
      ]
    },
    {
      model: "VW SHARAN",
      years: "2021 +",
      parts: [
        "5K0837202DQ / 434MHz / 3-BUTTONS",
        "5K0837202EA / 434MHz / 3-BUTTONS",
        "5K0837202EB / 434MHz / WITH KESSY",
        "5K0837202DT / 315MHz / 3-BUTTONS",
        "5K0837202ED / 315MHz / WITH KESSY",
        "7N0837202BC / 434MHZ / E.S.DOOR",
        "7N0837202BA / 434MHZ / E.S.DOOR",
        "7N0837202AT / 434MHZ / KESSY+E.S.DOOR",
        "7N0837202BB / 315MHZ / E.S.DOOR",
        "7N0837202AS / 315MHZ / KESSY+E.S.DOOR"
      ]
    },
    {
      model: "VW T-CROSS",
      years: "2019-2021",
      parts: [
        "2G6959752AD / 434MHz / 3-BUTTONS",
        "2G6959752AF / 434MHz / 3-BUTTONS",
        "2G6959752AP / 434MHz / WITH KESSY",
        "2G6959752H / 434MHz / WITH KESSY",
        "2G6959752B / 315MHz / 3-BUTTONS",
        "2G6959752J / 315MHz / WITH KESSY",
        "2G6959752AQ / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW TERAMONT",
      years: "2019-2021",
      parts: [
        "5G6959752CF / 3-BUTT / WITHOUT KESSY",
        "5G6959752BF / 3-BUTT / WITHOUT KESSY",
        "5G6959752CS / 3-BUTT / WITHOUT KESSY",
        "5G6959752AC/ 4-BUTT / WITHOUT KESSY",
        "5G6959752BG/ 4-BUTT / WITHOUT KESSY",
        "5G6959752CT/ 4-BUTT / WITHOUT KESSY"
      ]
    },
    {
      model: "VW TIGUAN",
      years: "2008-2010",
      parts: [
        "1K0959753G / 434MHz / 3-BUTTONS",
        "1K0959753M / 434MHz / 3-BUTTONS",
        "1K0959753N / 434MHz / 3-BUTTONS",
        "1K0959753J / 315MHz / 3-BUTTONS",
        "1K0959753H / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "VW TIGUAN",
      years: "2011-2016",
      parts: [
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202AH / 434MHz / 3-BUTTONS",
        "5K0837202AN / 434MHz / WITH KESSY",
        "5K0837202AJ / 434MHz / WITH KESSY",
        "5K0837202AM / 434MHz / WITH KESSY",
        "5K0837202AE / 315MHz / 3+1 BUTTONS",
        "5K0837202AG / 315MHz / 3-BUTTONS",
        "5K0837202AF / 315MHz / 3-BUTTONS",
        "5K0837202AK / 315MHz / WITH KESSY",
        "5K0837202AL / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW TIGUAN",
      years: "2016-2021",
      parts: [
        "5G6959752CF / 434MHz / 3-BUTTONS",
        "5G6959752CS / 434MHz / 3-BUTTONS",
        "5G6959752CJ / 434MHz / WITH KESSY",
        "5G6959752BL / 434MHz / WITH KESSY",
        "5G6959752BQ / 434MHz / WITH KESSY",
        "5G6959752AQ / 434MHz / WITH KESSY",
        "5G6959752AL / 315MHz / 3-BUTTONS",
        "5G6959752BN / 315MHz / 3-BUTTONS",
        "5G6959752AP / 315MHz / WITH KESSY",
        "5G6959752BP / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW TOURAN",
      years: "2003-2011",
      parts: [
        "1K0959753G / 434MHz / 3-BUTTONS",
        "1K0959753N / 434MHz / 3-BUTTONS",
        "1K0959753M / 434MHz / 3-BUTTONS",
        "1K0959753H / 315MHz / 3-BUTTONS",
        "1K0959753J / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW TOURAN",
      years: "2011-2015",
      parts: [
        "5K0837202Q / 434MHz / 3-BUTTONS",
        "5K0837202AD / 434MHz / 3-BUTTONS",
        "5K0837202AA / 434MHz / 3-BUTTONS",
        "5K0837202AH / 434MHz / 3-BUTTONS",
        "5K0837202R / 315MHz / 3+1 BUTTONS",
        "5K0837202AE / 315MHz / 3+1 BUTTONS"
      ]
    },
    {
      model: "VW TOURAN",
      years: "2016-2021",
      parts: [
        "5G6959752CF / 434MHz / 3-BUTTONS",
        "5G6959752CS / 434MHz / 3-BUTTONS",
        "5G6959752CJ / 434MHz / WITH KESSY",
        "5G6959752BL / 434MHz / WITH KESSY",
        "5G6959752DD / 434MHz / WITH KESSY",
        "5G6959752AL / 315MHz / 3-BUTTONS",
        "5G6959752BN / 315MHz / 3-BUTTONS",
        "5G6959752AP / 315MHz / WITH KESSY",
        "5G6959752BP / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW TOUAREG",
      years: "2003-2007",
      parts: [
        "3D0959753P / 433MHz / 3-BUTTONS",
        "3D0959753S / 433MHz / WITH KESSY",
        "3D0959753F / 315MHz / 2+1 BUTTONS",
        "3D0959753Q / 315MHz / 3+1 BUTTONS",
        "3D0959753G / 315MHz / WITH KESSY",
        "3D0959753T / 315MHz / WITH KESSY",
        "3D0959753R / 315MHz / 3-BUTTONS",
        "3D0959753AA / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW TOUAREG",
      years: "2008-2010",
      parts: [
        "3D0959753AK / 434MHz / 3-BUTTONS",
        "3D0959753AM / 434MHz / WITH KESSY",
        "3D0959753AH/ 434MHz / WITH KESSY",
        "3D0959753AL / 315MHz / 3-BUTTONS",
        "3D0959753BE / 315MHz / 3-BUTTONS",
        "3D0959753AN / 315MHz / WITH KESSY",
        "3D0959753BA / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW TOUAREG",
      years: "2010-2014",
      parts: [
        "7P6959754G / 868MHz / WITH KESSY",
        "7P6959754K / 868MHz / REMOTE",
        "7P6959754B / 433MHz / WITH KESSY",
        "7P6959754F / 433MHz / REMOTE",
        "7P6959754AQ / 433MHz / REMOTE",
        "7P6959754A / 315MHz / WITH KESSY",
        "7P6959754E / 315MHz / REMOTE"
      ]
    },
    {
      model: "VW TOUAREG",
      years: "2014-2018",
      parts: [
        "7P6959754AB / 868MHz / WITH KESSY",
        "7P6959754AL / 868MHz / REMOTE",
        "7P6959754AA / 433MHz / WITH KESSY",
        "7P6959754AK / 433MHz / REMOTE",
        "7P6959754AC / 315MHz / WITH KESSY",
        "7P6959754AM / 315MHz / REMOTE"
      ]
    },
    {
      model: "VW TOUAREG",
      years: "2018-2021",
      parts: [
        "4N0959754G / 433MHz",
        "4N0959754J / 433MHz",
        "4N0959754C / 315MHz"
      ]
    },
    {
      model: "VW T-ROC",
      years: "2018-2021",
      parts: [
        "2G6959752AD / 434MHz / 3-BUTTONS",
        "2G6959752AF / 434MHz / 3-BUTTONS",
        "2G6959752AP / 434MHz / WITH KESSY",
        "2G6959752H / 434MHz / WITH KESSY",
        "2G6959752B / 315MHz / 3-BUTTONS",
        "2G6959752J / 315MHz / WITH KESSY",
        "2G6959752AQ / 315MHz / WITH KESSY"
      ]
    },
    {
      model: "VW UP / E-UP",
      years: "2011-2016",
      parts: [
        "1S0837202 / 434MHz / 2-BUTTONS",
        "1S0837202D / 434MHz / 3-BUTTONS",
        "1S0837202B / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW UP / E-UP",
      years: "2016-2021",
      parts: [
        "1S0837202 / 434MHz / 2-BUTTONS",
        "1S0837202D / 434MHz / 3-BUTTONS",
        "1S0837202F / 434MHz / 3-BUTTONS",
        "1S0837202C / 434MHz / 3-BUTTONS",
        "1S0837202G / 315MHz / 3-BUTTONS",
        "1S0837202H / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW TRANSPORTER / T5",
      years: "2003-2009",
      parts: [
        "7H0959753 / 433MHz / 2-BUTTONS",
        "7H0959753B / 433MHz / 3-BUTTONS",
        "7H0959753A / 315MHz / 3-BUTTONS"
      ]
    },
    {
      model: "VW TRANSPORTER / T5 / T6",
      years: "2010-2021",
      parts: [
        "7E0837202BD / 434MHz / 2-BUTTONS",
        "7E0837202CF / 434MHz / 2-BUTTONS",
        "7E0837202BQ / 434MHz / 2-BUTTONS",
        "7E0837202BF / 434MHz / 2-BUTTONS",
        "7E0837202BP / 434MHz / 2-BUTTONS",
        "7E0837202CE / 434MHz / 2-BUTTONS",
        "7E0837202BH / 434MHz / 2-BUTTONS",
        "7E0837202CC / 434MHz / 2-BUTTONS",
        "7E0837202BE / 434MHz / 2+1 BUTTONS",
        "7E0837202CB / 434MHz / 2+1 BUTTONS",
        "7E0837202AD / 434MHz / 3-BUTTONS",
        "7E0837202H / 434MHz / 3-BUTTONS",
        "7E0837202AJ / 434MHz / WITH KESSY"
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
              <h1 className="text-gray-900">Volkswagen Part Numbers</h1>
              <p className="text-sm text-gray-600">
                Cross-reference part numbers for Volkswagen vehicles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Data List */}
        <div className="space-y-4">
          {vwData.map((item, index) => (
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
            <strong>Note:</strong> Volkswagen part numbers typically start with specific prefixes 
            (e.g., 1J0, 3C0, 5K0) and often share components with other VAG brands. This database 
            will help identify cross-compatible parts across Audi, SEAT, and Skoda. As the core 
            VAG brand, many VW part numbers serve as the base reference for equivalent components.
          </p>
        </div>
      </div>
    </div>
  );
}
