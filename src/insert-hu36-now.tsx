import { projectId, publicAnonKey } from './utils/supabase/info';

/**
 * ONE-TIME SCRIPT TO INSERT HU36 TOOL
 * Run this once to insert the Mercedes-Benz HU36 Lishi tool
 */

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

export default async function InsertHU36() {
  const handleInsert = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/hub/lishi-tools`,
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
        const error = await response.text();
        console.error('❌ Failed to insert Lishi tool:', error);
        alert('Failed to insert tool: ' + error);
        return;
      }

      const result = await response.json();
      console.log('✅ Successfully inserted HU36 tool:', result);
      alert('✅ Successfully inserted HU36 tool!');
    } catch (error) {
      console.error('❌ Error inserting Lishi tool:', error);
      alert('Error: ' + error);
    }
  };

  // Auto-insert on component mount
  handleInsert();

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Inserting HU36 Tool...</h1>
      <button 
        onClick={handleInsert}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Insert HU36 Tool Data
      </button>
    </div>
  );
}
