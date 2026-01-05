import { useState, useEffect } from "react";
import { HubPage } from "./HubPage";
import { TransponderFitmentPage } from "./TransponderFitmentPage";
import { CarMakeTransponderPage } from "./CarMakeTransponderPage";
import { SeatSkodaAudiVWPartNumbersPage } from "./SeatSkodaAudiVWPartNumbersPage";
import { AudiPartNumbersPage } from "./AudiPartNumbersPage";
import { SeatPartNumbersPage } from "./SeatPartNumbersPage";
import { SkodaPartNumbersPage } from "./SkodaPartNumbersPage";
import { VolkswagenPartNumbersPage } from "./VolkswagenPartNumbersPage";
import { AudiTransponderPage } from "./AudiTransponderPage";
import { AcuraTransponderPage } from "./AcuraTransponderPage";
import { AlfaRomeoTransponderPage } from "./AlfaRomeoTransponderPage";
import { BMWTransponderPage } from "./BMWTransponderPage";
import { BuickTransponderPage } from "./BuickTransponderPage";
import { CadillacTransponderPage } from "./CadillacTransponderPage";
import { ChevroletTransponderPage } from "./ChevroletTransponderPage";
import { ChryslerTransponderPage } from "./ChryslerTransponderPage";
import { CitroenTransponderPage } from "./CitroenTransponderPage";
import { DaciaTransponderPage } from "./DaciaTransponderPage";
import { DafTransponderPage } from "./DafTransponderPage";
import { DaewooTransponderPage } from "./DaewooTransponderPage";
import { DaihatsuTransponderPage } from "./DaihatsuTransponderPage";
import { DodgeTransponderPage } from "./DodgeTransponderPage";
import { FiatTransponderPage } from "./FiatTransponderPage";
import { FordTransponderPage } from "./FordTransponderPage";
import { GMCTransponderPage } from "./GMCTransponderPage";
import { HondaTransponderPage } from "./HondaTransponderPage";
import { HummerTransponderPage } from "./HummerTransponderPage";
import { HyundaiTransponderPage } from "./HyundaiTransponderPage";
import { IvecoTransponderPage } from "./IvecoTransponderPage";
import { IsisuTransponderPage } from "./IsisuTransponderPage";
import { JaguarTransponderPage } from "./JaguarTransponderPage";
import { JeepTransponderPage } from "./JeepTransponderPage";
import { KawasakiTransponderPage } from "./KawasakiTransponderPage";
import { KiaTransponderPage } from "./KiaTransponderPage";
import { LanciaTransponderPage } from "./LanciaTransponderPage";
import { LandRoverTransponderPage } from "./LandRoverTransponderPage";
import { LexusTransponderPage } from "./LexusTransponderPage";
import { LincolnTransponderPage } from "./LincolnTransponderPage";
import { MazdaTransponderPage } from "./MazdaTransponderPage";
import { MercedesTransponderPage } from "./MercedesTransponderPage";
import { MitsubishiTransponderPage } from "./MitsubishiTransponderPage";
import { NissanTransponderPage } from "./NissanTransponderPage";
import { OpelTransponderPage } from "./OpelTransponderPage";
import { PeugeotTransponderPage } from "./PeugeotTransponderPage";
import { PorscheTransponderPage } from "./PorscheTransponderPage";
import { RenaultTransponderPage } from "./RenaultTransponderPage";
import { RoverTransponderPage } from "./RoverTransponderPage";
import { SeatTransponderPage } from "./SeatTransponderPage";
import { SkodaTransponderPage } from "./SkodaTransponderPage";
import { SubaruTransponderPage } from "./SubaruTransponderPage";
import { SuzukiTransponderPage } from "./SuzukiTransponderPage";
import { ToyotaTransponderPage } from "./ToyotaTransponderPage";
import { VolkswagenTransponderPage } from "./VolkswagenTransponderPage";
import { VolvoTransponderPage } from "./VolvoTransponderPage";
import { YamahaTransponderPage } from "./YamahaTransponderPage";

interface HubSectionProps {
  onBack: () => void;
  user: any;
  onAuthRequired: () => void;
}

export function HubSection({ onBack, user, onAuthRequired }: HubSectionProps) {
  // Initialize from URL hash (e.g., #hub-transponder-fitment)
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#hub-', '');
    if (hash && hash !== '') {
      return hash as any;
    }
    return 'hub';
  };

  const [currentPage, setCurrentPage] = useState<'hub' | 'transponder-fitment' | 'vag-part-numbers' | 'vag-audi-parts' | 'vag-seat-parts' | 'vag-skoda-parts' | 'vag-volkswagen-parts' | 'car-make-transponder' | 'audi' | 'acura' | 'alfa-romeo' | 'bmw' | 'buick' | 'cadillac' | 'chevrolet' | 'chrysler' | 'citroen' | 'dacia' | 'daf' | 'daewoo' | 'daihatsu' | 'dodge' | 'fiat' | 'ford' | 'gmc' | 'honda' | 'hummer' | 'hyundai' | 'iveco' | 'isuzu' | 'jaguar' | 'jeep' | 'kawasaki' | 'kia' | 'lancia' | 'land-rover' | 'lexus' | 'lincoln' | 'mazda' | 'mercedes' | 'mitsubishi' | 'nissan' | 'opel' | 'peugeot' | 'porsche' | 'renault' | 'rover' | 'seat' | 'skoda' | 'subaru' | 'suzuki' | 'toyota' | 'volkswagen' | 'volvo' | 'yamaha'>(getInitialPage);
  const [selectedCarMake, setSelectedCarMake] = useState<string | null>(null);

  // Listen for hash changes (browser back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#hub-', '');
      if (hash && hash !== '') {
        setCurrentPage(hash as any);
      } else {
        setCurrentPage('hub');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when page changes
  const navigateToPage = (page: typeof currentPage) => {
    window.location.hash = `hub-${page}`;
    setCurrentPage(page);
  };

  const handleNavigateToTransponderFitment = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    navigateToPage('transponder-fitment');
  };

  const handleNavigateToVAGPartNumbers = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    navigateToPage('vag-part-numbers');
  };

  return (
    <>
      {/* Hub Main Page */}
      {currentPage === 'hub' && (
        <HubPage
          onBack={onBack}
          onNavigateToTransponderFitment={handleNavigateToTransponderFitment}
          onNavigateToVAGPartNumbers={handleNavigateToVAGPartNumbers}
          isAuthenticated={!!user}
        />
      )}

      {/* VAG Part Numbers Main Page */}
      {currentPage === 'vag-part-numbers' && (
        <SeatSkodaAudiVWPartNumbersPage
          onBack={() => navigateToPage('hub')}
          onSelectBrand={(brand) => {
            if (brand === 'Audi') {
              navigateToPage('vag-audi-parts');
            } else if (brand === 'SEAT') {
              navigateToPage('vag-seat-parts');
            } else if (brand === 'Skoda') {
              navigateToPage('vag-skoda-parts');
            } else if (brand === 'Volkswagen') {
              navigateToPage('vag-volkswagen-parts');
            }
          }}
        />
      )}

      {/* VAG Brand Part Number Pages */}
      {currentPage === 'vag-audi-parts' && (
        <AudiPartNumbersPage
          onBack={() => navigateToPage('vag-part-numbers')}
        />
      )}

      {currentPage === 'vag-seat-parts' && (
        <SeatPartNumbersPage
          onBack={() => navigateToPage('vag-part-numbers')}
        />
      )}

      {currentPage === 'vag-skoda-parts' && (
        <SkodaPartNumbersPage
          onBack={() => navigateToPage('vag-part-numbers')}
        />
      )}

      {currentPage === 'vag-volkswagen-parts' && (
        <VolkswagenPartNumbersPage
          onBack={() => navigateToPage('vag-part-numbers')}
        />
      )}

      {/* Transponder Fitment Page */}
      {currentPage === 'transponder-fitment' && (
        <TransponderFitmentPage
          onBack={() => navigateToPage('hub')}
          onSelectMake={(make) => {
            setSelectedCarMake(make);
            if (make === 'Audi') {
              navigateToPage('audi');
            } else if (make === 'Acura') {
              navigateToPage('acura');
            } else if (make === 'Alfa Romeo') {
              navigateToPage('alfa-romeo');
            } else if (make === 'BMW') {
              navigateToPage('bmw');
            } else if (make === 'Buick') {
              navigateToPage('buick');
            } else if (make === 'Cadillac') {
              navigateToPage('cadillac');
            } else if (make === 'Chevrolet') {
              navigateToPage('chevrolet');
            } else if (make === 'Chrysler') {
              navigateToPage('chrysler');
            } else if (make === 'Citroën') {
              navigateToPage('citroen');
            } else if (make === 'Dacia') {
              navigateToPage('dacia');
            } else if (make === 'DAF') {
              navigateToPage('daf');
            } else if (make === 'DAEWOO') {
              navigateToPage('daewoo');
            } else if (make === 'Daihatsu') {
              navigateToPage('daihatsu');
            } else if (make === 'Dodge') {
              navigateToPage('dodge');
            } else if (make === 'Fiat') {
              navigateToPage('fiat');
            } else if (make === 'Ford') {
              navigateToPage('ford');
            } else if (make === 'GMC') {
              navigateToPage('gmc');
            } else if (make === 'Honda') {
              navigateToPage('honda');
            } else if (make === 'Hummer') {
              navigateToPage('hummer');
            } else if (make === 'Hyundai') {
              navigateToPage('hyundai');
            } else if (make === 'Iveco') {
              navigateToPage('iveco');
            } else if (make === 'Isuzu') {
              navigateToPage('isuzu');
            } else if (make === 'Jaguar') {
              navigateToPage('jaguar');
            } else if (make === 'Jeep') {
              navigateToPage('jeep');
            } else if (make === 'Kawasaki') {
              navigateToPage('kawasaki');
            } else if (make === 'Kia') {
              navigateToPage('kia');
            } else if (make === 'Lancia') {
              navigateToPage('lancia');
            } else if (make === 'Land Rover') {
              navigateToPage('land-rover');
            } else if (make === 'Lexus') {
              navigateToPage('lexus');
            } else if (make === 'Lincoln') {
              navigateToPage('lincoln');
            } else if (make === 'Mazda') {
              navigateToPage('mazda');
            } else if (make === 'Mercedes-Benz') {
              navigateToPage('mercedes');
            } else if (make === 'Mitsubishi') {
              navigateToPage('mitsubishi');
            } else if (make === 'Nissan') {
              navigateToPage('nissan');
            } else if (make === 'Opel') {
              navigateToPage('opel');
            } else if (make === 'Peugeot') {
              navigateToPage('peugeot');
            } else if (make === 'Porsche') {
              navigateToPage('porsche');
            } else if (make === 'Renault') {
              navigateToPage('renault');
            } else if (make === 'Rover') {
              navigateToPage('rover');
            } else if (make === 'SEAT') {
              navigateToPage('seat');
            } else if (make === 'Skoda') {
              navigateToPage('skoda');
            } else if (make === 'Subaru') {
              navigateToPage('subaru');
            } else if (make === 'Suzuki') {
              navigateToPage('suzuki');
            } else if (make === 'Toyota') {
              navigateToPage('toyota');
            } else if (make === 'Volkswagen') {
              navigateToPage('volkswagen');
            } else if (make === 'Volvo') {
              navigateToPage('volvo');
            } else if (make === 'Yamaha') {
              navigateToPage('yamaha');
            } else {
              setCurrentPage('car-make-transponder');
            }
          }}
        />
      )}

      {/* Audi Transponder Page */}
      {currentPage === 'audi' && (
        <AudiTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Acura Transponder Page */}
      {currentPage === 'acura' && (
        <AcuraTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Alfa Romeo Transponder Page */}
      {currentPage === 'alfa-romeo' && (
        <AlfaRomeoTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* BMW Transponder Page */}
      {currentPage === 'bmw' && (
        <BMWTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Buick Transponder Page */}
      {currentPage === 'buick' && (
        <BuickTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Cadillac Transponder Page */}
      {currentPage === 'cadillac' && (
        <CadillacTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Chevrolet Transponder Page */}
      {currentPage === 'chevrolet' && (
        <ChevroletTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Chrysler Transponder Page */}
      {currentPage === 'chrysler' && (
        <ChryslerTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Citroën Transponder Page */}
      {currentPage === 'citroen' && (
        <CitroenTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Dacia Transponder Page */}
      {currentPage === 'dacia' && (
        <DaciaTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* DAF Transponder Page */}
      {currentPage === 'daf' && (
        <DafTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* DAEWOO Transponder Page */}
      {currentPage === 'daewoo' && (
        <DaewooTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Daihatsu Transponder Page */}
      {currentPage === 'daihatsu' && (
        <DaihatsuTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Dodge Transponder Page */}
      {currentPage === 'dodge' && (
        <DodgeTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Fiat Transponder Page */}
      {currentPage === 'fiat' && (
        <FiatTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Ford Transponder Page */}
      {currentPage === 'ford' && (
        <FordTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* GMC Transponder Page */}
      {currentPage === 'gmc' && (
        <GMCTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Honda Transponder Page */}
      {currentPage === 'honda' && (
        <HondaTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Hummer Transponder Page */}
      {currentPage === 'hummer' && (
        <HummerTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Hyundai Transponder Page */}
      {currentPage === 'hyundai' && (
        <HyundaiTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Iveco Transponder Page */}
      {currentPage === 'iveco' && (
        <IvecoTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Isuzu Transponder Page */}
      {currentPage === 'isuzu' && (
        <IsusuTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Jaguar Transponder Page */}
      {currentPage === 'jaguar' && (
        <JaguarTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Jeep Transponder Page */}
      {currentPage === 'jeep' && (
        <JeepTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Kawasaki Transponder Page */}
      {currentPage === 'kawasaki' && (
        <KawasakiTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Kia Transponder Page */}
      {currentPage === 'kia' && (
        <KiaTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Lancia Transponder Page */}
      {currentPage === 'lancia' && (
        <LanciaTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Land Rover Transponder Page */}
      {currentPage === 'land-rover' && (
        <LandRoverTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Lexus Transponder Page */}
      {currentPage === 'lexus' && (
        <LexusTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Lincoln Transponder Page */}
      {currentPage === 'lincoln' && (
        <LincolnTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Mazda Transponder Page */}
      {currentPage === 'mazda' && (
        <MazdaTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Mercedes Transponder Page */}
      {currentPage === 'mercedes' && (
        <MercedesTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Mitsubishi Transponder Page */}
      {currentPage === 'mitsubishi' && (
        <MitsubishiTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Nissan Transponder Page */}
      {currentPage === 'nissan' && (
        <NissanTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Opel Transponder Page */}
      {currentPage === 'opel' && (
        <OpelTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Peugeot Transponder Page */}
      {currentPage === 'peugeot' && (
        <PeugeotTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Porsche Transponder Page */}
      {currentPage === 'porsche' && (
        <PorscheTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Renault Transponder Page */}
      {currentPage === 'renault' && (
        <RenaultTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Rover Transponder Page */}
      {currentPage === 'rover' && (
        <RoverTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* SEAT Transponder Page */}
      {currentPage === 'seat' && (
        <SeatTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Skoda Transponder Page */}
      {currentPage === 'skoda' && (
        <SkodaTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Subaru Transponder Page */}
      {currentPage === 'subaru' && (
        <SubaruTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Suzuki Transponder Page */}
      {currentPage === 'suzuki' && (
        <SuzukiTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Toyota Transponder Page */}
      {currentPage === 'toyota' && (
        <ToyotaTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Volkswagen Transponder Page */}
      {currentPage === 'volkswagen' && (
        <VolkswagenTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Volvo Transponder Page */}
      {currentPage === 'volvo' && (
        <VolvoTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Yamaha Transponder Page */}
      {currentPage === 'yamaha' && (
        <YamahaTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
        />
      )}

      {/* Car Make Transponder Page (Placeholder for other makes) */}
      {currentPage === 'car-make-transponder' && selectedCarMake && (
        <CarMakeTransponderPage
          onBack={() => setCurrentPage('transponder-fitment')}
          make={selectedCarMake}
        />
      )}
    </>
  );
}