/**
 * LISHI TOOLS BULK INSERT UTILITY
 * Admin-only component to trigger bulk insert of all 100+ Lishi tools
 */

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface BulkInsertResult {
  success: boolean;
  tools_inserted: number;
  brands_linked: number;
  errors: number;
  error_details?: string[];
  error?: string;
}

export function LishiToolsBulkInsert() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkInsertResult | null>(null);

  const handleBulkInsert = async () => {
    if (!confirm('This will insert 100+ Lishi tools into the database. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in as admin');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/hub/lishi-tools/bulk-insert`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      setResult(data);

      if (data.success) {
        alert(`✅ Success!\n\nTools inserted: ${data.tools_inserted}\nBrands linked: ${data.brands_linked}\nErrors: ${data.errors || 0}`);
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Bulk insert error:', error);
      setResult({
        success: false,
        tools_inserted: 0,
        brands_linked: 0,
        errors: 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      alert('Error occurred during bulk insert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="mb-4">
        <h2 className="text-xl mb-2">🔧 Lishi Tools Bulk Insert</h2>
        <p className="text-gray-600 text-sm">
          Insert all 100+ Lishi tools data into the database. This will:
        </p>
        <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
          <li>Insert tools into <code>hub_lishi_tools</code> table</li>
          <li>Store brand names in <code>brand</code> column</li>
          <li>Map compatible vehicle models to each tool</li>
          <li>Skip duplicates (safe to run multiple times)</li>
        </ul>
      </div>

      <button
        onClick={handleBulkInsert}
        disabled={loading}
        className={`px-6 py-3 rounded transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? '⏳ Processing...' : '🚀 Insert All Lishi Tools'}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅ Bulk Insert Complete' : '❌ Bulk Insert Failed'}
          </h3>
          
          {result.success && (
            <div className="text-sm text-gray-700">
              <p>✅ Tools inserted: <strong>{result.tools_inserted}</strong></p>
              <p>✅ Brand links created: <strong>{result.brands_linked}</strong></p>
              {result.errors > 0 && (
                <p className="text-orange-600 mt-2">⚠️ Warnings: {result.errors}</p>
              )}
            </div>
          )}

          {!result.success && (
            <p className="text-red-700 text-sm">{result.error}</p>
          )}

          {result.error_details && result.error_details.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-1">Error Details:</p>
              <ul className="text-xs text-gray-600 ml-4 list-disc">
                {result.error_details.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
        <h3 className="font-semibold mb-2 text-sm">📊 Data Coverage:</h3>
        <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
          <div>
            <strong>Brands:</strong> 25+<br/>
            <strong>Tools:</strong> 30+ unique codes<br/>
            <strong>Models:</strong> 500+ vehicle variants
          </div>
          <div>
            <strong>Includes:</strong><br/>
            • GM (HU100, B111, GM39)<br/>
            • Ford (FO38, HU198, Tibbe)<br/>
            • Honda/Acura (HON66)<br/>
            • And more...
          </div>
        </div>
      </div>
    </div>
  );
}