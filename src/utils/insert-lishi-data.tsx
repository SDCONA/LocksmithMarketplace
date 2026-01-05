import { projectId, publicAnonKey } from './supabase/info';

/**
 * Utility to insert Lishi tool data directly into the database
 * This uses the public insert endpoint for data loading
 */
export async function insertLishiTool() {
  const toolData = {
    tool_name: 'Original Lishi 2-in-1 Pick and Decoder HU36',
    tool_code: 'HU36',
    brand: 'Mercedes-Benz',
    compatibility: ['230', '240D', '280CE', '280E', '300D', '450SL'],
    years: '1973-1985',
    notes: 'Depths: 1-4, Tool Spaces: 1-10, Material: Stainless Steel or Anti-Glare Stainless Steel',
    profile: 'HU36 / MB1 / M2',
    image_path: 'mercedes-benz-hu36'
  };

  try {
    console.log('📤 Inserting HU36 tool data...');
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/hub/lishi-tools/public-insert`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to insert Lishi tool:', error);
      throw new Error(`Failed to insert: ${error.error} - ${error.details || ''}`);
    }

    const result = await response.json();
    console.log('✅ Successfully inserted HU36 tool:', result);
    return result;
  } catch (error) {
    console.error('❌ Error inserting Lishi tool:', error);
    throw error;
  }
}

// Auto-execute when imported
insertLishiTool()
  .then(() => {
    console.log('🎉 HU36 tool data insertion complete!');
  })
  .catch((error) => {
    console.error('💥 Failed to insert HU36 tool:', error);
  });
