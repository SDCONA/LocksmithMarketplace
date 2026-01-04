import { useState } from "react";
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
  const [currentPage, setCurrentPage] = useState<'hub' | 'transponder-fitment' | 'vag-part-numbers' | 'vag-audi-parts' | 'vag-seat-parts' | 'vag-skoda-parts' | 'vag-volkswagen-parts' | 'car-make-transponder' | 'audi' | 'acura' | 'alfa-romeo' | 'bmw' | 'buick' | 'cadillac' | 'chevrolet' | 'chrysler' | 'citroen' | 'dacia' | 'daf' | 'daewoo' | 'daihatsu' | 'dodge' | 'fiat' | 'ford' | 'gmc' | 'honda' | 'hummer' | 'hyundai' | 'iveco' | 'isuzu' | 'jaguar' | 'jeep' | 'kawasaki' | 'kia' | 'lancia' | 'land-rover' | 'lexus' | 'lincoln' | 'mazda' | 'mercedes' | 'mitsubishi' | 'nissan' | 'opel' | 'peugeot' | 'porsche' | 'renault' | 'rover' | 'seat' | 'skoda' | 'subaru' | 'suzuki' | 'toyota' | 'volkswagen' | 'volvo' | 'yamaha'>('hub');
  const [selectedCarMake, setSelectedCarMake] = useState<string | null>(null);

  const handleNavigateToTransponderFitment = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    setCurrentPage('transponder-fitment');
  };

  const handleNavigateToVAGPartNumbers = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    setCurrentPage('vag-part-numbers');
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
          onBack={() => setCurrentPage('hub')}
          onSelectBrand={(brand) => {
            if (brand === 'Audi') {
              setCurrentPage('vag-audi-parts');
            } else if (brand === 'SEAT') {
              setCurrentPage('vag-seat-parts');
            } else if (brand === 'Skoda') {
              setCurrentPage('vag-skoda-parts');
            } else if (brand === 'Volkswagen') {
              setCurrentPage('vag-volkswagen-parts');
            }
          }}
        />
      )}

      {/* VAG Brand Part Number Pages */}
      {currentPage === 'vag-audi-parts' && (
        <AudiPartNumbersPage
          onBack={() => setCurrentPage('vag-part-numbers')}
        />
      )}

      {currentPage === 'vag-seat-parts' && (
        <SeatPartNumbersPage
          onBack={() => setCurrentPage('vag-part-numbers')}
        />
      )}

      {currentPage === 'vag-skoda-parts' && (
        <SkodaPartNumbersPage
          onBack={() => setCurrentPage('vag-part-numbers')}
        />
      )}

      {currentPage === 'vag-volkswagen-parts' && (
        <VolkswagenPartNumbersPage
          onBack={() => setCurrentPage('vag-part-numbers')}
        />
      )}

      {/* Transponder Fitment Page */}
      {currentPage === 'transponder-fitment' && (
        <TransponderFitmentPage
          onBack={() => setCurrentPage('hub')}
          onSelectMake={(make) => {
            setSelectedCarMake(make);
            if (make === 'Audi') {
              setCurrentPage('audi');
            } else if (make === 'Acura') {
              setCurrentPage('acura');
            } else if (make === 'Alfa Romeo') {
              setCurrentPage('alfa-romeo');
            } else if (make === 'BMW') {
              setCurrentPage('bmw');
            } else if (make === 'Buick') {
              setCurrentPage('buick');
            } else if (make === 'Cadillac') {
              setCurrentPage('cadillac');
            } else if (make === 'Chevrolet') {
              setCurrentPage('chevrolet');
            } else if (make === 'Chrysler') {
              setCurrentPage('chrysler');
            } else if (make === 'Citroën') {
              setCurrentPage('citroen');
            } else if (make === 'Dacia') {
              setCurrentPage('dacia');
            } else if (make === 'DAF') {
              setCurrentPage('daf');
            } else if (make === 'DAEWOO') {
              setCurrentPage('daewoo');
            } else if (make === 'Daihatsu') {
              setCurrentPage('daihatsu');
            } else if (make === 'Dodge') {
              setCurrentPage('dodge');
            } else if (make === 'Fiat') {
              setCurrentPage('fiat');
            } else if (make === 'Ford') {
              setCurrentPage('ford');
            } else if (make === 'GMC') {
              setCurrentPage('gmc');
            } else if (make === 'Honda') {
              setCurrentPage('honda');
            } else if (make === 'Hummer') {
              setCurrentPage('hummer');
            } else if (make === 'Hyundai') {
              setCurrentPage('hyundai');
            } else if (make === 'Iveco') {
              setCurrentPage('iveco');
            } else if (make === 'Isuzu') {
              setCurrentPage('isuzu');
            } else if (make === 'Jaguar') {
              setCurrentPage('jaguar');
            } else if (make === 'Jeep') {
              setCurrentPage('jeep');
            } else if (make === 'Kawasaki') {
              setCurrentPage('kawasaki');
            } else if (make === 'Kia') {
              setCurrentPage('kia');
            } else if (make === 'Lancia') {
              setCurrentPage('lancia');
            } else if (make === 'Land Rover') {
              setCurrentPage('land-rover');
            } else if (make === 'Lexus') {
              setCurrentPage('lexus');
            } else if (make === 'Lincoln') {
              setCurrentPage('lincoln');
            } else if (make === 'Mazda') {
              setCurrentPage('mazda');
            } else if (make === 'Mercedes-Benz') {
              setCurrentPage('mercedes');
            } else if (make === 'Mitsubishi') {
              setCurrentPage('mitsubishi');
            } else if (make === 'Nissan') {
              setCurrentPage('nissan');
            } else if (make === 'Opel') {
              setCurrentPage('opel');
            } else if (make === 'Peugeot') {
              setCurrentPage('peugeot');
            } else if (make === 'Porsche') {
              setCurrentPage('porsche');
            } else if (make === 'Renault') {
              setCurrentPage('renault');
            } else if (make === 'Rover') {
              setCurrentPage('rover');
            } else if (make === 'SEAT') {
              setCurrentPage('seat');
            } else if (make === 'Skoda') {
              setCurrentPage('skoda');
            } else if (make === 'Subaru') {
              setCurrentPage('subaru');
            } else if (make === 'Suzuki') {
              setCurrentPage('suzuki');
            } else if (make === 'Toyota') {
              setCurrentPage('toyota');
            } else if (make === 'Volkswagen') {
              setCurrentPage('volkswagen');
            } else if (make === 'Volvo') {
              setCurrentPage('volvo');
            } else if (make === 'Yamaha') {
              setCurrentPage('yamaha');
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