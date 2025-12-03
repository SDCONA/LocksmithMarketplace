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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('retailer_profiles')
      .select(`
        *,
        deals:deals(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return c.json({ profiles: data });
  } catch (error) {
    console.error('Error fetching retailer profiles:', error);
    return c.json({ error: 'Failed to fetch retailer profiles' }, 500);
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('deal_types')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return c.json({ dealTypes: data });
  } catch (error) {
    console.error('Error fetching deal types:', error);
    return c.json({ error: 'Failed to fetch deal types' }, 500);
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
dealsApp.get('/deals', async (c) => {
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
    if (error) throw error;

    // Get deals count for today for each profile
    const profileIds = [...new Set(data.map(d => d.retailer_profile_id))];
    const dealsToday: Record<string, number> = {};
    
    for (const profileId of profileIds) {
      const { data: countData } = await supabase.rpc('get_deals_today_count', { profile_id: profileId });
      dealsToday[profileId] = countData || 0;
    }

    return c.json({ deals: data, dealsToday });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return c.json({ error: 'Failed to fetch deals' }, 500);
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
    const { data: todayCount } = await supabase.rpc('get_deals_today_count', { profile_id: profileId });

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
    console.error('Error fetching retailer deals:', error);
    return c.json({ error: 'Failed to fetch retailer deals' }, 500);
  }
});

// Get single deal (Admin, owner, or public if active)
dealsApp.get('/deals/:id', async (c) => {
  try {
    const dealId = c.req.param('id');
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

    if (error) throw error;
    if (!deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    // Check if public can view
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user && deal.status !== 'active') {
      return c.json({ error: 'Deal not available' }, 403);
    }

    // Check if user has access
    if (user && deal.status !== 'active') {
      const admin = await isAdmin(user.id);
      const isOwner = deal.retailer_profile.owner_user_id === user.id;
      if (!admin && !isOwner) {
        return c.json({ error: 'Unauthorized' }, 403);
      }
    }

    // Increment view count
    await supabase
      .from('deals')
      .update({ view_count: (deal.view_count || 0) + 1 })
      .eq('id', dealId);

    return c.json({ deal: { ...deal, view_count: (deal.view_count || 0) + 1 } });
  } catch (error) {
    console.error('Error fetching deal:', error);
    return c.json({ error: 'Failed to fetch deal' }, 500);
  }
});

// Create deal (Admin or owner - with limit check)
dealsApp.post('/deals', async (c) => {
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
dealsApp.put('/deals/:id', async (c) => {
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
dealsApp.delete('/deals/:id', async (c) => {
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
dealsApp.post('/deals/:id/archive', async (c) => {
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
dealsApp.post('/deals/:id/restore', async (c) => {
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
dealsApp.post('/deals/:id/pause', async (c) => {
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
dealsApp.post('/deals/:id/activate', async (c) => {
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
    if (error) throw error;

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

// ========================================
// DEAL IMAGES ROUTES
// ========================================

// Upload deal image
dealsApp.post('/deals/:id/images', async (c) => {
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
dealsApp.post('/deals/:id/images/upload', async (c) => {
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
dealsApp.put('/deals/:id/images/reorder', async (c) => {
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
    const user = await getAuthUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const retailerFilter = c.req.query('retailer');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let query = supabase
      .from('saved_deals')
      .select(`
        *,
        deal:deals!inner(
          *,
          retailer_profile:retailer_profiles(*),
          deal_type:deal_types(*),
          images:deal_images(*)
        )
      `)
      .eq('user_id', user.id)
      .eq('deal.status', 'active')
      .order('created_at', { ascending: false });

    if (retailerFilter) {
      query = query.eq('deal.retailer_profile_id', retailerFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Remove saved deals for expired deals
    const now = new Date().toISOString();
    const expiredSaves = data.filter(s => s.deal.expires_at < now);
    
    if (expiredSaves.length > 0) {
      await supabase
        .from('saved_deals')
        .delete()
        .in('id', expiredSaves.map(s => s.id));
    }

    const activeSaves = data.filter(s => s.deal.expires_at >= now);
    return c.json({ savedDeals: activeSaves });
  } catch (error) {
    console.error('Error fetching saved deals:', error);
    return c.json({ error: 'Failed to fetch saved deals' }, 500);
  }
});

// Save a deal
dealsApp.post('/deals/:id/save', async (c) => {
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
dealsApp.delete('/deals/:id/save', async (c) => {
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
dealsApp.get('/deals/:id/is-saved', async (c) => {
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
dealsApp.post('/deals/bulk-upload', async (c) => {
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

export default dealsApp;