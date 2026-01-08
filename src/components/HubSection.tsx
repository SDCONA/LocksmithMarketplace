import { useState, useEffect } from "react";
import { HubPage } from "./HubPage";
import { TransponderFitmentPage } from "./TransponderFitmentPage";
import { CarMakeTransponderPage } from "./CarMakeTransponderPage";
import { SeatSkodaAudiVWPartNumbersPage } from "./SeatSkodaAudiVWPartNumbersPage";
import { AudiPartNumbersPage } from "./AudiPartNumbersPage";
import { SeatPartNumbersPage } from "./SeatPartNumbersPage";
import { SkodaPartNumbersPage } from "./SkodaPartNumbersPage";
import { VolkswagenPartNumbersPage } from "./VolkswagenPartNumbersPage";
import { ImmobiliserLocationPage } from "./ImmobiliserLocationPage";
import { ImmobiliserModelSelector } from "./ImmobiliserModelSelector";
import { ImmobiliserPDFViewer } from "./ImmobiliserPDFViewer";
import { LishiFitmentPage } from "./LishiFitmentPage";
import { AudiTransponderPage } from "./AudiTransponderPage";

interface HubSectionProps {
  onBack: () => void;
}

export function HubSection({ onBack }: HubSectionProps) {
  // Initialize from URL hash (e.g., #hub-transponder-fitment)
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#hub-', '');
    if (hash && hash !== '') {
      return hash as any;
    }
    return 'hub';
  };

  const [currentPage, setCurrentPage] = useState<'hub' | 'transponder-fitment' | 'immobiliser-location' | 'immobiliser-model' | 'immobiliser-viewer' | 'vag-part-numbers' | 'vag-audi-parts' | 'vag-seat-parts' | 'vag-skoda-parts' | 'vag-volkswagen-parts' | 'lishi-fitment' | 'car-make-transponder' | 'audi' | 'acura' | 'alfa-romeo' | 'bmw' | 'buick' | 'cadillac' | 'chevrolet' | 'chrysler' | 'citroen' | 'dacia' | 'daf' | 'daewoo' | 'daihatsu' | 'dodge' | 'fiat' | 'ford' | 'gmc' | 'honda' | 'hummer' | 'hyundai' | 'iveco' | 'isuzu' | 'jaguar' | 'jeep' | 'kawasaki' | 'kia' | 'lancia' | 'land-rover' | 'lexus' | 'lincoln' | 'mazda' | 'mercedes' | 'mitsubishi' | 'nissan' | 'opel' | 'peugeot' | 'porsche' | 'renault' | 'rover' | 'seat' | 'skoda' | 'subaru' | 'suzuki' | 'toyota' | 'volkswagen' | 'volvo' | 'yamaha'>(getInitialPage);
  const [selectedCarMake, setSelectedCarMake] = useState<string | null>(null);
  
  // Immobiliser Location state
  const [immobiliserBrand, setImmobiliserBrand] = useState<string | null>(null);
  const [immobiliserModel, setImmobiliserModel] = useState<string | null>(null);
  const [immobiliserPages, setImmobiliserPages] = useState<{ start: number; end: number } | null>(null);

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
    navigateToPage('transponder-fitment');
  };

  const handleNavigateToVAGPartNumbers = () => {
    navigateToPage('vag-part-numbers');
  };

  const handleNavigateToImmobiliserLocation = () => {
    navigateToPage('immobiliser-location');
  };

  const handleNavigateToLishiFitment = () => {
    navigateToPage('lishi-fitment');
  };

  return (
    <>
      {/* Hub Main Page */}
      {currentPage === 'hub' && (
        <HubPage
          onBack={onBack}
          onNavigateToTransponderFitment={handleNavigateToTransponderFitment}
          onNavigateToVAGPartNumbers={handleNavigateToVAGPartNumbers}
          onNavigateToImmobiliserLocation={handleNavigateToImmobiliserLocation}
          onNavigateToLishiFitment={handleNavigateToLishiFitment}
        />
      )}

      {/* Immobiliser Location - Brand Selector */}
      {currentPage === 'immobiliser-location' && (
        <ImmobiliserLocationPage
          onBack={() => navigateToPage('hub')}
          onSelectBrand={(brand) => {
            setImmobiliserBrand(brand);
            navigateToPage('immobiliser-model');
          }}
        />
      )}

      {/* Immobiliser Location - Model Selector */}
      {currentPage === 'immobiliser-model' && immobiliserBrand && (
        <ImmobiliserModelSelector
          brand={immobiliserBrand}
          onBack={() => navigateToPage('immobiliser-location')}
          onSelectModel={(model, startPage, endPage) => {
            setImmobiliserModel(model);
            setImmobiliserPages({ start: startPage, end: endPage });
            navigateToPage('immobiliser-viewer');
          }}
        />
      )}

      {/* Immobiliser Location - PDF Viewer */}
      {currentPage === 'immobiliser-viewer' && immobiliserBrand && immobiliserModel && immobiliserPages && (
        <ImmobiliserPDFViewer
          brand={immobiliserBrand}
          model={immobiliserModel}
          startPage={immobiliserPages.start}
          endPage={immobiliserPages.end}
          onBack={() => navigateToPage('immobiliser-model')}
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
          onBack={() => navigateToPage('transponder-fitment')}
        />
      )}

      {/* Lishi Fitment Catalog */}
      {currentPage === 'lishi-fitment' && (
        <LishiFitmentPage
          onBack={() => navigateToPage('hub')}
        />
      )}

      {/* Car Make Transponder Page (Placeholder for other makes) */}
      {currentPage === 'car-make-transponder' && selectedCarMake && (
        <CarMakeTransponderPage
          onBack={() => navigateToPage('transponder-fitment')}
          make={selectedCarMake}
        />
      )}
    </>
  );
}