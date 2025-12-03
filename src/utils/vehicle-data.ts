// Vehicle Database Utility Functions
// For loading and querying the vehicle-data.json file

export interface VehicleData {
  metadata: {
    version: string;
    lastUpdated: string;
    yearRange: { min: number; max: number };
    totalYears: number;
    description: string;
  };
  yearRanges: {
    [key: string]: {
      description: string;
      makes: string[];
      models: { [make: string]: string[] };
    };
  };
}

// Default vehicle database embedded as fallback
const defaultVehicleData: VehicleData = {
  metadata: {
    version: "1.0.0",
    lastUpdated: "2025-10-17",
    yearRange: {
      min: 1950,
      max: 2026
    },
    totalYears: 77,
    description: "Comprehensive vehicle database for locksmith job tracking"
  },
  yearRanges: {
    "2020-2026": {
      description: "Modern vehicles including EVs",
      makes: [
        "Acura", "Alfa Romeo", "Audi", "Bentley", "BMW", "Buick", "Cadillac", "Chevrolet",
        "Chrysler", "Dodge", "FIAT", "Ford", "Genesis", "GMC", "Honda", "Hyundai",
        "INFINITI", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Maserati",
        "Mazda", "Mercedes-Benz", "MINI", "Mitsubishi", "Nissan", "Polestar", "Porsche",
        "Ram", "Rolls-Royce", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
      ],
      models: {
        "Acura": ["ILX", "Integra", "MDX", "NSX", "RDX", "TLX"],
        "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
        "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "e-tron", "e-tron GT", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "RS3", "RS4", "RS5", "RS6", "RS7", "RS Q8", "S3", "S4", "S5", "S6", "S7", "S8", "SQ5", "SQ7", "SQ8"],
        "Bentley": ["Bentayga", "Continental GT", "Flying Spur"],
        "BMW": ["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "8 Series", "i4", "i7", "iX", "M2", "M3", "M4", "M5", "M8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "Z4"],
        "Buick": ["Enclave", "Encore", "Encore GX", "Envision"],
        "Cadillac": ["CT4", "CT5", "Escalade", "Escalade ESV", "XT4", "XT5", "XT6", "LYRIQ"],
        "Chevrolet": ["Blazer", "Bolt EUV", "Bolt EV", "Camaro", "Colorado", "Corvette", "Equinox", "Malibu", "Silverado 1500", "Suburban", "Tahoe", "Traverse", "Trax"],
        "Chrysler": ["300", "Pacifica", "Voyager"],
        "Dodge": ["Challenger", "Charger", "Durango", "Hornet"],
        "FIAT": ["500X"],
        "Ford": ["Bronco", "Bronco Sport", "Edge", "Escape", "Explorer", "F-150", "Lightning", "Maverick", "Mustang", "Mustang Mach-E", "Ranger"],
        "Genesis": ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
        "GMC": ["Acadia", "Canyon", "Sierra 1500", "Terrain", "Yukon", "Yukon XL"],
        "Honda": ["Accord", "Civic", "CR-V", "HR-V", "Odyssey", "Passport", "Pilot", "Ridgeline"],
        "Hyundai": ["Elantra", "IONIQ 5", "IONIQ 6", "Kona", "Palisade", "Santa Cruz", "Santa Fe", "Sonata", "Tucson", "Venue"],
        "INFINITI": ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"],
        "Jaguar": ["E-PACE", "F-PACE", "F-TYPE", "I-PACE"],
        "Jeep": ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Grand Wagoneer", "Renegade", "Wagoneer", "Wrangler"],
        "Kia": ["Carnival", "EV6", "EV9", "Forte", "K5", "Niro", "Seltos", "Sorento", "Soul", "Sportage", "Stinger", "Telluride"],
        "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
        "Lexus": ["ES", "GX", "IS", "LC", "LS", "LX", "NX", "RC", "RX", "RZ", "TX", "UX"],
        "Lincoln": ["Aviator", "Corsair", "Nautilus", "Navigator"],
        "Maserati": ["Ghibli", "Grecale", "Levante", "MC20", "Quattroporte"],
        "Mazda": ["CX-3", "CX-30", "CX-5", "CX-50", "CX-9", "CX-90", "Mazda3", "Mazda6", "MX-5 Miata", "MX-30"],
        "Mercedes-Benz": ["A-Class", "C-Class", "CLA", "CLS", "E-Class", "EQB", "EQE", "EQS", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "S-Class"],
        "MINI": ["Clubman", "Convertible", "Countryman", "Hardtop"],
        "Mitsubishi": ["Eclipse Cross", "Mirage", "Outlander", "Outlander Sport"],
        "Nissan": ["Altima", "Ariya", "Armada", "Frontier", "Kicks", "Leaf", "Maxima", "Murano", "Pathfinder", "Rogue", "Sentra", "Titan", "Versa", "Z"],
        "Polestar": ["2", "3"],
        "Porsche": ["911", "718 Boxster", "718 Cayman", "Cayenne", "Macan", "Panamera", "Taycan"],
        "Ram": ["1500", "2500", "3500", "ProMaster"],
        "Rolls-Royce": ["Cullinan", "Ghost", "Phantom", "Wraith"],
        "Subaru": ["Ascent", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "Solterra", "WRX"],
        "Tesla": ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y"],
        "Toyota": ["4Runner", "Camry", "Corolla", "Highlander", "RAV4", "Tacoma", "Tundra", "Venza"],
        "Volkswagen": ["Arteon", "Atlas", "ID.4", "Jetta", "Passat", "Taos", "Tiguan"],
        "Volvo": ["C40", "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"]
      }
    },
    "2010-2019": {
      description: "Modern vehicles",
      makes: [
        "Acura", "Alfa Romeo", "Audi", "BMW", "Chevrolet", "Ford", "Honda", "Hyundai", "Kia", "Nissan", "Tesla", "Toyota"
      ],
      models: {
        "Acura": ["ILX", "MDX", "NSX", "RDX", "RLX", "TLX", "TSX"],
        "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "R8", "S4", "S5", "TT"],
        "BMW": ["2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "i3", "i8", "M3", "M4", "M5", "X1", "X3", "X4", "X5", "X6", "Z4"],
        "Chevrolet": ["Camaro", "Colorado", "Corvette", "Cruze", "Equinox", "Impala", "Malibu", "Silverado 1500", "Suburban", "Tahoe", "Traverse", "Volt"],
        "Ford": ["Edge", "Escape", "Explorer", "F-150", "Fiesta", "Focus", "Fusion", "Mustang", "Ranger", "Taurus"],
        "Honda": ["Accord", "Civic", "CR-V", "Fit", "HR-V", "Odyssey", "Pilot", "Ridgeline"],
        "Hyundai": ["Accent", "Elantra", "Kona", "Santa Fe", "Sonata", "Tucson", "Veloster"],
        "Kia": ["Forte", "Niro", "Optima", "Sorento", "Soul", "Sportage", "Stinger"],
        "Nissan": ["Altima", "Frontier", "GT-R", "Leaf", "Maxima", "Murano", "Pathfinder", "Rogue", "Sentra", "Titan"],
        "Tesla": ["Model 3", "Model S", "Model X"],
        "Toyota": ["4Runner", "Camry", "Corolla", "Highlander", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra"]
      }
    },
    "2000-2009": {
      description: "Early 2000s vehicles",
      makes: ["Acura", "Audi", "BMW", "Chevrolet", "Ford", "Honda", "Toyota"],
      models: {
        "Acura": ["CL", "MDX", "NSX", "RL", "RSX", "TL", "TSX"],
        "Honda": ["Accord", "Civic", "CR-V", "Element", "Odyssey", "Pilot", "S2000"],
        "Toyota": ["4Runner", "Camry", "Corolla", "Highlander", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra"],
        "Ford": ["Crown Victoria", "Escape", "Explorer", "F-150", "Focus", "Mustang", "Ranger", "Taurus"],
        "Chevrolet": ["Camaro", "Corvette", "Impala", "Malibu", "Silverado 1500", "Suburban", "Tahoe"]
      }
    },
    "1990-1999": {
      description: "1990s vehicles",
      makes: ["Acura", "Chevrolet", "Ford", "Honda", "Toyota"],
      models: {
        "Acura": ["Integra", "Legend", "NSX", "RL", "TL"],
        "Honda": ["Accord", "Civic", "CR-V", "Odyssey", "Prelude"],
        "Toyota": ["4Runner", "Camry", "Celica", "Corolla", "Land Cruiser", "Pickup", "RAV4", "Supra", "Tacoma"],
        "Ford": ["Bronco", "Crown Victoria", "Escort", "Explorer", "F-150", "Mustang", "Ranger", "Taurus"],
        "Chevrolet": ["Blazer", "Camaro", "Corvette", "Silverado", "Suburban", "Tahoe"]
      }
    },
    "1980-1989": {
      description: "1980s vehicles",
      makes: ["Acura", "Chevrolet", "Ford", "Honda", "Toyota"],
      models: {
        "Acura": ["Integra", "Legend"],
        "Honda": ["Accord", "Civic", "Prelude"],
        "Toyota": ["4Runner", "Camry", "Celica", "Corolla", "Land Cruiser", "Pickup", "Supra"],
        "Ford": ["Bronco", "F-150", "Mustang", "Ranger", "Taurus"],
        "Chevrolet": ["Blazer", "Camaro", "Corvette", "Silverado", "Suburban"]
      }
    },
    "1970-1979": {
      description: "Classic 1970s vehicles",
      makes: ["Chevrolet", "Ford", "Honda", "Toyota"],
      models: {
        "Honda": ["Accord", "Civic"],
        "Toyota": ["Celica", "Corolla", "Land Cruiser", "Pickup"],
        "Ford": ["Bronco", "F-150", "Mustang"],
        "Chevrolet": ["Blazer", "Camaro", "Corvette", "Suburban"]
      }
    },
    "1960-1969": {
      description: "Classic 1960s vehicles",
      makes: ["Chevrolet", "Ford"],
      models: {
        "Ford": ["Bronco", "Mustang"],
        "Chevrolet": ["Camaro", "Corvette", "Impala"]
      }
    },
    "1950-1959": {
      description: "Vintage 1950s vehicles",
      makes: ["Chevrolet", "Ford"],
      models: {
        "Ford": ["Thunderbird"],
        "Chevrolet": ["Bel Air", "Corvette"]
      }
    }
  }
};

/**
 * Determines which year range a specific year belongs to
 * @param year - The year to check (e.g., 2024, 1995, etc.)
 * @returns The year range key (e.g., "2020-2026") or null if not found
 */
export function getYearRange(year: number): string | null {
  if (year >= 2020 && year <= 2026) return '2020-2026';
  if (year >= 2010 && year <= 2019) return '2010-2019';
  if (year >= 2000 && year <= 2009) return '2000-2009';
  if (year >= 1990 && year <= 1999) return '1990-1999';
  if (year >= 1980 && year <= 1989) return '1980-1989';
  if (year >= 1970 && year <= 1979) return '1970-1979';
  if (year >= 1960 && year <= 1969) return '1960-1969';
  if (year >= 1950 && year <= 1959) return '1950-1959';
  return null;
}

/**
 * Loads the vehicle database from the public folder
 * Falls back to embedded default data if fetch fails
 * @returns Promise containing the vehicle data
 */
export async function loadVehicleData(): Promise<VehicleData> {
  try {
    const response = await fetch('/vehicle-data.json');
    if (!response.ok) {
      // File not found, use embedded default (this is expected)
      return defaultVehicleData;
    }
    
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Not JSON, use embedded default
      return defaultVehicleData;
    }
    
    return response.json();
  } catch (error) {
    // Fetch failed, use embedded default (this is expected)
    return defaultVehicleData;
  }
}

/**
 * Gets the default vehicle database directly (synchronous)
 * @returns The default vehicle data
 */
export function getDefaultVehicleData(): VehicleData {
  return defaultVehicleData;
}

/**
 * Gets available makes for a specific year
 * @param data - The vehicle database
 * @param year - The year to get makes for
 * @returns Array of make names available for that year
 */
export function getMakesForYear(data: VehicleData, year: number): string[] {
  const range = getYearRange(year);
  if (!range || !data.yearRanges[range]) return [];
  return data.yearRanges[range].makes;
}

/**
 * Gets available models for a specific make and year
 * @param data - The vehicle database
 * @param year - The year
 * @param make - The make/manufacturer name
 * @returns Array of model names available for that make and year
 */
export function getModelsForMakeAndYear(
  data: VehicleData,
  year: number,
  make: string
): string[] {
  const range = getYearRange(year);
  if (!range || !data.yearRanges[range]) return [];
  return data.yearRanges[range].models[make] || [];
}

/**
 * Generates an array of years from the metadata
 * @param data - The vehicle database
 * @param ascending - Whether to sort ascending (default: false, descending)
 * @returns Array of year strings
 */
export function getYearsArray(data: VehicleData, ascending: boolean = false): string[] {
  const { min, max } = data.metadata.yearRange;
  const years = Array.from(
    { length: max - min + 1 },
    (_, i) => ascending ? (min + i).toString() : (max - i).toString()
  );
  return years;
}

/**
 * Validates if a vehicle database JSON structure is valid
 * @param data - The data to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateVehicleData(data: any): { isValid: boolean; error?: string } {
  if (!data.metadata) {
    return { isValid: false, error: 'Missing metadata section' };
  }

  if (!data.metadata.version || !data.metadata.yearRange) {
    return { isValid: false, error: 'Invalid metadata structure' };
  }

  if (!data.yearRanges) {
    return { isValid: false, error: 'Missing yearRanges section' };
  }

  if (Object.keys(data.yearRanges).length === 0) {
    return { isValid: false, error: 'No year ranges found' };
  }

  // Validate each year range has required fields
  for (const [range, rangeData] of Object.entries(data.yearRanges)) {
    const rd = rangeData as any;
    if (!rd.makes || !Array.isArray(rd.makes)) {
      return { isValid: false, error: `Year range ${range} missing makes array` };
    }
    if (!rd.models || typeof rd.models !== 'object') {
      return { isValid: false, error: `Year range ${range} missing models object` };
    }
  }

  return { isValid: true };
}

/**
 * Get all unique makes across all year ranges
 * @param data - The vehicle database
 * @returns Array of unique make names
 */
export function getAllMakes(data: VehicleData): string[] {
  const makesSet = new Set<string>();
  Object.values(data.yearRanges).forEach(range => {
    range.makes.forEach(make => makesSet.add(make));
  });
  return Array.from(makesSet).sort();
}

/**
 * Get statistics about the database
 * @param data - The vehicle database
 * @returns Object with database statistics
 */
export function getDatabaseStats(data: VehicleData) {
  let totalMakes = 0;
  let totalModels = 0;
  const yearRangeStats: { [key: string]: { makes: number; models: number } } = {};

  Object.entries(data.yearRanges).forEach(([range, rangeData]) => {
    const makes = rangeData.makes.length;
    const models = Object.values(rangeData.models).reduce(
      (acc, modelList) => acc + modelList.length,
      0
    );

    yearRangeStats[range] = { makes, models };
    totalMakes += makes;
    totalModels += models;
  });

  return {
    version: data.metadata.version,
    lastUpdated: data.metadata.lastUpdated,
    yearRange: data.metadata.yearRange,
    totalYearRanges: Object.keys(data.yearRanges).length,
    totalMakes,
    totalModels,
    yearRangeStats,
  };
}