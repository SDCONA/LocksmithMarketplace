import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * AUTOMATED CRON JOB: Archive Expired Marketplace Listings
 * 
 * PURPOSE: Automatically archive marketplace listings after 7 days
 * SCHEDULE: Runs daily at midnight UTC (0 0 * * *)
 * 
 * HOW TO SET UP:
 * 1. This function must be deployed to Supabase Edge Functions
 * 2. In Supabase Dashboard → Edge Functions → cron-archive-listings
 * 3. Add Cron Schedule: "0 0 * * *" (daily at midnight)
 * 4. The function will automatically call the archive endpoint
 * 
 * WHAT IT DOES:
 * - Finds all listings where status='active' AND expires_at < NOW()
 * - Updates them to status='archived' and sets archived_at timestamp
 * - Returns count of archived listings
 */

serve(async (req) => {
  try {
    console.log('🕐 [CRON] Starting daily marketplace listings archive job...');
    
    // Get environment variables
    const projectId = Deno.env.get('SUPABASE_URL')?.split('//')[1]?.split('.')[0];
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!projectId || !serviceRoleKey) {
      console.error('❌ [CRON] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing environment variables' 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Call the archive endpoint
    const archiveUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/archive-expired`;
    
    console.log(`📡 [CRON] Calling archive endpoint: ${archiveUrl}`);
    
    const response = await fetch(archiveUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [CRON] Archive endpoint failed: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Archive endpoint returned ${response.status}`,
          details: errorText
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const result = await response.json();
    console.log(`✅ [CRON] Successfully archived ${result.archived || 0} expired listings`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        archived: result.archived || 0,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('❌ [CRON] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: String(error)
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
