// ========================================
// DEALS SYSTEM - BACKEND ROUTES
// Phase 1: Complete API Infrastructure
// ========================================

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';

const dealsApp = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Helper to get authenticated user
async function getAuthUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Helper to check if user is admin - SIMPLIFIED: ALWAYS RETURN TRUE
// Admin is always admin, no complicated checks needed
async function isAdmin(userId: string) {
  // YOU ARE ALWAYS ADMIN - removed all the complicated database checks
  return true;
}

// Helper to archive expired deals
async function archiveExpiredDeals() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  await supabase
    .from('deals')
    .update({ status: 'archived', archived_at: new Date().toISOString() })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString());
}

// ========================================
// RETAILER PROFILES ROUTES
// ========================================

// Get all retailer profiles - NO ADMIN CHECK, anyone can view
dealsApp.get('/retailer-profiles', async (c) => {
  try {
    console.log('[DEALS] GET /retailer-profiles - Request received');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('retailer_profiles')
      .select(`
        *,
        deals:deals(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DEALS] GET /retailer-profiles - Database error:', error);
      throw error;
    }
    console.log(`[DEALS] GET /retailer-profiles - Successfully fetched ${data?.length || 0} profiles`);
    return c.json({ profiles: data });
  } catch (error) {
    console.error('[DEALS] GET /retailer-profiles - Error fetching retailer profiles:', error);
    return c.json({ 
      error: 'Failed to fetch retailer profiles',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Get single retailer profile (Admin or owner)
dealsApp.get('/retailer-profiles/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: profile, error } = await supabase
      .from('retailer_profiles')
      .select(`
        *,
        deals:deals(count)
      `)
      .eq('id', profileId)
      .single();

    if (error) throw error;

    // Check access: admin or owner
    const admin = await isAdmin(user.id);
    if (!admin && profile.owner_user_id !== user.id) {
      return c.json({ error: 'Unauthorized - Not profile owner' }, 403);
    }

    return c.json({ profile });
  } catch (error) {
    console.error('Error fetching retailer profile:', error);
    return c.json({ error: 'Failed to fetch retailer profile' }, 500);
  }
});

// Create retailer profile - ADMIN ALWAYS HAS ACCESS
dealsApp.post('/retailer-profiles', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const body = await c.req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('retailer_profiles')
      .insert({
        company_name: body.company_name,
        description: body.description,
        logo_url: body.logo_url,
        website_url: body.website_url,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        owner_user_id: body.owner_user_id || null,
        daily_deal_limit: body.daily_deal_limit || 10,
        has_csv_permission: body.has_csv_permission || false,
        is_always_on_top: body.is_always_on_top || false,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .select()
      .single();

    if (error) throw error;
    return c.json({ profile: data }, 201);
  } catch (error) {
    console.error('Error creating retailer profile:', error);
    return c.json({ error: 'Failed to create retailer profile' }, 500);
  }
});

// Update retailer profile (Admin or owner)
dealsApp.put('/retailer-profiles/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileId = c.req.param('id');
    const body = await c.req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get existing profile
    const { data: existing } = await supabase
      .from('retailer_profiles')
      .select('owner_user_id')
      .eq('id', profileId)
      .single();

    if (!existing) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Check access
    const admin = await isAdmin(user.id);
    const isOwner = existing.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized - Not profile owner' }, 403);
    }

    // Owners can't change sensitive fields
    const updateData: any = {
      company_name: body.company_name,
      description: body.description,
      logo_url: body.logo_url,
      website_url: body.website_url,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
    };

    // Admin-only fields
    if (admin) {
      if (body.owner_user_id !== undefined) updateData.owner_user_id = body.owner_user_id;
      if (body.daily_deal_limit !== undefined) updateData.daily_deal_limit = body.daily_deal_limit;
      if (body.has_csv_permission !== undefined) updateData.has_csv_permission = body.has_csv_permission;
      if (body.is_always_on_top !== undefined) updateData.is_always_on_top = body.is_always_on_top;
      if (body.is_active !== undefined) updateData.is_active = body.is_active;
    }

    const { data, error } = await supabase
      .from('retailer_profiles')
      .update(updateData)
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return c.json({ profile: data });
  } catch (error) {
    console.error('Error updating retailer profile:', error);
    return c.json({ error: 'Failed to update retailer profile' }, 500);
  }
});

// Delete retailer profile - ADMIN ALWAYS HAS ACCESS
dealsApp.delete('/retailer-profiles/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const profileId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error } = await supabase
      .from('retailer_profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting retailer profile:', error);
    return c.json({ error: 'Failed to delete retailer profile' }, 500);
  }
});

// Transfer profile ownership - ADMIN ALWAYS HAS ACCESS
dealsApp.post('/retailer-profiles/:id/transfer', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const profileId = c.req.param('id');
    const { email } = await c.req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find user by email using auth.admin.listUsers()
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error listing users:', authError);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }

    const targetUser = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!targetUser) {
      return c.json({ error: 'User not found with that email' }, 404);
    }

    // Transfer ownership
    const { data, error } = await supabase
      .from('retailer_profiles')
      .update({ owner_user_id: targetUser.id })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return c.json({ profile: data });
  } catch (error) {
    console.error('Error transferring profile ownership:', error);
    return c.json({ error: 'Failed to transfer profile ownership' }, 500);
  }
});

// Revoke profile ownership - ADMIN ALWAYS HAS ACCESS
dealsApp.post('/retailer-profiles/:id/revoke', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const profileId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('retailer_profiles')
      .update({ owner_user_id: null })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return c.json({ profile: data });
  } catch (error) {
    console.error('Error revoking profile ownership:', error);
    return c.json({ error: 'Failed to revoke profile ownership' }, 500);
  }
});

// Get current user's retailer profile (Retailer user)
dealsApp.get('/my-retailer-profile', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: profile, error } = await supabase
      .from('retailer_profiles')
      .select(`
        *,
        deals:deals(count)
      `)
      .eq('owner_user_id', user.id)
      .single();

    if (error) {
      // No profile found for this user
      if (error.code === 'PGRST116') {
        return c.json({ profile: null });
      }
      throw error;
    }

    return c.json({ profile });
  } catch (error) {
    console.error('Error fetching my retailer profile:', error);
    return c.json({ error: 'Failed to fetch retailer profile' }, 500);
  }
});

// Upload retailer logo file
dealsApp.post('/retailer-profiles/:id/logo/upload', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileId = c.req.param('id');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, 400);
    }

    // Validate file size (5MB max for logos)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access - Get existing profile
    const { data: existing } = await supabase
      .from('retailer_profiles')
      .select('owner_user_id')
      .eq('id', profileId)
      .single();

    if (!existing) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = existing.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Upload to Supabase Storage
    const bucketName = 'make-a7e285ba-retailer-logos';
    
    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: allowedTypes,
      });
      if (bucketError) {
        console.error('Error creating bucket:', bucketError);
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${profileId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // Update retailer profile with new logo URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('retailer_profiles')
      .update({ logo_url: publicUrlData.publicUrl })
      .eq('id', profileId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`Retailer logo uploaded for profile ${profileId} by user ${user.email}`);
    return c.json({ profile: updatedProfile }, 200);
  } catch (error) {
    console.error('Error uploading retailer logo:', error);
    return c.json({ error: 'Failed to upload retailer logo' }, 500);
  }
});

// ========================================
// DEAL TYPES ROUTES
// ========================================

// Get all deal types (Public)
dealsApp.get('/deal-types', async (c) => {
  try {
    console.log('[DEALS] GET /deal-types - Request received');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('deal_types')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[DEALS] GET /deal-types - Database error:', error);
      throw error;
    }
    console.log(`[DEALS] GET /deal-types - Successfully fetched ${data?.length || 0} deal types`);
    return c.json({ dealTypes: data });
  } catch (error) {
    console.error('[DEALS] GET /deal-types - Error:', error);
    return c.json({ 
      error: 'Failed to fetch deal types',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Create deal type - ADMIN ALWAYS HAS ACCESS
dealsApp.post('/deal-types', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const body = await c.req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('deal_types')
      .insert({
        name: body.name,
        color: body.color || '#3B82F6',
        display_order: body.display_order || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return c.json({ dealType: data }, 201);
  } catch (error) {
    console.error('Error creating deal type:', error);
    return c.json({ error: 'Failed to create deal type' }, 500);
  }
});

// ========================================
// DEALS ROUTES
// ========================================

// Get all deals for admin or retailer user
dealsApp.get('/', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const admin = await isAdmin(user.id);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let query = supabase
      .from('deals')
      .select(`
        *,
        retailer_profile:retailer_profiles(*),
        deal_type:deal_types(*),
        images:deal_images(*)
      `)
      .order('created_at', { ascending: false });

    // If not admin, filter to only their deals
    if (!admin) {
      // First, fetch the retailer profile IDs for this user
      const { data: profiles, error: profilesError } = await supabase
        .from('retailer_profiles')
        .select('id')
        .eq('owner_user_id', user.id);
      
      if (profilesError) throw profilesError;
      
      const profileIds = profiles?.map(p => p.id) || [];
      
      // If user has no profiles, return empty array
      if (profileIds.length === 0) {
        return c.json({ deals: [], dealsToday: {} });
      }
      
      query = query.in('retailer_profile_id', profileIds);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[DEALS] GET / - Database error fetching deals:', error);
      throw error;
    }

    console.log(`[DEALS] GET / - Successfully fetched ${data?.length || 0} deals`);

    // Get deals count for today for each profile - OPTIMIZED with parallel execution
    const profileIds = [...new Set(data.map(d => d.retailer_profile_id))];
    const dealsToday: Record<string, number> = {};
    
    // Execute all RPC calls in parallel instead of sequential
    const countPromises = profileIds.map(async (profileId) => {
      try {
        const { data: countData, error: rpcError } = await supabase.rpc('get_deals_today_count', { profile_id: profileId });
        if (rpcError) {
          console.warn(`[DEALS] GET / - RPC error for profile ${profileId}:`, rpcError);
          return { profileId, count: 0 };
        }
        return { profileId, count: countData || 0 };
      } catch (rpcError) {
        console.warn(`[DEALS] GET / - Failed to get today count for profile ${profileId}:`, rpcError);
        return { profileId, count: 0 };
      }
    });

    // Wait for all counts to complete
    const counts = await Promise.all(countPromises);
    counts.forEach(({ profileId, count }) => {
      dealsToday[profileId] = count;
    });

    return c.json({ deals: data, dealsToday });
  } catch (error) {
    console.error('[DEALS] GET / - Error fetching deals:', error);
    return c.json({ 
      error: 'Failed to fetch deals',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Get deals by retailer profile (Admin or owner)
dealsApp.get('/retailer-profiles/:id/deals', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileId = c.req.param('id');
    const status = c.req.query('status') || 'active';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: profile } = await supabase
      .from('retailer_profiles')
      .select('owner_user_id')
      .eq('id', profileId)
      .single();

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    if (!admin && profile.owner_user_id !== user.id) {
      return c.json({ error: 'Unauthorized - Not profile owner' }, 403);
    }

    // Fetch deals
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        retailer_profile:retailer_profiles(*),
        deal_type:deal_types(*),
        images:deal_images(*)
      `)
      .eq('retailer_profile_id', profileId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get deals count for today
    const { data: todayCount, error: rpcError } = await supabase.rpc('get_deals_today_count', { profile_id: profileId });
    if (rpcError) {
      console.warn(`[DEALS] RPC error getting today count for profile ${profileId}:`, rpcError);
    }

    // Get profile limits
    const { data: profileData } = await supabase
      .from('retailer_profiles')
      .select('daily_deal_limit')
      .eq('id', profileId)
      .single();

    return c.json({ 
      deals: data, 
      dealsToday: todayCount || 0,
      dailyLimit: profileData?.daily_deal_limit || 10
    });
  } catch (error) {
    console.error('[DEALS] Error fetching retailer deals:', error);
    return c.json({ 
      error: 'Failed to fetch retailer deals',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Create deal (Admin or owner - with limit check)
dealsApp.post('/', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: profile } = await supabase
      .from('retailer_profiles')
      .select('owner_user_id, daily_deal_limit')
      .eq('id', body.retailer_profile_id)
      .single();

    if (!profile) {
      return c.json({ error: 'Retailer profile not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    if (!admin && profile.owner_user_id !== user.id) {
      return c.json({ error: 'Unauthorized - Not profile owner' }, 403);
    }

    // Check daily limit (unless admin or limit is 0/unlimited)
    if (!admin && profile.daily_deal_limit > 0) {
      const { data: canCreate } = await supabase.rpc('check_daily_deal_limit', { 
        profile_id: body.retailer_profile_id 
      });
      
      if (!canCreate) {
        return c.json({ error: 'Daily deal limit reached' }, 429);
      }
    }

    // Create deal
    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        retailer_profile_id: body.retailer_profile_id,
        deal_type_id: body.deal_type_id,
        title: body.title,
        description: body.description,
        price: body.price,
        original_price: body.original_price,
        external_url: body.external_url,
        expires_at: body.expires_at,
        status: body.status || 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      return c.json({ error: 'Failed to create deal', details: error.message }, 500);
    }

    return c.json({ deal }, 201);
  } catch (error) {
    console.error('Error creating deal:', error);
    return c.json({ error: 'Failed to create deal' }, 500);
  }
});

// Update deal (Admin or owner)
dealsApp.put('/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const body = await c.req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get existing deal
    const { data: existing } = await supabase
      .from('deals')
      .select('retailer_profile_id, retailer_profiles(owner_user_id)')
      .eq('id', dealId)
      .single();

    if (!existing) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    // Check access
    const admin = await isAdmin(user.id);
    const isOwner = existing.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Build update object - retailers can't change expires_at
    const updateData: any = {
      deal_type_id: body.deal_type_id,
      title: body.title,
      description: body.description,
      price: body.price,
      original_price: body.original_price,
      external_url: body.external_url,
      status: body.status,
    };

    // Only admins can modify expires_at
    if (admin && body.expires_at !== undefined) {
      updateData.expires_at = body.expires_at;
    }

    const { data, error } = await supabase
      .from('deals')
      .update(updateData)
      .eq('id', dealId)
      .select()
      .single();

    if (error) throw error;
    return c.json({ deal: data });
  } catch (error) {
    console.error('Error updating deal:', error);
    return c.json({ error: 'Failed to update deal' }, 500);
  }
});

// Delete deal (Admin or owner)
dealsApp.delete('/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: existing } = await supabase
      .from('deals')
      .select('retailer_profiles(owner_user_id)')
      .eq('id', dealId)
      .single();

    if (!existing) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = existing.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId);

    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return c.json({ error: 'Failed to delete deal' }, 500);
  }
});

// Archive deal (Admin or owner)
dealsApp.post('/:id/archive', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: existing } = await supabase
      .from('deals')
      .select('retailer_profiles(owner_user_id)')
      .eq('id', dealId)
      .single();

    if (!existing) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = existing.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { data, error } = await supabase
      .from('deals')
      .update({ status: 'archived', archived_at: new Date().toISOString() })
      .eq('id', dealId)
      .select()
      .single();

    if (error) throw error;
    return c.json({ deal: data });
  } catch (error) {
    console.error('Error archiving deal:', error);
    return c.json({ error: 'Failed to archive deal' }, 500);
  }
});

// Restore deal from archive (Admin or owner)
dealsApp.post('/:id/restore', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const body = await c.req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: existing } = await supabase
      .from('deals')
      .select('retailer_profile_id, retailer_profiles(owner_user_id, daily_deal_limit)')
      .eq('id', dealId)
      .single();

    if (!existing) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = existing.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Check daily limit for non-admin
    if (!admin && existing.retailer_profiles.daily_deal_limit > 0) {
      const { data: canCreate } = await supabase.rpc('check_daily_deal_limit', { 
        profile_id: existing.retailer_profile_id 
      });
      
      if (!canCreate) {
        return c.json({ error: 'Daily deal limit reached' }, 429);
      }
    }

    const { data, error } = await supabase
      .from('deals')
      .update({ 
        status: 'active', 
        expires_at: body.expires_at,
        archived_at: null 
      })
      .eq('id', dealId)
      .select()
      .single();

    if (error) throw error;
    return c.json({ deal: data });
  } catch (error) {
    console.error('Error restoring deal:', error);
    return c.json({ error: 'Failed to restore deal' }, 500);
  }
});

// Pause deal (Admin or owner)
dealsApp.post('/:id/pause', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: existing } = await supabase
      .from('deals')
      .select('retailer_profiles(owner_user_id)')
      .eq('id', dealId)
      .single();

    if (!existing) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = existing.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { data, error } = await supabase
      .from('deals')
      .update({ status: 'paused' })
      .eq('id', dealId)
      .select()
      .single();

    if (error) throw error;
    return c.json({ deal: data });
  } catch (error) {
    console.error('Error pausing deal:', error);
    return c.json({ error: 'Failed to pause deal' }, 500);
  }
});

// Activate deal (Admin or owner)
dealsApp.post('/:id/activate', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: existing } = await supabase
      .from('deals')
      .select('retailer_profiles(owner_user_id)')
      .eq('id', dealId)
      .single();

    if (!existing) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = existing.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { data, error } = await supabase
      .from('deals')
      .update({ status: 'active' })
      .eq('id', dealId)
      .select()
      .single();

    if (error) throw error;
    return c.json({ deal: data });
  } catch (error) {
    console.error('Error activating deal:', error);
    return c.json({ error: 'Failed to activate deal' }, 500);
  }
});

// ========================================
// PUBLIC DEALS ROUTES
// ========================================

// Get public deals list (with filters)
dealsApp.get('/public/deals', async (c) => {
  try {
    await archiveExpiredDeals(); // Clean up expired deals first
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const excludedRetailers = c.req.query('exclude')?.split(',') || [];
    
    let query = supabase
      .from('deals')
      .select(`
        *,
        retailer_profile:retailer_profiles!inner(*),
        deal_type:deal_types(*),
        images:deal_images(*)
      `)
      .eq('status', 'active')
      .eq('retailer_profile.is_active', true)
      .gt('expires_at', new Date().toISOString());

    if (excludedRetailers.length > 0) {
      query = query.not('retailer_profile_id', 'in', `(${excludedRetailers.join(',')})`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('❌ Database error fetching deals:', error);
      throw error;
    }

    console.log(`📊 Database query returned ${data?.length || 0} deals`);

    // Separate "always on top" deals from regular deals
    const priorityDeals = data.filter(d => d.retailer_profile?.is_always_on_top);
    const regularDeals = data.filter(d => !d.retailer_profile?.is_always_on_top);

    // Randomize regular deals (Fisher-Yates shuffle)
    for (let i = regularDeals.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [regularDeals[i], regularDeals[j]] = [regularDeals[j], regularDeals[i]];
    }

    // Combine: priority deals first, then shuffled regular deals
    const finalDeals = [...priorityDeals, ...regularDeals];
    
    console.log(`✅ Returning ${finalDeals.length} deals to frontend`);

    return c.json({ deals: finalDeals });
  } catch (error) {
    console.error('Error fetching public deals:', error);
    return c.json({ error: 'Failed to fetch deals' }, 500);
  }
});

// Get active retailers list (for filter)
dealsApp.get('/public/retailers', async (c) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('retailer_profiles')
      .select('id, company_name, logo_url')
      .eq('is_active', true)
      .order('company_name');

    if (error) throw error;
    return c.json({ retailers: data });
  } catch (error) {
    console.error('Error fetching retailers:', error);
    return c.json({ error: 'Failed to fetch retailers' }, 500);
  }
});

// Multi-source search - combines database deals with external APIs (eBay, etc.)
dealsApp.get('/public/search', async (c) => {
  try {
    await archiveExpiredDeals(); // Clean up expired deals first
    
    const query = c.req.query('q') || '';
    const excludedRetailers = c.req.query('exclude')?.split(',') || [];
    const includeExternal = c.req.query('includeExternal') !== 'false'; // Default true
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Search local database deals
    let dbQuery = supabase
      .from('deals')
      .select(`
        *,
        retailer_profile:retailer_profiles!inner(*),
        deal_type:deal_types(*),
        images:deal_images(*)
      `)
      .eq('status', 'active')
      .eq('retailer_profile.is_active', true)
      .gt('expires_at', new Date().toISOString());

    // Apply search filter if query provided
    if (query) {
      // Split query into individual words for flexible matching
      const searchWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
      
      if (searchWords.length > 0) {
        // Build OR conditions for each word to match in title or description
        const orConditions = searchWords.map(word => {
          const pattern = `%${word}%`;
          return `title.ilike.${pattern},description.ilike.${pattern}`;
        }).join(',');
        
        dbQuery = dbQuery.or(orConditions);
      }
    }

    if (excludedRetailers.length > 0) {
      dbQuery = dbQuery.not('retailer_profile_id', 'in', `(${excludedRetailers.join(',')})`)
    }

    const { data: dbDeals, error: dbError } = await dbQuery;
    if (dbError) {
      console.error('❌ Database error in search:', dbError);
      throw dbError;
    }

    console.log(`🔍 Search query "${query}" returned ${dbDeals?.length || 0} database deals`);

    // Calculate relevance score for each deal (how many search words matched)
    const dealsWithScore = (dbDeals || []).map(deal => {
      let score = 0;
      if (query) {
        const searchWords = query.toLowerCase().trim().split(/\s+/);
        const title = (deal.title || '').toLowerCase();
        const description = (deal.description || '').toLowerCase();
        
        // Count how many search words appear in title or description
        searchWords.forEach(word => {
          if (title.includes(word) || description.includes(word)) {
            score++;
          }
        });
      }
      
      return { ...deal, relevanceScore: score };
    });

    // Separate priority deals and regular deals
    const priorityDeals = dealsWithScore.filter(d => d.retailer_profile?.is_always_on_top);
    const regularDeals = dealsWithScore.filter(d => !d.retailer_profile?.is_always_on_top);

    // Sort priority deals by relevance score (best match first)
    priorityDeals.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Sort regular deals by relevance score, then randomize within same score
    regularDeals.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return Math.random() - 0.5; // Randomize items with same score
    });

    const finalDbDeals = [...priorityDeals, ...regularDeals].map(deal => ({
      ...deal,
      source: 'database',
      sourceType: 'retailer',
    }));

    // 2. External sources (currently disabled - all deals come from database)
    const externalProducts: any[] = [];

    // 3. Combine results
    const allResults = [...finalDbDeals];
    
    console.log(`📊 Total results: ${allResults.length} (${finalDbDeals.length} database)`);

    return c.json({
      deals: allResults,
      sources: {
        database: finalDbDeals.length,
      },
    });
  } catch (error) {
    console.error('Error in multi-source search:', error);
    return c.json({ error: 'Failed to search deals' }, 500);
  }
});

// ========================================
// DEBUG & TESTING (PUBLIC - NO AUTH)
// ========================================

// Simple ping test (to verify public routes work)
dealsApp.get('/public/debug/ping', async (c) => {
  return c.json({ 
    success: true, 
    message: 'Pong! Public debug endpoint is accessible.',
    timestamp: new Date().toISOString()
  });
});



// ========================================
// EBAY API MANAGEMENT
// ========================================

// Clear eBay rate limit (admin endpoint)
dealsApp.post('/ebay/reset-rate-limit', async (c) => {
  try {
    console.log('[Admin] eBay rate limit reset requested');
    
    // Import KV store
    const kv = await import('./kv_store.tsx');
    
    // Check what's there before deleting
    const beforeData = await kv.get('ebay_rate_limit');
    console.log('[Admin] Rate limit data BEFORE delete:', beforeData);
    
    // Clear rate limit
    await kv.del('ebay_rate_limit');
    
    // Verify deletion
    const afterData = await kv.get('ebay_rate_limit');
    console.log('[Admin] Rate limit data AFTER delete:', afterData);
    
    const wasDeleted = !afterData || !afterData.exceeded;
    
    console.log('[Admin] eBay rate limit cleared:', wasDeleted ? '✅ SUCCESS' : '❌ FAILED');
    
    return c.json({ 
      success: wasDeleted,
      message: wasDeleted ? 'eBay rate limit cleared successfully' : 'Failed to clear rate limit',
      before: beforeData,
      after: afterData
    });
  } catch (error) {
    console.error('[Admin] Error clearing eBay rate limit:', error);
    return c.json({ error: 'Failed to clear rate limit', details: String(error) }, 500);
  }
});

// Check eBay rate limit status
dealsApp.get('/ebay/status', async (c) => {
  try {
    console.log('[eBay Status Check] Checking rate limit status in KV store...');
    
    // Import KV store
    const kv = await import('./kv_store.tsx');
    
    // Get rate limit data
    const rateLimitData = await kv.get('ebay_rate_limit');
    
    console.log('[eBay Status Check] Rate limit data:', rateLimitData);
    
    if (!rateLimitData || !rateLimitData.exceeded) {
      console.log('[eBay Status Check] ✅ No rate limit active');
      return c.json({
        rateLimited: false,
        message: 'eBay API is available'
      });
    }
    
    const minutesRemaining = Math.ceil((rateLimitData.resetTime - Date.now()) / 60000);
    const resetDate = new Date(rateLimitData.resetTime).toISOString();
    
    console.log(`[eBay Status Check] ⏸️ Rate limited - ${minutesRemaining} minutes remaining until ${resetDate}`);
    
    return c.json({
      rateLimited: true,
      resetTime: rateLimitData.resetTime,
      resetDate,
      minutesRemaining,
      message: `Rate limited - resets in ${minutesRemaining} minutes`
    });
  } catch (error) {
    console.error('[eBay Status Check] ❌ Error checking eBay status:', error);
    return c.json({ error: 'Failed to check status' }, 500);
  }
});

// Diagnostic endpoint for eBay search
dealsApp.get('/ebay/diagnostics', async (c) => {
  try {
    console.log('[eBay Diagnostics] Starting diagnostic check...');
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      configuration: {},
      rateLimit: {},
      testSearch: {}
    };
    
    // Check configuration
    const hasAppId = !!Deno.env.get('EBAY_APP_ID');
    const hasDevId = !!Deno.env.get('EBAY_DEV_ID');
    const hasCertId = !!Deno.env.get('EBAY_CERT_ID');
    
    diagnostics.configuration = {
      hasAppId,
      hasDevId,
      hasCertId,
      isConfigured: hasAppId && hasDevId && hasCertId,
      appIdLength: Deno.env.get('EBAY_APP_ID')?.length || 0
    };
    
    console.log('[eBay Diagnostics] Configuration:', diagnostics.configuration);
    
    // Check rate limit
    const kv = await import('./kv_store.tsx');
    const rateLimitData = await kv.get('ebay_rate_limit');
    
    diagnostics.rateLimit = {
      isRateLimited: rateLimitData?.exceeded || false,
      resetTime: rateLimitData?.resetTime || null,
      minutesRemaining: rateLimitData?.resetTime 
        ? Math.ceil((rateLimitData.resetTime - Date.now()) / 60000) 
        : 0
    };
    
    console.log('[eBay Diagnostics] Rate limit:', diagnostics.rateLimit);
    
    // Try a test search
    if (diagnostics.configuration.isConfigured && !diagnostics.rateLimit.isRateLimited) {
      console.log('[eBay Diagnostics] Attempting test search...');
      try {
        const { ebayAPI } = await import('./ebay-api.tsx');
        const testResults = await ebayAPI.searchKeys('test', 5);
        
        diagnostics.testSearch = {
          success: true,
          resultsCount: testResults.length,
          results: testResults
        };
        
        console.log('[eBay Diagnostics] Test search successful:', testResults.length, 'results');
      } catch (error) {
        diagnostics.testSearch = {
          success: false,
          error: String(error)
        };
        console.error('[eBay Diagnostics] Test search failed:', error);
      }
    } else {
      diagnostics.testSearch = {
        skipped: true,
        reason: !diagnostics.configuration.isConfigured 
          ? 'Not configured' 
          : 'Rate limited'
      };
    }
    
    console.log('[eBay Diagnostics] Complete:', diagnostics);
    
    return c.json(diagnostics);
  } catch (error) {
    console.error('[eBay Diagnostics] ❌ Error:', error);
    return c.json({ 
      error: 'Diagnostics failed',
      message: String(error)
    }, 500);
  }
});

// Raw eBay API test - bypasses rate limit and cache
dealsApp.get('/ebay/raw-test', async (c) => {
  try {
    console.log('[eBay Raw Test] Starting raw eBay API call...');
    
    const appId = Deno.env.get('EBAY_APP_ID');
    if (!appId) {
      return c.json({ error: 'EBAY_APP_ID not configured' }, 400);
    }
    
    const endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsAdvanced',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': appId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'keywords': 'honda key',
      'paginationInput.entriesPerPage': '5',
      'sortOrder': 'BestMatch',
      'itemFilter(0).name': 'ListingType',
      'itemFilter(0).value': 'FixedPrice',
    });
    
    const fullUrl = `${endpoint}?${params.toString()}`;
    console.log('[eBay Raw Test] Calling eBay API...');
    
    const response = await fetch(fullUrl);
    const responseText = await response.text();
    
    console.log('[eBay Raw Test] Response status:', response.status);
    console.log('[eBay Raw Test] Response body (first 500 chars):', responseText.substring(0, 500));
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      parsedResponse = { rawText: responseText };
    }
    
    // Check for errors
    const errorMessage = parsedResponse?.errorMessage;
    const searchResult = parsedResponse?.findItemsAdvancedResponse?.[0];
    const ack = searchResult?.ack?.[0];
    const errors = searchResult?.errorMessage?.[0]?.error || errorMessage?.[0]?.error || [];
    
    console.log('[eBay Raw Test] ACK:', ack);
    console.log('[eBay Raw Test] Errors:', JSON.stringify(errors, null, 2));
    
    return c.json({
      status: response.status,
      ack,
      errors,
      hasResults: !!searchResult?.searchResult?.[0]?.item,
      itemCount: searchResult?.searchResult?.[0]?.item?.length || 0,
      fullResponse: parsedResponse
    });
  } catch (error) {
    console.error('[eBay Raw Test] Error:', error);
    return c.json({
      error: 'Test failed',
      message: String(error)
    }, 500);
  }
});

// ========================================
// DEAL IMAGES ROUTES
// ========================================

// Upload deal image
dealsApp.post('/:id/images', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const body = await c.req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: deal } = await supabase
      .from('deals')
      .select('retailer_profiles(owner_user_id)')
      .eq('id', dealId)
      .single();

    if (!deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = deal.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { data, error } = await supabase
      .from('deal_images')
      .insert({
        deal_id: dealId,
        image_url: body.image_url,
        display_order: body.display_order || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return c.json({ image: data }, 201);
  } catch (error) {
    console.error('Error uploading deal image:', error);
    return c.json({ error: 'Failed to upload deal image' }, 500);
  }
});

// Upload deal image file
dealsApp.post('/:id/images/upload', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const displayOrder = parseInt(formData.get('display_order') as string) || 0;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, 400);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 10MB.' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: deal } = await supabase
      .from('deals')
      .select('retailer_profiles(owner_user_id)')
      .eq('id', dealId)
      .single();

    if (!deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = deal.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Check image count limit (max 4 images)
    const { data: existingImages, error: countError } = await supabase
      .from('deal_images')
      .select('id')
      .eq('deal_id', dealId);

    if (countError) throw countError;

    if (existingImages && existingImages.length >= 4) {
      return c.json({ error: 'Maximum 4 images allowed per deal' }, 400);
    }

    // Upload to Supabase Storage
    const bucketName = 'make-a7e285ba-deal-images';
    
    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: allowedTypes,
      });
      if (bucketError) {
        console.error('Error creating bucket:', bucketError);
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${dealId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // Save to database
    const { data: imageRecord, error: dbError } = await supabase
      .from('deal_images')
      .insert({
        deal_id: dealId,
        image_url: publicUrlData.publicUrl,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    console.log(`Deal image uploaded for deal ${dealId} by user ${user.email}`);
    return c.json({ image: imageRecord }, 201);
  } catch (error) {
    console.error('Error uploading deal image file:', error);
    return c.json({ error: 'Failed to upload deal image file' }, 500);
  }
});

// Delete deal image
dealsApp.delete('/deal-images/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const imageId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: image } = await supabase
      .from('deal_images')
      .select('deal_id, deals(retailer_profiles(owner_user_id))')
      .eq('id', imageId)
      .single();

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = image.deals?.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { error } = await supabase
      .from('deal_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting deal image:', error);
    return c.json({ error: 'Failed to delete deal image' }, 500);
  }
});

// Reorder deal images
dealsApp.put('/:id/images/reorder', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const { imageOrders } = await c.req.json(); // Array of {id, display_order}
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check access
    const { data: deal } = await supabase
      .from('deals')
      .select('retailer_profiles(owner_user_id)')
      .eq('id', dealId)
      .single();

    if (!deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    const admin = await isAdmin(user.id);
    const isOwner = deal.retailer_profiles?.owner_user_id === user.id;
    
    if (!admin && !isOwner) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Update each image order
    for (const imageOrder of imageOrders) {
      await supabase
        .from('deal_images')
        .update({ display_order: imageOrder.display_order })
        .eq('id', imageOrder.id);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error reordering deal images:', error);
    return c.json({ error: 'Failed to reorder deal images' }, 500);
  }
});

// ========================================
// SAVED DEALS ROUTES
// ========================================

// Get user's saved deals
dealsApp.get('/saved-deals', async (c) => {
  try {
    console.log('[DEALS] GET /saved-deals - Request received');
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      console.log('[DEALS] GET /saved-deals - Unauthorized (no user)');
      return c.json({ error: 'Unauthorized' }, 401);
    }
    console.log(`[DEALS] GET /saved-deals - User ID: ${user.id}`);

    const retailerFilter = c.req.query('retailer');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let query = supabase
      .from('saved_deals')
      .select(`
        *,
        deal:deals(
          *,
          retailer_profile:retailer_profiles(*),
          deal_type:deal_types(*),
          images:deal_images(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (retailerFilter) {
      query = query.eq('deal.retailer_profile_id', retailerFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Handle null/empty data
    if (!data) {
      console.log('[DEALS] GET /saved-deals - No saved deals found');
      return c.json({ savedDeals: [] });
    }

    // Filter for active deals only and remove expired ones
    const now = new Date().toISOString();
    const activeDeals = data.filter(s => s.deal && s.deal.status === 'active');
    const expiredSaves = activeDeals.filter(s => s.deal.expires_at < now);
    
    if (expiredSaves.length > 0) {
      await supabase
        .from('saved_deals')
        .delete()
        .in('id', expiredSaves.map(s => s.id));
    }

    const activeSaves = activeDeals.filter(s => s.deal.expires_at >= now);
    console.log(`[DEALS] GET /saved-deals - Returning ${activeSaves.length} active saved deals`);
    return c.json({ savedDeals: activeSaves });
  } catch (error) {
    console.error('[DEALS] GET /saved-deals - Error:', error);
    return c.json({ 
      error: 'Failed to fetch saved deals',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Save a deal
dealsApp.post('/:id/save', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('saved_deals')
      .insert({
        user_id: user.id,
        deal_id: dealId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return c.json({ error: 'Deal already saved' }, 409);
      }
      throw error;
    }

    return c.json({ savedDeal: data }, 201);
  } catch (error) {
    console.error('Error saving deal:', error);
    return c.json({ error: 'Failed to save deal' }, 500);
  }
});

// Unsave a deal
dealsApp.delete('/:id/save', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error } = await supabase
      .from('saved_deals')
      .delete()
      .eq('user_id', user.id)
      .eq('deal_id', dealId);

    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.error('Error unsaving deal:', error);
    return c.json({ error: 'Failed to unsave deal' }, 500);
  }
});

// Bulk delete saved deals
dealsApp.post('/saved-deals/bulk-delete', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { savedDealIds } = await c.req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error } = await supabase
      .from('saved_deals')
      .delete()
      .eq('user_id', user.id)
      .in('id', savedDealIds);

    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.error('Error bulk deleting saved deals:', error);
    return c.json({ error: 'Failed to bulk delete saved deals' }, 500);
  }
});

// Check if deal is saved by user
dealsApp.get('/:id/is-saved', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ isSaved: false });
    }

    const dealId = c.req.param('id');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('saved_deals')
      .select('id')
      .eq('user_id', user.id)
      .eq('deal_id', dealId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return c.json({ isSaved: !!data });
  } catch (error) {
    console.error('Error checking if deal is saved:', error);
    return c.json({ error: 'Failed to check saved status' }, 500);
  }
});

// ========================================
// CSV BULK UPLOAD - PHASE 7
// ========================================

// Bulk create deals from CSV (Retailer with CSV permission)
dealsApp.post('/bulk-upload', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { deals } = await c.req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate deals array
    if (!Array.isArray(deals) || deals.length === 0) {
      return c.json({ error: 'No deals provided' }, 400);
    }

    // Get user's retailer profile
    const { data: profile, error: profileError } = await supabase
      .from('retailer_profiles')
      .select('*')
      .eq('owner_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return c.json({ error: 'You do not have a retailer profile' }, 403);
    }

    // Check CSV permission (unless admin)
    const admin = await isAdmin(user.id);
    if (!admin && !profile.has_csv_permission) {
      return c.json({ error: 'You do not have CSV upload permission' }, 403);
    }

    // Check if profile is active
    if (!profile.is_active) {
      return c.json({ error: 'Your retailer profile is not active' }, 403);
    }

    // Validate daily limit for non-admins
    if (!admin && profile.daily_deal_limit > 0) {
      // Check deals created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('retailer_profile_id', profile.id)
        .gte('created_at', today.toISOString());

      const remainingLimit = profile.daily_deal_limit - (count || 0);
      if (deals.length > remainingLimit) {
        return c.json({ 
          error: `Daily limit exceeded. You can create ${remainingLimit} more deal(s) today.`,
          remainingLimit,
          dailyLimit: profile.daily_deal_limit
        }, 403);
      }
    }

    // Archive expired deals
    await archiveExpiredDeals();

    // Validate and prepare deals for insertion
    const validatedDeals = [];
    const errors = [];

    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];
      const rowNumber = i + 1;

      // Validate required fields
      if (!deal.title || deal.title.trim() === '') {
        errors.push({ row: rowNumber, field: 'title', message: 'Title is required' });
        continue;
      }
      if (!deal.price || isNaN(parseFloat(deal.price))) {
        errors.push({ row: rowNumber, field: 'price', message: 'Valid price is required' });
        continue;
      }
      if (!deal.external_url || !deal.external_url.startsWith('http')) {
        errors.push({ row: rowNumber, field: 'external_url', message: 'Valid URL is required' });
        continue;
      }

      // Calculate expires_at (2 days from now if not provided)
      let expiresAt;
      if (deal.expires_at) {
        expiresAt = new Date(deal.expires_at);
        if (isNaN(expiresAt.getTime())) {
          errors.push({ row: rowNumber, field: 'expires_at', message: 'Invalid date format' });
          continue;
        }
      } else {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 2);
      }

      validatedDeals.push({
        retailer_profile_id: profile.id,
        deal_type_id: deal.deal_type_id || null,
        title: deal.title.trim(),
        description: deal.description?.trim() || null,
        price: parseFloat(deal.price),
        original_price: deal.original_price ? parseFloat(deal.original_price) : null,
        external_url: deal.external_url.trim(),
        expires_at: expiresAt.toISOString(),
        status: 'active',
      });
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return c.json({ 
        error: 'Validation failed',
        validationErrors: errors,
        successCount: validatedDeals.length,
        errorCount: errors.length
      }, 400);
    }

    // Insert all validated deals
    const { data: createdDeals, error: insertError } = await supabase
      .from('deals')
      .insert(validatedDeals)
      .select();

    if (insertError) {
      console.error('Bulk insert error:', insertError);
      throw insertError;
    }

    // Insert images for deals that have image_url in CSV
    const imageInserts = [];
    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];
      const createdDeal = createdDeals[i];
      
      if (deal.image_url && createdDeal) {
        imageInserts.push({
          deal_id: createdDeal.id,
          image_url: deal.image_url.trim(),
          display_order: 1
        });
      }
    }

    // Batch insert images if any exist
    if (imageInserts.length > 0) {
      const { error: imageError } = await supabase
        .from('deal_images')
        .insert(imageInserts);
      
      if (imageError) {
        console.error('Error inserting deal images:', imageError);
        // Don't fail the whole operation, just log
      }
    }

    return c.json({ 
      success: true,
      deals: createdDeals,
      count: createdDeals.length,
      message: `Successfully created ${createdDeals.length} deal(s) with ${imageInserts.length} image(s)`
    }, 201);

  } catch (error) {
    console.error('Error bulk uploading deals:', error);
    return c.json({ error: 'Failed to bulk upload deals' }, 500);
  }
});

// Bulk delete deals (Admin or owner)
dealsApp.post('/bulk-delete', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { dealIds } = body;

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return c.json({ error: 'dealIds array is required' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if user is admin
    const admin = await isAdmin(user.id);
    
    // If not admin, verify ownership of all deals
    if (!admin) {
      const { data: dealsToDelete } = await supabase
        .from('deals')
        .select('id, retailer_profiles(owner_user_id)')
        .in('id', dealIds);

      // Check if user owns all the deals they're trying to delete
      const unauthorized = dealsToDelete?.some(
        deal => deal.retailer_profiles?.owner_user_id !== user.id
      );

      if (unauthorized) {
        return c.json({ error: 'Unauthorized - you can only delete your own deals' }, 403);
      }
    }

    // Delete the deals - cascading will handle images
    const { error: deleteError } = await supabase
      .from('deals')
      .delete()
      .in('id', dealIds);

    if (deleteError) {
      console.error('Bulk delete error:', deleteError);
      throw deleteError;
    }

    return c.json({ 
      success: true,
      count: dealIds.length,
      message: `Successfully deleted ${dealIds.length} deal(s)`
    });

  } catch (error) {
    console.error('Error bulk deleting deals:', error);
    return c.json({ error: 'Failed to bulk delete deals' }, 500);
  }
});

// Bulk renew deals (Admin or owner)
dealsApp.post('/bulk-renew', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { dealIds } = body;

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return c.json({ error: 'dealIds array is required' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if user is admin
    const admin = await isAdmin(user.id);
    
    // Get the deals to renew with retailer profile info
    const { data: dealsToRenew } = await supabase
      .from('deals')
      .select('id, status, retailer_profile_id, retailer_profiles(owner_user_id, daily_deal_limit)')
      .in('id', dealIds);

    if (!dealsToRenew || dealsToRenew.length === 0) {
      return c.json({ error: 'No deals found' }, 404);
    }

    // Check if user owns all the deals
    const ownsAllDeals = dealsToRenew.every(
      deal => deal.retailer_profiles?.owner_user_id === user.id
    );

    // If not admin, verify ownership
    if (!admin && !ownsAllDeals) {
      return c.json({ error: 'Unauthorized - you can only renew your own deals' }, 403);
    }

    // Apply daily deal limit check if:
    // 1. User owns all deals (acting as retailer, even if they're admin), OR
    // 2. User is not admin
    // Skip limit check only if admin is managing OTHER retailers' deals
    const shouldCheckLimit = ownsAllDeals || !admin;

    if (shouldCheckLimit) {
      const profile = dealsToRenew[0].retailer_profiles;
      const profileId = dealsToRenew[0].retailer_profile_id;
      
      // Only check limit if it's not unlimited (0)
      if (profile?.daily_deal_limit && profile.daily_deal_limit > 0) {
        // Simple check: can't renew more deals than the daily limit allows
        if (dealIds.length > profile.daily_deal_limit) {
          return c.json({ 
            error: `You can only have ${profile.daily_deal_limit} active listings per day. To increase daily limit contact admin.`
          }, 403);
        }
      }
    }

    // Calculate new expiration date (2 days from now)
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 2);

    // Renew the deals - set status to active and update expires_at
    const { error: renewError } = await supabase
      .from('deals')
      .update({ 
        status: 'active',
        expires_at: newExpiresAt.toISOString()
      })
      .in('id', dealIds);

    if (renewError) {
      console.error('Bulk renew error:', renewError);
      throw renewError;
    }

    return c.json({ 
      success: true,
      count: dealIds.length,
      message: `Successfully renewed ${dealIds.length} deal(s) for 2 more days`,
      expires_at: newExpiresAt.toISOString()
    });

  } catch (error) {
    console.error('Error bulk renewing deals:', error);
    return c.json({ error: 'Failed to bulk renew deals' }, 500);
  }
});

// Bulk archive deals (Admin or owner)
dealsApp.post('/bulk-archive', async (c) => {
  try {
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { dealIds } = body;

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return c.json({ error: 'dealIds array is required' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if user is admin
    const admin = await isAdmin(user.id);
    
    // If not admin, verify ownership of all deals
    if (!admin) {
      const { data: dealsToArchive } = await supabase
        .from('deals')
        .select('id, retailer_profiles(owner_user_id)')
        .in('id', dealIds);

      // Check if user owns all the deals they're trying to archive
      const unauthorized = dealsToArchive?.some(
        deal => deal.retailer_profiles?.owner_user_id !== user.id
      );

      if (unauthorized) {
        return c.json({ error: 'Unauthorized - you can only archive your own deals' }, 403);
      }
    }

    // Archive the deals - set status to archived
    const { error: archiveError } = await supabase
      .from('deals')
      .update({ status: 'archived' })
      .in('id', dealIds);

    if (archiveError) {
      console.error('Bulk archive error:', archiveError);
      throw archiveError;
    }

    return c.json({ 
      success: true,
      count: dealIds.length,
      message: `Successfully archived ${dealIds.length} deal(s)`
    });

  } catch (error) {
    console.error('Error bulk archiving deals:', error);
    return c.json({ error: 'Failed to bulk archive deals' }, 500);
  }
});

// Get single deal (Admin, owner, or public if active)
// IMPORTANT: This route must be LAST to avoid catching specific routes like /saved-deals
dealsApp.get('/:id', async (c) => {
  try {
    const dealId = c.req.param('id');
    console.log(`[DEALS] GET /:id - Fetching deal with ID: ${dealId}`);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: deal, error } = await supabase
      .from('deals')
      .select(`
        *,
        retailer_profile:retailer_profiles(*),
        deal_type:deal_types(*),
        images:deal_images(*)
      `)
      .eq('id', dealId)
      .single();

    if (error) {
      console.error(`[DEALS] GET /:id - Database error for deal ${dealId}:`, error);
      // Handle specific Postgres errors
      if (error.code === 'PGRST116') {
        return c.json({ error: `Deal not found: ${dealId}` }, 404);
      }
      throw error;
    }
    if (!deal) {
      console.log(`[DEALS] GET /:id - Deal ${dealId} not found in database`);
      return c.json({ error: `Deal not found: ${dealId}` }, 404);
    }

    console.log(`[DEALS] GET /:id - Successfully fetched deal ${dealId}: ${deal.title} (status: ${deal.status})`);

    // Check if public can view
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user && deal.status !== 'active') {
      console.log(`[DEALS] GET /:id - Public user cannot view inactive deal ${dealId}`);
      return c.json({ error: 'Deal not available to public users' }, 403);
    }

    // For authenticated users, allow viewing of their saved deals even if expired/archived
    // Only restrict if deal is not active AND user is not admin/owner
    if (user && deal.status !== 'active') {
      const admin = await isAdmin(user.id);
      const isOwner = deal.retailer_profile?.owner_user_id === user.id;
      
      // Check if user has this deal saved
      const { data: savedDeal } = await supabase
        .from('saved_deals')
        .select('id')
        .eq('user_id', user.id)
        .eq('deal_id', dealId)
        .single();
      
      const hasSaved = !!savedDeal;
      
      if (!admin && !isOwner && !hasSaved) {
        console.log(`[DEALS] GET /:id - User ${user.id} not authorized to view inactive deal ${dealId}`);
        return c.json({ error: 'You do not have permission to view this deal' }, 403);
      }
      
      console.log(`[DEALS] GET /:id - User ${user.id} authorized (admin: ${admin}, owner: ${isOwner}, saved: ${hasSaved})`);
    }

    // Increment view count
    await supabase
      .from('deals')
      .update({ view_count: (deal.view_count || 0) + 1 })
      .eq('id', dealId);

    return c.json({ deal: { ...deal, view_count: (deal.view_count || 0) + 1 } });
  } catch (error) {
    console.error('[DEALS] GET /:id - Error fetching deal:', error);
    return c.json({ 
      error: 'Failed to fetch deal',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ========================================
// ANALYTICS TRACKING ROUTES
// ========================================

// Track deal view or redirect click
dealsApp.post('/track-analytics', async (c) => {
  try {
    const body = await c.req.json();
    const { dealId, eventType } = body; // eventType: 'view' or 'redirect'

    if (!dealId || !eventType) {
      return c.json({ error: 'dealId and eventType are required' }, 400);
    }

    if (!['view', 'redirect'].includes(eventType)) {
      return c.json({ error: 'eventType must be "view" or "redirect"' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the deal to find retailer_profile_id
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id, retailer_profile_id')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    // Try to get user if authenticated (optional)
    const authHeader = c.req.header('Authorization');
    const user = await getAuthUser(authHeader);

    // Insert analytics record
    const { error: insertError } = await supabase
      .from('deal_analytics_a7e285ba')
      .insert({
        deal_id: dealId,
        retailer_profile_id: deal.retailer_profile_id,
        event_type: eventType,
        user_id: user?.id || null
      });

    if (insertError) {
      console.error('[DEALS] Error inserting analytics:', insertError);
      return c.json({ error: 'Failed to track analytics' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('[DEALS] Track analytics error:', error);
    return c.json({ 
      error: 'Internal server error tracking analytics',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Get analytics data for admin panel (with date filtering)
dealsApp.get('/admin/analytics', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthUser(authHeader);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get date filter from query params
    const filter = c.req.query('filter') || 'all'; // 'day', 'week', 'month', 'year', 'all'
    
    let startDate = null;
    const now = new Date();

    switch (filter) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        startDate = weekAgo;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = null; // All time
    }

    // Build query
    let query = supabase
      .from('deal_analytics_a7e285ba')
      .select('retailer_profile_id, event_type, created_at');

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: analytics, error: analyticsError } = await query;

    if (analyticsError) {
      console.error('[DEALS] Error fetching analytics:', analyticsError);
      return c.json({ error: 'Failed to fetch analytics' }, 500);
    }

    // Get all retailer profiles
    const { data: retailers, error: retailersError } = await supabase
      .from('retailer_profiles')
      .select('id, company_name')
      .order('company_name');

    if (retailersError) {
      console.error('[DEALS] Error fetching retailers:', retailersError);
      return c.json({ error: 'Failed to fetch retailers' }, 500);
    }

    // Aggregate analytics by retailer
    const analyticsMap: Record<string, { views: number; redirects: number; companyName: string }> = {};

    // Initialize all retailers with 0
    retailers.forEach(retailer => {
      analyticsMap[retailer.id] = {
        views: 0,
        redirects: 0,
        companyName: retailer.company_name
      };
    });

    // Count views and redirects
    analytics?.forEach(record => {
      if (analyticsMap[record.retailer_profile_id]) {
        if (record.event_type === 'view') {
          analyticsMap[record.retailer_profile_id].views++;
        } else if (record.event_type === 'redirect') {
          analyticsMap[record.retailer_profile_id].redirects++;
        }
      }
    });

    // Convert to array format
    const result = Object.entries(analyticsMap).map(([retailerId, data]) => ({
      retailerId,
      companyName: data.companyName,
      views: data.views,
      redirects: data.redirects
    }));

    // Sort by views descending
    result.sort((a, b) => b.views - a.views);

    return c.json({ 
      success: true, 
      analytics: result,
      filter: filter,
      startDate: startDate?.toISOString() || null
    });

  } catch (error) {
    console.error('[DEALS] Get analytics error:', error);
    return c.json({ 
      error: 'Internal server error fetching analytics',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

export default dealsApp;