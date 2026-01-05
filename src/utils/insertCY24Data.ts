import { projectId } from './supabase/info';

/**
 * Inserts CY24 Lishi tool data into the database
 * This script inserts data for 8 brands with 51 vehicle models
 */
export async function insertCY24Data(token: string) {
  const toolName = "Original Lishi 2-In-1 Pick and Decoder 8-Cut Anti-Glare CY24";
  const toolCode = "CY24";
  const profile = "CY24 5-Depth";
  const notes = "Material: Stainless Steel or Anti-Glare Stainless Steel, Tool Spaces: 2-8, Depths: 1-4";

  const brandData = {
    "Chrysler": [
      { model: "200", years: "2011-2014" },
      { model: "300, 300C, 300M", years: "1999-2016" },
      { model: "Aspen", years: "2007-2009" },
      { model: "Cirus", years: "1995-2000" },
      { model: "Concorde", years: "1994-2004" },
      { model: "Eagle Vision", years: "1993-1997" },
      { model: "LHS", years: "1999-2001" },
      { model: "New Yorker", years: "1994-1996" },
      { model: "Pacifica", years: "2004-2008, 2017-2022" },
      { model: "Prowler", years: "2001-2002" },
      { model: "PT Cruiser", years: "2001-2011" },
      { model: "Sebring Convertible", years: "1996-2011" },
      { model: "Sebring Sedan", years: "2001-2011" },
      { model: "Town & Country", years: "1998-2016" },
      { model: "Voyager", years: "2001-2003" }
    ],
    "Dodge": [
      { model: "Avenger", years: "2008-2014" },
      { model: "Caliber", years: "2007-2012" },
      { model: "Challenger", years: "2008-2017" },
      { model: "Charger", years: "2005-2017" },
      { model: "Dart", years: "2013-2017" },
      { model: "Intrepid", years: "1994-2004" },
      { model: "Journey", years: "2009-2014" },
      { model: "Magnum", years: "2005-2009" },
      { model: "Neon", years: "1994-2005" },
      { model: "Nitro", years: "2007-2012" },
      { model: "Spirit", years: "1994-1995" },
      { model: "Stratus Sedan", years: "1995-2006" },
      { model: "Viper", years: "1994-2006, 2013-2016" },
      { model: "Caravan", years: "1996-2017" },
      { model: "Dakota", years: "2001-2011" },
      { model: "Durango", years: "1998-2015" },
      { model: "Pickup", years: "1994-2008" },
      { model: "Ram", years: "2002-2017" },
      { model: "Van (Full Size)", years: "1994-2004" }
    ],
    "Freightliner": [
      { model: "Class 6, Class 7", years: "2004" }
    ],
    "Jeep": [
      { model: "Cherokee", years: "1994-2017" },
      { model: "Commander", years: "2006-2010" },
      { model: "Compass", years: "2007-2017" },
      { model: "Grand Cherokee", years: "1994-2017" },
      { model: "Liberty", years: "2002-2013" },
      { model: "Patriot", years: "2007-2017" },
      { model: "Wrangler", years: "1998-2017" }
    ],
    "Mitsubishi": [
      { model: "Raider", years: "2006-2009" }
    ],
    "Plymouth": [
      { model: "Acclaim", years: "1994-1995" },
      { model: "Breez", years: "1996-2000" },
      { model: "Voyager", years: "1994-1995" },
      { model: "Grand Voyager", years: "1994-2000" },
      { model: "Neon", years: "1994-2001" },
      { model: "Prowler", years: "1998-2002" }
    ],
    "Sterling": [
      { model: "Bullet", years: "2008-2009" }
    ],
    "Volkswagen": [
      { model: "Routan", years: "2009-2014" }
    ]
  };

  const results = [];
  const errors = [];

  for (const [brand, fitmentData] of Object.entries(brandData)) {
    try {
      const payload = {
        brand,
        tool_name: toolName,
        tool_code: toolCode,
        fitment_data: fitmentData,
        profile,
        notes,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/lishi/admin/tools`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to insert ${brand}: ${error}`);
      }

      const data = await response.json();
      results.push({ brand, success: true, models: fitmentData.length });
      console.log(`✓ Inserted ${brand} with ${fitmentData.length} models`);
    } catch (error) {
      errors.push({ brand, error: error.message });
      console.error(`✗ Failed to insert ${brand}:`, error.message);
    }
  }

  return {
    success: errors.length === 0,
    results,
    errors,
    summary: {
      totalBrands: Object.keys(brandData).length,
      successfulBrands: results.length,
      failedBrands: errors.length,
      totalModels: Object.values(brandData).reduce((sum, models) => sum + models.length, 0)
    }
  };
}
