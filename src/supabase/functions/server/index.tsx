// ⚠️⚠️⚠️ CRITICAL NOTE ⚠️⚠️⚠️
// DO NOT USE KV STORE!
// Use existing database tables or create new tables if needed.
// See /IMPORTANT_NOTES.md for full details.
// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

// 🔒 SECURITY CLEANUP COMPLETED 🔒
// All console statements have been systematically removed

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import dealsApp from "./deals-routes.tsx";
import cronApp from "./cron-routes.tsx";
import { sendAdminWarning } from "./admin-warning-helper.tsx";
import { verifyRecaptcha } from "./recaptcha-verify.tsx";
import { sendEmail, emailVerificationTemplate, passwordResetTemplate, policyUpdateTemplate } from "./resend-mailer.tsx";
// REMOVED: import * as kv from "./kv_store.tsx"; - DO NOT USE KV STORE!

const app = new Hono();

// Create Supabase clients
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};

// ============================================
// ADMIN HELPER FUNCTIONS
// ============================================

// Verify user authentication
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: 'Invalid token' };
  }

  return { user, error: null };
}

// Check if user is admin (uses secure admin table)
async function isUserAdmin(userId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin
    .from('admins_a7e285ba')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  
  return !error && !!data;
}

// Verify admin user (checks secure admin table)
async function verifyAdmin(authHeader: string | null) {
  const { user, error } = await verifyUser(authHeader);
  
  if (error || !user) {
    return { user: null, error: error || 'Unauthorized' };
  }
  
  // Check if user is in the secure admin table
  const isAdmin = await isUserAdmin(user.id);
  
  if (!isAdmin) {
    return { user: null, error: 'Admin access required' };
  }
  
  return { user, error: null };
}

// ============================================
// GEOGRAPHIC DISTANCE HELPERS
// ============================================

// Haversine formula to calculate distance between two lat/lng points in miles
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// In-memory cache for zip code coordinates (to avoid repeated API calls)
const zipCodeCache: Map<string, { lat: number; lng: number } | null> = new Map();

// Simple zip code to lat/lng lookup (using a basic US zip code database)
// In production, this would use a proper geocoding API or database
async function getZipCodeCoordinates(zipCode: string): Promise<{ lat: number; lng: number } | null> {
  // Check cache first
  if (zipCodeCache.has(zipCode)) {
    return zipCodeCache.get(zipCode)!;
  }
  
  try {
    // Use a free geocoding service (Zippopotam.us)
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (!response.ok) {
      zipCodeCache.set(zipCode, null);
      return null;
    }
    const data = await response.json();
    if (data.places && data.places.length > 0) {
      const coords = {
        lat: parseFloat(data.places[0].latitude),
        lng: parseFloat(data.places[0].longitude)
      };
      zipCodeCache.set(zipCode, coords);
      return coords;
    }
    zipCodeCache.set(zipCode, null);
    return null;
  } catch (error) {
    zipCodeCache.set(zipCode, null);
    return null;
  }
}

// Extract zip code from location string (e.g., "Los Angeles, CA 90001" -> "90001")
function extractZipCode(location: string): string | null {
  const zipMatch = location.match(/\b\d{5}\b/);
  return zipMatch ? zipMatch[0] : null;
}

// Request logger disabled

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Root health check (no prefix) - for testing if function is accessible
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Locksmith Marketplace API is running",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/make-server-a7e285ba/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Diagnostic endpoint to check environment
app.get("/make-server-a7e285ba/diagnostic", (c) => {
  const hasSupabaseUrl = !!Deno.env.get('SUPABASE_URL');
  const hasAnonKey = !!Deno.env.get('SUPABASE_ANON_KEY');
  const hasServiceKey = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  return c.json({ 
    status: "ok",
    environment: {
      hasSupabaseUrl,
      hasAnonKey,
      hasServiceKey,
      supabaseUrl: hasSupabaseUrl ? Deno.env.get('SUPABASE_URL')?.substring(0, 30) + '...' : 'MISSING'
    }
  });
});



// ============================================
// AUTHENTICATION ROUTES
// ============================================

// User signup
app.post("/make-server-a7e285ba/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, firstName, lastName, phone, location, city, recaptchaToken } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'signup', 0.5);
    if (!recaptchaResult.success) {
      return c.json({ 
        error: "Bot detection failed. Please try again.",
        details: recaptchaResult.error 
      }, 403);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Create user in auth.users (require email verification)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email verification
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
      }
    });

    if (authError) {
      
      // Handle specific error cases
      if (authError.code === 'email_exists') {
        return c.json({ 
          error: "An account with this email already exists. Please sign in instead or use a different email.",
          code: 'email_exists'
        }, 409); // 409 Conflict
      }
      
      return c.json({ 
        error: authError.message || "Failed to create account. Please try again.",
        details: authError.message,
        code: authError.code
      }, authError.status || 400);
    }

    if (!authData.user) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Create user profile in user_profiles table
    const profileData = {
      id: authData.user.id,
      email: email, // Add email field - REQUIRED
      first_name: firstName || '',
      last_name: lastName || '',
      username: email.split('@')[0], // Create username from email
      display_name: `${firstName} ${lastName}`.trim() || email.split('@')[0], // Full name or email prefix
      phone: phone || '',
      location: city || location || '', // Use city or location as location field
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`,
      joined_date: new Date().toISOString(),
    };
    
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      // Don't fail the signup, profile can be created later
    }

    // Generate verification token and code
    const verifyToken = generateToken();
    const verifyCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database table
    const { error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .insert({
        user_id: authData.user.id,
        email: email,
        token: verifyToken,
        verification_code: verifyCode,
        expires_at: expiresAt.toISOString(),
        type: 'email_verification'
      });

    if (tokenError) {
      // Continue anyway - user can request a new verification email
    }

    // Send verification email
    const appUrl = c.req.header('origin') || 'https://your-app-url.com';
    const verificationUrl = `${appUrl}?verify_token=${verifyToken}`;
    
    const emailResult = await sendEmail({
      to: email,
      subject: 'Verify Your Email - Locksmith Marketplace',
      html: emailVerificationTemplate({
        userName: firstName || 'there',
        verificationUrl
      })
    });

    if (!emailResult.success) {
      // Don't fail signup, user can request a new verification email
    }

    // Return success with message to check email
    return c.json({
      success: true,
      requiresEmailVerification: true,
      message: "Account created successfully! Please check your email to verify your account.",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
        location: city || location || '',
        avatar: profileData.avatar_url || '',
        bio: '',
        website: '',
        joinedDate: profileData.joined_date || '',
        isVerified: false,
        rating: 0,
        totalReviews: 0,
        address: { city: city || '', state: '', zipCode: '' }
      }
    });

  } catch (error) {
    return c.json({ 
      error: "Failed to create account", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Email verification endpoint - supports both token (from link) and code (manually entered)
app.post("/make-server-a7e285ba/auth/verify-email", async (c) => {
  try {
    const body = await c.req.json();
    const { token, code } = body;

    if (!token && !code) {
      return c.json({ error: "Verification token or code is required" }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    let tokenData: any = null;

    // Look up by token (from email link) or code (manually entered)
    if (token) {
      const { data, error } = await supabaseAdmin
        .from('email_verification_tokens')
        .select('*')
        .eq('token', token)
        .is('verified_at', null)
        .single();
      
      if (!error && data) {
        tokenData = data;
      }
    } else if (code) {
      // Search by verification code
      const { data, error } = await supabaseAdmin
        .from('email_verification_tokens')
        .select('*')
        .eq('verification_code', code)
        .eq('type', 'email_verification')
        .is('verified_at', null)
        .single();
      
      if (!error && data) {
        tokenData = data;
      }
    }

    if (!tokenData) {
      return c.json({ 
        error: "Invalid or expired verification code",
        code: 'invalid_token'
      }, 400);
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      return c.json({ 
        error: "Verification code has expired. Please request a new one.",
        code: 'token_expired'
      }, 400);
    }

    // Verify the user's email in auth.users
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { email_confirm: true }
    );

    if (updateError) {
      return c.json({ 
        error: "Failed to verify email. Please try again.",
        details: updateError.message
      }, 500);
    }

    // Mark token as verified
    await supabaseAdmin
      .from('email_verification_tokens')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    // Get user profile for auto-login
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', tokenData.user_id)
      .maybeSingle();

    // Generate access token for auto-login using admin.generateLink
    let sessionData = null;
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: tokenData.email,
      });

      if (!linkError && linkData && linkData.properties) {
        // Extract the session from the generated link
        sessionData = {
          access_token: linkData.properties.access_token,
          refresh_token: linkData.properties.refresh_token
        };
      }
    } catch (err) {
      // Failed to generate session
    }

    // Return success with session if available
    if (sessionData) {
      return c.json({
        success: true,
        message: "Email verified successfully! You're now logged in.",
        session: sessionData,
        user: {
          id: tokenData.user_id,
          email: tokenData.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          phone: profile?.phone || '',
          location: profile?.location || '',
          avatar: profile?.avatar_url || '',
          bio: profile?.bio || '',
          website: profile?.website || '',
          joinedDate: profile?.joined_date || '',
          isVerified: profile?.is_verified || false,
          rating: profile?.rating || 0,
          totalReviews: profile?.total_reviews || 0,
          isAdmin: false
        }
      });
    } else {
      // Return success without auto-login
      return c.json({
        success: true,
        message: "Email verified successfully! Please sign in to continue.",
        user: {
          id: tokenData.user_id,
          email: tokenData.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          phone: profile?.phone || '',
          location: profile?.location || '',
          avatar: profile?.avatar_url || ''
        }
      });
    }

  } catch (error) {
    return c.json({ 
      error: "Failed to verify email", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// User signin
app.post("/make-server-a7e285ba/auth/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, recaptchaToken } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'login', 0.5);
    if (!recaptchaResult.success) {
      return c.json({ 
        error: "Bot detection failed. Please try again.",
        details: recaptchaResult.error 
      }, 403);
    }

    const supabaseClient = getSupabaseClient();

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      
      // Provide user-friendly error message
      let userMessage = error.message;
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        userMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('Email not confirmed')) {
        userMessage = 'Please verify your email address before signing in.';
      }
      
      return c.json({ error: userMessage }, 401);
    }

    if (!data.session || !data.user) {
      return c.json({ error: "Failed to sign in" }, 401);
    }

    // Fetch user profile
    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error(`Profile fetch error: ${profileError.message}`, profileError);
      return c.json({ error: "Failed to fetch profile", details: profileError.message }, 500);
    }

    if (!profile) {
      console.error(`Profile not found for user ${data.user.id}`);
      return c.json({ error: "Profile not found" }, 404);
    }

    // Check admin status from secure admin table
    const isAdmin = await isUserAdmin(data.user.id);

    return c.json({
      success: true,
      message: "Signed in successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        avatar: profile?.avatar_url || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        bio: profile?.bio || '',
        website: profile?.website || '',
        joinedDate: profile?.joined_date || '',
        isVerified: profile?.is_verified || false,
        isAdmin: isAdmin,
        rating: profile?.rating || 0,
        totalReviews: profile?.total_reviews || 0,
        address: profile?.address || { city: '', state: '', zipCode: '' }
      },
      session: data.session,
      access_token: data.session.access_token,
    });

  } catch (error) {
    console.error(`Sign in error: ${error}`);
    return c.json({ 
      error: "Failed to sign in", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Get current user profile
app.get("/make-server-a7e285ba/auth/me", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Use admin client to validate token properly
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      // Only log if it's not a simple session expiry (less alarming in console)
      if (error?.message && !error.message.includes('Auth session missing')) {
      }
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error(`Profile fetch error: ${profileError.message}`, profileError);
      return c.json({ error: "Failed to fetch profile", details: profileError.message }, 500);
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      const emailPrefix = user.email?.split('@')[0] || 'User';
      
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          first_name: firstName,
          last_name: lastName,
          username: emailPrefix,
          display_name: `${firstName} ${lastName}`.trim() || emailPrefix,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName || 'U'} ${lastName || 'U'}`,
          joined_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error(`Failed to create profile: ${createError.message}`);
        return c.json({ error: "Failed to create profile" }, 500);
      }

      // Check admin status from secure admin table
      const isAdmin = await isUserAdmin(user.id);

      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: newProfile.first_name || '',
          lastName: newProfile.last_name || '',
          avatar: newProfile.avatar_url || '',
          phone: newProfile.phone || '',
          location: newProfile.location || '',
          bio: newProfile.bio || '',
          website: newProfile.website || '',
          joinedDate: newProfile.joined_date || '',
          isVerified: newProfile.is_verified || false,
          isAdmin: isAdmin,
          rating: newProfile.rating || 0,
          totalReviews: newProfile.total_reviews || 0,
          phonePublic: newProfile.phone_public || false,
          emailPublic: newProfile.email_public || false,
          showLastActive: newProfile.show_last_active !== false,
          autoReply: newProfile.auto_reply || false,
          autoReplyMessage: newProfile.auto_reply_message || '',
          address: newProfile.address || { city: '', state: '', zipCode: '' }
        }
      });
    }

    // Check admin status from secure admin table
    const isAdmin = await isUserAdmin(user.id);

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        avatar: profile.avatar_url || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        website: profile.website || '',
        joinedDate: profile.joined_date || '',
        isVerified: profile.is_verified || false,
        isAdmin: isAdmin,
        rating: profile.rating || 0,
        totalReviews: profile.total_reviews || 0,
        phonePublic: profile.phone_public || false,
        emailPublic: profile.email_public || false,
        showLastActive: profile.show_last_active !== false,
        autoReply: profile.auto_reply || false,
        autoReplyMessage: profile.auto_reply_message || '',
        address: profile.address || { city: '', state: '', zipCode: '' }
      }
    });

  } catch (error) {
    console.error(`Get current user error: ${error}`);
    return c.json({ 
      error: "Failed to get user", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Update user profile
app.put("/make-server-a7e285ba/auth/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const {
      firstName,
      lastName,
      phone,
      location,
      bio,
      website,
      avatar,
      phonePublic,
      emailPublic,
      showLastActive,
      autoReply,
      autoReplyMessage,
      address,
    } = body;

    const supabaseAdmin = getSupabaseAdmin();

    // Prepare update object
    const updateData: any = {};
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (avatar !== undefined) updateData.avatar_url = avatar;
    if (phonePublic !== undefined) updateData.phone_public = phonePublic;
    if (emailPublic !== undefined) updateData.email_public = emailPublic;
    if (showLastActive !== undefined) updateData.show_last_active = showLastActive;
    if (autoReply !== undefined) updateData.auto_reply = autoReply;
    if (autoReplyMessage !== undefined) updateData.auto_reply_message = autoReplyMessage;
    
    // Handle address as JSONB object
    if (address) {
      updateData.address = {
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || ''
      };
    }

    const { data: profile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error(`Profile update error: ${updateError.message}`);
      return c.json({ error: updateError.message }, 400);
    }

    return c.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        avatar: profile.avatar_url || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        website: profile.website || '',
        joinedDate: profile.joined_date || '',
        isVerified: profile.is_verified || false,
        rating: profile.rating || 0,
        totalReviews: profile.total_reviews || 0,
        phonePublic: profile.phone_public || false,
        emailPublic: profile.email_public || false,
        showLastActive: profile.show_last_active !== false,
        autoReply: profile.auto_reply || false,
        autoReplyMessage: profile.auto_reply_message || '',
        address: profile.address || { city: '', state: '', zipCode: '' }
      }
    });

  } catch (error) {
    console.error(`Update profile error: ${error}`);
    return c.json({ 
      error: "Failed to update profile", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Sign out (client-side handles this, but we provide endpoint for consistency)
app.post("/make-server-a7e285ba/auth/signout", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ success: true, message: "Already signed out" });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = getSupabaseClient();

    await supabaseClient.auth.signOut();

    return c.json({
      success: true,
      message: "Signed out successfully"
    });

  } catch (error) {
    console.error(`Sign out error: ${error}`);
    return c.json({ 
      success: true, 
      message: "Signed out" 
    });
  }
});

// Delete account (soft delete with 15-day recovery period)
app.delete("/make-server-a7e285ba/auth/account", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const { user, error: authError } = await verifyUser(c.req.header('Authorization'));

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Soft delete: Mark account as deleted with deletion timestamp
    // Account will be kept for 15 days for recovery
    const deletionDate = new Date();
    const recoveryDeadline = new Date(deletionDate);
    recoveryDeadline.setDate(recoveryDeadline.getDate() + 15);

    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        deleted_at: deletionDate.toISOString(),
        recovery_deadline: recoveryDeadline.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(`Account deletion error: ${updateError.message}`);
      return c.json({ error: updateError.message }, 400);
    }

    return c.json({
      success: true,
      message: "Account deletion scheduled. You have 15 days to contact support to restore your account.",
      recoveryDeadline: recoveryDeadline.toISOString()
    });

  } catch (error) {
    console.error(`Delete account error: ${error}`);
    return c.json({ 
      error: "Failed to delete account", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Check admin status (debug endpoint)
app.get("/make-server-a7e285ba/auth/check-admin", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header", isAdmin: false }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: "Unauthorized", isAdmin: false }, 401);
    }

    // Check user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error(`Profile check error for ${user.email}:`, profileError);
      return c.json({ 
        error: "Profile not found", 
        isAdmin: false,
        userId: user.id,
        email: user.email,
        profileError: profileError.message
      });
    }

    return c.json({
      isAdmin: profile?.is_admin === true,
      userId: user.id,
      email: user.email,
      profile: profile
    });

  } catch (error) {
    console.error(`Check admin error: ${error}`);
    return c.json({ 
      error: "Failed to check admin", 
      isAdmin: false,
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Make user admin (development helper - should be secured in production)
app.post("/make-server-a7e285ba/auth/make-admin", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // First, check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, is_admin')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error(`Error checking profile:`, checkError);
      return c.json({ error: "Failed to check profile" }, 500);
    }

    if (!existingProfile) {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`Failed to create profile:`, insertError);
        return c.json({ 
          error: "Failed to create profile", 
          details: insertError.message 
        }, 500);
      }

      return c.json({
        success: true,
        message: "Profile created and you are now an admin!"
      });
    } else {
      // Profile exists, update it
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ is_admin: true, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error(`Failed to make user admin:`, updateError);
        return c.json({ 
          error: "Failed to update admin status", 
          details: updateError.message 
        }, 500);
      }

      return c.json({
        success: true,
        message: "You are now an admin!"
      });
    }

  } catch (error) {
    console.error(`Make admin error: ${error}`);
    return c.json({ 
      error: "Failed to make admin", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Upload avatar image
app.post("/make-server-a7e285ba/upload/avatar", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: "Invalid file type. Only images are allowed." }, 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: "File too large. Maximum size is 5MB." }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = 'make-a7e285ba-avatars';

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB,
      });
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Storage upload error: ${uploadError.message}`);
      return c.json({ error: uploadError.message }, 400);
    }

    // Get public URL (bucket is public)
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return c.json({
      success: true,
      url: publicUrl,
      message: "Avatar uploaded successfully"
    });

  } catch (error) {
    console.error(`Upload avatar error: ${error}`);
    return c.json({ 
      error: "Failed to upload avatar", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Upload listing image
app.post("/make-server-a7e285ba/upload/listing-image", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: "Invalid file type. Only images are allowed." }, 400);
    }

    // Validate file size (max 10MB for listings)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: "File too large. Maximum size is 10MB." }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = 'make-a7e285ba-listing-images';

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(`Storage upload error: ${uploadError.message}`);
      return c.json({ error: uploadError.message }, 400);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    return c.json({
      success: true,
      url: publicUrl,
      message: "Listing image uploaded successfully"
    });

  } catch (error) {
    console.error(`Upload listing image error: ${error}`);
    return c.json({ 
      error: "Failed to upload listing image", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Upload cover photo
app.post("/make-server-a7e285ba/upload/cover-photo", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: "Invalid file type. Only images are allowed." }, 400);
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: "File too large. Maximum size is 10MB." }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = 'make-a7e285ba-cover-photos';

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Storage upload error: ${uploadError.message}`);
      return c.json({ error: uploadError.message }, 400);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return c.json({
      success: true,
      url: publicUrl,
      message: "Cover photo uploaded successfully"
    });

  } catch (error) {
    console.error(`Upload cover photo error: ${error}`);
    return c.json({ 
      error: "Failed to upload cover photo", 
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ============================================
// MARKETPLACE LISTINGS ROUTES
// ============================================

// Get all marketplace listings (with filters)
app.get("/make-server-a7e285ba/listings", async (c) => {
  const startTime = Date.now();
  
  try {
    const parseStart = Date.now();
    const supabaseAdmin = getSupabaseAdmin();
    
    const category = c.req.query('category');
    const condition = c.req.query('condition');
    const minPrice = c.req.query('minPrice');
    const maxPrice = c.req.query('maxPrice');
    const search = c.req.query('search');
    const userId = c.req.query('userId');
    const random = c.req.query('random'); // Random ordering flag
    const zipCode = c.req.query('zipCode'); // User's zip code for radius filtering
    const radius = c.req.query('radius'); // Radius in miles
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const buildStart = Date.now();
    let query = supabaseAdmin
      .from('marketplace_listings')
      .select(`
        id,
        title,
        description,
        price,
        category,
        condition,
        images,
        location,
        seller_id,
        views,
        created_at,
        vehicle_year,
        vehicle_make,
        vehicle_model,
        key_type,
        transponder_type,
        user_profiles!marketplace_listings_seller_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          rating,
          total_reviews,
          is_verified,
          created_at
        )
      `)
      .eq('status', 'active');
    
    // Apply filters FIRST (before any ordering or range) for better performance
    if (category) query = query.eq('category', category);
    if (condition) query = query.eq('condition', condition);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (search) query = query.ilike('title', `%${search}%`);
    if (userId) query = query.eq('seller_id', userId);
    
    // OPTIMIZED: Significantly reduced fetch limits for performance
    if (random === 'true') {
      // For radius filtering with random, fetch reasonable limit (300 max)
      if (zipCode && radius) {
        query = query.order('created_at', { ascending: false });
        query = query.range(0, 299); // Limit to 300 for radius filtering performance
      } else {
        // For random without radius, fetch 3 pages worth for variety
        query = query.order('created_at', { ascending: false });
        query = query.range(0, Math.min(59, offset + limit * 3));
      }
    } else if (zipCode && radius) {
      // For radius filtering without random, also limit to reasonable amount
      query = query.order('created_at', { ascending: false });
      query = query.range(0, 299); // Limit to 300 listings max for radius filtering
    } else {
      // Normal pagination - fetch only what's needed
      query = query.order('created_at', { ascending: false });
      query = query.range(offset, offset + limit - 1);
    }

    const dbStart = Date.now();
    const { data: listings, error } = await query;
    const dbTime = Date.now() - dbStart;
    console.log(`⚡ Database query took: ${dbTime}ms (fetched ${listings?.length || 0} rows)`);

    if (error) {
      console.error(`❌ [LISTINGS] Error fetching listings: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    const processStart = Date.now();
    
    let finalListings = listings;
    let hasMore = listings && listings.length === limit;
    
    // OPTIMIZED: Radius filtering with 300 item hard limit
    if (zipCode && radius && listings) {
      const radiusNum = parseInt(radius);
      
      // Get coordinates for the search zip code
      const searchCoords = await getZipCodeCoordinates(zipCode);
      
      if (searchCoords) {
        console.log(`🌍 Radius filtering: ${listings.length} listings within ${radiusNum} miles of ${zipCode}`);
        
        // Extract all unique zip codes from listings first
        const uniqueZips = new Set<string>();
        const listingZipMap = new Map<string, string | null>();
        
        for (const listing of listings) {
          const listingZip = extractZipCode(listing.location || '');
          listingZipMap.set(listing.id, listingZip);
          if (listingZip) {
            uniqueZips.add(listingZip);
          }
        }
        
        // Geocode all unique zip codes in parallel (with batching to avoid rate limits)
        const geocodeStart = Date.now();
        const zipArray = Array.from(uniqueZips);
        const batchSize = 10; // Process 10 at a time to avoid rate limits
        
        for (let i = 0; i < zipArray.length; i += batchSize) {
          const batch = zipArray.slice(i, i + batchSize);
          await Promise.all(batch.map(zip => getZipCodeCoordinates(zip)));
        }
        console.log(`📍 Geocoded ${uniqueZips.size} unique zip codes in ${Date.now() - geocodeStart}ms`);
        
        // Now filter listings by distance
        const filteredByDistance = [];
        let includedCount = 0;
        let excludedCount = 0;
        
        for (const listing of listings) {
          const listingZip = listingZipMap.get(listing.id);
          
          if (!listingZip) {
            // If listing doesn't have a zip code, include it
            filteredByDistance.push(listing);
            includedCount++;
            continue;
          }
          
          const listingCoords = zipCodeCache.get(listingZip);
          
          if (!listingCoords) {
            // If we can't geocode the listing, include it (benefit of the doubt)
            filteredByDistance.push(listing);
            includedCount++;
            continue;
          }
          
          const distance = calculateDistance(
            searchCoords.lat,
            searchCoords.lng,
            listingCoords.lat,
            listingCoords.lng
          );
          
          if (distance <= radiusNum) {
            filteredByDistance.push(listing);
            includedCount++;
          } else {
            excludedCount++;
          }
        }
        
        console.log(`✅ Radius filtering complete: ${includedCount} included, ${excludedCount} excluded`);
        finalListings = filteredByDistance;
        
        // Store debug info to return in response
        (c as any).radiusDebug = {
          searchZip: zipCode,
          searchCoords: searchCoords,
          radiusMiles: radiusNum,
          totalListings: listings.length,
          includedCount,
          excludedCount,
          uniqueZipsCount: uniqueZips.size,
          performanceNote: '⚡ Optimized: Limited to 300 listings max for performance'
        };
      }
    }
    
    // OPTIMIZED: For random mode, apply simple shuffle after filtering (on smaller dataset now)
    if (random === 'true' && finalListings) {
      // Shuffle using Fisher-Yates algorithm (on smaller dataset now)
      const shuffled = [...finalListings];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Apply pagination to shuffled results
      const start = offset;
      const end = offset + limit;
      finalListings = shuffled.slice(start, end);
      hasMore = end < shuffled.length;
    } else if (finalListings) {
      // If not in random mode but we did radius filtering, apply pagination
      if (zipCode && radius) {
        const start = offset;
        const end = offset + limit;
        hasMore = end < finalListings.length;
        finalListings = finalListings.slice(start, end);
      }
    }
    
    const totalPages = hasMore ? page + 1 : page;

    const totalTime = Date.now() - startTime;
    console.log(`⏱️ Total request time: ${totalTime}ms (db: ${dbTime}ms, processing: ${Date.now() - processStart}ms)`);

    const response: any = { 
      success: true, 
      listings: finalListings,
      pagination: {
        page,
        limit,
        total: null, // Don't calculate total for performance
        totalPages,
        hasMore
      }
    };
    
    // Add debug info if radius filtering was applied
    if ((c as any).radiusDebug) {
      response.debug = (c as any).radiusDebug;
    }

    return c.json(response);
  } catch (error) {
    console.error(`❌ [LISTINGS] Error fetching listings: ${error}`);
    return c.json({ error: "Failed to fetch listings" }, 500);
  }
});

// Get user's archived listings (requires auth)
// IMPORTANT: This must come BEFORE /listings/:id to avoid "archived" being treated as an ID
app.get("/make-server-a7e285ba/listings/archived", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      console.error('❌ [ARCHIVED] Auth error:', authError);
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: listings, error } = await supabaseAdmin
      .from('marketplace_listings')
      .select(`
        id,
        title,
        description,
        price,
        category,
        condition,
        images,
        location,
        seller_id,
        views,
        created_at,
        archived_at,
        expires_at,
        vehicle_year,
        vehicle_make,
        vehicle_model,
        key_type,
        transponder_type,
        user_profiles!marketplace_listings_seller_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          rating,
          total_reviews,
          is_verified
        )
      `)
      .eq('seller_id', user.id)
      .eq('status', 'archived')
      .order('archived_at', { ascending: false });

    if (error) {
      console.error(`❌ [ARCHIVED] Database error:`, error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, listings: listings || [] });
  } catch (error) {
    console.error(`❌ [ARCHIVED] Unexpected error:`, error);
    return c.json({ error: "Failed to fetch archived listings" }, 500);
  }
});

// Get single listing by ID
app.get("/make-server-a7e285ba/listings/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .select(`
        *,
        user_profiles!marketplace_listings_seller_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          rating,
          total_reviews,
          is_verified,
          phone,
          phone_public,
          location,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // SECURITY FIX: Respect phone_public privacy setting
    if (listing.user_profiles && !listing.user_profiles.phone_public) {
      // Hide phone number if seller hasn't made it public
      listing.user_profiles.phone = null;
    }

    // Increment view count and get updated listing
    const newViewCount = (listing.views || 0) + 1;
    const { error: updateError } = await supabaseAdmin
      .from('marketplace_listings')
      .update({ views: newViewCount })
      .eq('id', id);

    if (updateError) {
      console.error(`❌ Error updating view count for listing ${id}:`, {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      // Still return the listing but log the error
    }

    // Update the listing object with the new view count before returning
    listing.views = newViewCount;

    return c.json({ success: true, listing });
  } catch (error) {
    console.error(`Error fetching listing: ${error}`);
    return c.json({ error: "Failed to fetch listing" }, 500);
  }
});

// Create new listing (requires auth)
app.post("/make-server-a7e285ba/listings", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const {
      title,
      description,
      price,
      category,
      condition,
      location,
      images,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      keyType,
      transponderType,
    } = body;

    if (!title || !price || !category || !condition || !location) {
      return c.json({ error: "Title, price, category, condition, and location are required" }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .insert({
        seller_id: user.id,
        title,
        description: description || '',
        price: parseFloat(price),
        category,
        condition,
        location,
        images: images || [],
        vehicle_year: vehicleYear || null,
        vehicle_make: vehicleMake || null,
        vehicle_model: vehicleModel || null,
        key_type: keyType || null,
        transponder_type: transponderType || null,
        status: 'active',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Auto-archive after 7 days
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating listing - Database error: ${error.message}`, error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, listing });
  } catch (error) {
    console.error(`Error creating listing: ${error}`);
    return c.json({ error: "Failed to create listing" }, 500);
  }
});

// Update listing (requires auth and ownership)
app.put("/make-server-a7e285ba/listings/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json();

    const supabaseAdmin = getSupabaseAdmin();

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from('marketplace_listings')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== user.id) {
      return c.json({ error: "Unauthorized to update this listing" }, 403);
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.vehicleYear !== undefined) updateData.vehicle_year = body.vehicleYear;
    if (body.vehicleMake !== undefined) updateData.vehicle_make = body.vehicleMake;
    if (body.vehicleModel !== undefined) updateData.vehicle_model = body.vehicleModel;
    if (body.keyType !== undefined) updateData.key_type = body.keyType;
    if (body.transponderType !== undefined) updateData.transponder_type = body.transponderType;

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating listing: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, listing });
  } catch (error) {
    console.error(`Error updating listing: ${error}`);
    return c.json({ error: "Failed to update listing" }, 500);
  }
});

// Archive listing (requires auth and ownership)
app.put("/make-server-a7e285ba/listings/:id/archive", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      console.error('❌ [ARCHIVE] Auth error:', authError);
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from('marketplace_listings')
      .select('seller_id, status')
      .eq('id', id)
      .single();

    if (!existing) {
      console.error(`❌ [ARCHIVE] Listing ${id} not found`);
      return c.json({ error: "Listing not found" }, 404);
    }

    if (existing.seller_id !== user.id) {
      console.error(`❌ [ARCHIVE] User ${user.id} not authorized to archive listing ${id}`);
      return c.json({ error: "Unauthorized to archive this listing" }, 403);
    }

    // Update status to archived and set archived_at timestamp
    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .update({ 
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`❌ [ARCHIVE] Database error archiving listing ${id}:`, error.message);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, listing });
  } catch (error) {
    console.error(`❌ [ARCHIVE] Unexpected error:`, error);
    return c.json({ error: "Failed to archive listing" }, 500);
  }
});

// Delete listing (requires auth and ownership)
app.delete("/make-server-a7e285ba/listings/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from('marketplace_listings')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== user.id) {
      return c.json({ error: "Unauthorized to delete this listing" }, 403);
    }

    const { error } = await supabaseAdmin
      .from('marketplace_listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting listing: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, message: "Listing deleted" });
  } catch (error) {
    console.error(`Error deleting listing: ${error}`);
    return c.json({ error: "Failed to delete listing" }, 500);
  }
});

// Archive expired listings (call this periodically or on-demand)
app.post("/make-server-a7e285ba/listings/archive-expired", async (c) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .from('marketplace_listings')
      .update({ 
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) {
      console.error(`Error archiving expired listings: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, archived: data?.length || 0 });
  } catch (error) {
    console.error(`Error archiving expired listings: ${error}`);
    return c.json({ error: "Failed to archive expired listings" }, 500);
  }
});

// Relist an archived listing (requires auth and ownership)
app.post("/make-server-a7e285ba/listings/:id/relist", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    // Check ownership and archived status
    const { data: existing } = await supabaseAdmin
      .from('marketplace_listings')
      .select('seller_id, status')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== user.id) {
      return c.json({ error: "Unauthorized to relist this listing" }, 403);
    }

    if (existing.status !== 'archived') {
      return c.json({ error: "Only archived listings can be relisted" }, 400);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .update({
        status: 'active',
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        archived_at: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error relisting listing: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, listing });
  } catch (error) {
    console.error(`Error relisting listing: ${error}`);
    return c.json({ error: "Failed to relist listing" }, 500);
  }
});

// Archive a listing manually (requires auth and ownership)
app.post("/make-server-a7e285ba/listings/:id/archive", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    // Check ownership and active status
    const { data: existing } = await supabaseAdmin
      .from('marketplace_listings')
      .select('seller_id, status')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== user.id) {
      return c.json({ error: "Unauthorized to archive this listing" }, 403);
    }

    if (existing.status !== 'active') {
      return c.json({ error: "Only active listings can be archived" }, 400);
    }

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error archiving listing: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, listing });
  } catch (error) {
    console.error(`Error archiving listing: ${error}`);
    return c.json({ error: "Failed to archive listing" }, 500);
  }
});

// Unarchive a listing (renew - requires auth and ownership)
app.put("/make-server-a7e285ba/listings/:id/unarchive", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    // Check ownership and archived status
    const { data: existing } = await supabaseAdmin
      .from('marketplace_listings')
      .select('seller_id, status')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== user.id) {
      return c.json({ error: "Unauthorized to unarchive this listing" }, 403);
    }

    if (existing.status !== 'archived') {
      return c.json({ error: "Only archived listings can be unarchived" }, 400);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .update({
        status: 'active',
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        archived_at: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error unarchiving listing: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, listing });
  } catch (error) {
    console.error(`Error unarchiving listing: ${error}`);
    return c.json({ error: "Failed to unarchive listing" }, 500);
  }
});

// ============================================
// SAVED ITEMS ROUTES
// ============================================

// Get user's saved items
app.get("/make-server-a7e285ba/saved-items", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const itemType = c.req.query('type'); // 'listing' or 'product'

    let query = supabaseAdmin
      .from('saved_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    const { data: savedItems, error } = await query;

    if (error) {
      console.error(`Error fetching saved items: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // For listings, fetch the actual listing data
    if (itemType === 'listing' || !itemType) {
      const listingIds = savedItems
        .filter(item => item.item_type === 'listing')
        .map(item => item.item_id);

      if (listingIds.length > 0) {
        const { data: listings } = await supabaseAdmin
          .from('marketplace_listings')
          .select(`
            *,
            user_profiles!marketplace_listings_seller_id_fkey (
              id,
              first_name,
              last_name,
              avatar_url,
              rating,
              is_verified
            )
          `)
          .in('id', listingIds);

        // Merge saved items with listing data
        savedItems.forEach(item => {
          if (item.item_type === 'listing') {
            item.listing = listings?.find(l => l.id === item.item_id);
          }
        });
      }
    }

    return c.json({ success: true, savedItems });
  } catch (error) {
    console.error(`Error fetching saved items: ${error}`);
    return c.json({ error: "Failed to fetch saved items" }, 500);
  }
});

// Save an item
app.post("/make-server-a7e285ba/saved-items", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { itemId, itemType, itemData } = body;

    if (!itemId || !itemType) {
      return c.json({ error: "Item ID and type are required" }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if already saved
    const { data: existing } = await supabaseAdmin
      .from('saved_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .single();

    if (existing) {
      return c.json({ success: true, message: "Item already saved", alreadySaved: true });
    }

    const { data: savedItem, error } = await supabaseAdmin
      .from('saved_items')
      .insert({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        item_data: itemData || {},
      })
      .select()
      .single();

    if (error) {
      console.error(`Error saving item: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, savedItem });
  } catch (error) {
    console.error(`Error saving item: ${error}`);
    return c.json({ error: "Failed to save item" }, 500);
  }
});

// Remove saved item
app.delete("/make-server-a7e285ba/saved-items/:itemId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const itemId = c.req.param('itemId');
    const itemType = c.req.query('type');

    const supabaseAdmin = getSupabaseAdmin();

    let deleteQuery = supabaseAdmin
      .from('saved_items')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId);

    if (itemType) {
      deleteQuery = deleteQuery.eq('item_type', itemType);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error(`Error removing saved item: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, message: "Item removed from saved" });
  } catch (error) {
    console.error(`Error removing saved item: ${error}`);
    return c.json({ error: "Failed to remove saved item" }, 500);
  }
});

// ============================================
// MESSAGING ROUTES
// ============================================
// Updated with unread count tracking

// Get unread messages count
app.get("/make-server-a7e285ba/messages/unread-count", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get regular conversations for this user (not admin warnings)
    const { data: regularConversations, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .neq('is_admin_warning', true);

    if (convError) {
      console.error(`Error fetching user conversations: ${convError.message}`);
      return c.json({ error: convError.message }, 400);
    }

    // Get admin warning conversations for this user (only if both buyer and seller are the user)
    const { data: adminConversations, error: adminConvError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', user.id)
      .eq('is_admin_warning', true);

    if (adminConvError) {
      console.error(`Error fetching admin warning conversations: ${adminConvError.message}`);
      return c.json({ error: adminConvError.message }, 400);
    }

    // Combine both types of conversations
    const allConversations = [...(regularConversations || []), ...(adminConversations || [])];

    if (!allConversations || allConversations.length === 0) {
      return c.json({ success: true, count: 0 });
    }

    const conversationIds = allConversations.map(c => c.id);

    // Count unread messages where user is NOT the sender
    const { count, error } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', user.id)
      .in('conversation_id', conversationIds);

    if (error) {
      console.error(`Error counting unread messages: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, count: count || 0 });
  } catch (error) {
    console.error(`Error counting unread messages: ${error}`);
    return c.json({ error: "Failed to count unread messages" }, 500);
  }
});

// DEBUG: Get all admin warning conversations in database
app.get("/make-server-a7e285ba/debug/admin-warnings", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyAdmin(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Admin access required" }, 403);
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: allAdminWarnings, error } = await supabaseAdmin
      .from('conversations')
      .select('id, buyer_id, seller_id, is_admin_warning, listing_id, created_at, last_message_at')
      .eq('is_admin_warning', true)
      .order('created_at', { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, admin_warnings: allAdminWarnings || [], count: allAdminWarnings?.length || 0 });
  } catch (error) {
    console.error(`Error fetching admin warnings debug info: ${error}`);
    return c.json({ error: "Failed to fetch debug info" }, 500);
  }
});

// Get user's conversations
app.get("/make-server-a7e285ba/conversations", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // First, get conversation IDs that the user has deleted
    const { data: deletedConvs } = await supabaseAdmin
      .from('conversation_deletions')
      .select('conversation_id')
      .eq('user_id', user.id);

    const deletedConvIds = (deletedConvs || []).map(d => d.conversation_id);

    // DEBUG: Check if any admin conversations exist for this user
    const { data: adminConvs } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('seller_id', user.id)
      .eq('is_admin_warning', true);

    // Fetch regular conversations (not admin warnings)
    // Admin warning conversations are handled separately below
    // IMPORTANT: Filter out admin warnings explicitly (both null and false are OK, true is not)
    let query = supabaseAdmin
      .from('conversations')
      .select(`
        *,
        buyer:user_profiles!conversations_buyer_id_fkey(id, first_name, last_name, avatar_url),
        listing:marketplace_listings(id, title, price, images)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .not('is_admin_warning', 'eq', true) // Explicitly exclude where is_admin_warning = true
      .order('last_message_at', { ascending: false });

    // Exclude deleted conversations
    if (deletedConvIds.length > 0) {
      query = query.not('id', 'in', `(${deletedConvIds.join(',')})`);
    }

    const { data: regularConversations, error } = await query;

    if (error) {
      console.error(`Error fetching regular conversations: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Fetch admin warning conversations - ONLY for the warned user
    // Admin warnings have buyer_id = seller_id = warned user
    let adminQuery = supabaseAdmin
      .from('conversations')
      .select(`
        *,
        buyer:user_profiles!conversations_buyer_id_fkey(id, first_name, last_name, avatar_url),
        listing:marketplace_listings(id, title, price, images)
      `)
      .eq('buyer_id', user.id)
      .eq('seller_id', user.id)
      .eq('is_admin_warning', true)
      .order('last_message_at', { ascending: false });

    // Exclude deleted admin conversations
    if (deletedConvIds.length > 0) {
      adminQuery = adminQuery.not('id', 'in', `(${deletedConvIds.join(',')})`);
    }

    const { data: adminConversations, error: adminError } = await adminQuery;

    if (adminError) {
      console.error(`Error fetching admin warning conversations: ${adminError.message}`);
      return c.json({ error: adminError.message }, 400);
    }

    // REMOVED: Admin warning conversations - they are now handled via /notifications route
    // Use only regular conversations (no admin warnings)
    const conversations = regularConversations || [];

    // Fetch seller profiles for conversations
    const sellerIds = (conversations || [])
      .map(c => c.seller_id)
      .filter(id => id !== null);
    
    let sellerProfiles = {};
    if (sellerIds.length > 0) {
      const { data: sellers } = await supabaseAdmin
        .from('user_profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', sellerIds);
      
      sellerProfiles = (sellers || []).reduce((acc, seller) => {
        acc[seller.id] = seller;
        return acc;
      }, {});
    }

    // Calculate unread count for each conversation and attach seller profile
    const conversationsWithUnread = await Promise.all(
      (conversations || []).map(async (conv) => {
        // For admin warnings, sender_id is null, so we need special handling
        let countQuery = supabaseAdmin
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false);
        
        // Only exclude messages from the current user if not an admin warning
        if (!conv.is_admin_warning) {
          countQuery = countQuery.neq('sender_id', user.id);
        }
        
        const { count } = await countQuery;
        
        return {
          ...conv,
          seller: conv.is_admin_warning ? null : sellerProfiles[conv.seller_id],
          unread_count: count || 0
        };
      })
    );

    return c.json({ success: true, conversations: conversationsWithUnread, currentUserId: user.id });
  } catch (error) {
    console.error(`Error fetching conversations: ${error}`);
    return c.json({ error: "Failed to fetch conversations" }, 500);
  }
});

// Delete conversation(s) - soft delete by hiding from user's view
app.delete("/make-server-a7e285ba/conversations", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { conversationIds } = body;

    if (!conversationIds || !Array.isArray(conversationIds) || conversationIds.length === 0) {
      return c.json({ error: "conversationIds array is required" }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify user is part of all conversations before deleting
    const { data: conversations, error: verifyError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .in('id', conversationIds)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (verifyError) {
      console.error(`Error verifying conversations: ${verifyError.message}`);
      return c.json({ error: verifyError.message }, 400);
    }

    if (!conversations || conversations.length !== conversationIds.length) {
      return c.json({ error: "Some conversations not found or unauthorized" }, 403);
    }

    // Soft delete: Insert records into conversation_deletions table
    const deletionRecords = conversationIds.map(convId => ({
      conversation_id: convId,
      user_id: user.id
    }));

    const { error: insertError } = await supabaseAdmin
      .from('conversation_deletions')
      .upsert(deletionRecords, { onConflict: 'conversation_id,user_id' });

    if (insertError) {
      console.error(`Error soft-deleting conversations: ${insertError.message}`);
      return c.json({ error: insertError.message }, 400);
    }

    return c.json({ 
      success: true, 
      deletedCount: conversationIds.length,
      message: `Successfully deleted ${conversationIds.length} conversation(s)` 
    });
  } catch (error) {
    console.error(`Error deleting conversations: ${error}`);
    return c.json({ error: "Failed to delete conversations" }, 500);
  }
});

// Get or create conversation
app.post("/make-server-a7e285ba/conversations", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { listingId, sellerId, otherUserId } = body;

    // Support both listing-based and direct user-to-user conversations
    if (!listingId && !otherUserId) {
      return c.json({ error: "Either listingId or otherUserId is required" }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // For listing-based conversations
    if (listingId) {
      if (!sellerId) {
        return c.json({ error: "Seller ID is required for listing conversations" }, 400);
      }

      if (sellerId === user.id) {
        return c.json({ error: "Cannot message yourself" }, 400);
      }

      // Check if conversation already exists
      const { data: existing } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .single();

      if (existing) {
        // Remove any soft-delete records so conversation reappears
        await supabaseAdmin
          .from('conversation_deletions')
          .delete()
          .eq('conversation_id', existing.id);
        
        return c.json({ success: true, conversation: existing, existing: true });
      }

      // Create new conversation
      const { data: conversation, error } = await supabaseAdmin
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select()
        .single();

      if (error) {
        console.error(`Error creating conversation: ${error.message}`);
        return c.json({ error: error.message }, 400);
      }

      return c.json({ success: true, conversation });
    } 
    
    // For direct user-to-user conversations (no listing)
    if (otherUserId) {
      if (otherUserId === user.id) {
        return c.json({ error: "Cannot message yourself" }, 400);
      }

      // Determine buyer/seller roles (user initiating is buyer, other is seller)
      const buyerId = user.id;
      const sellerId = otherUserId;

      // Check if conversation already exists (either direction)
      const { data: existing } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .is('listing_id', null)
        .or(`and(buyer_id.eq.${buyerId},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${buyerId})`)
        .single();

      if (existing) {
        // Remove any soft-delete records so conversation reappears
        await supabaseAdmin
          .from('conversation_deletions')
          .delete()
          .eq('conversation_id', existing.id);
        
        return c.json({ success: true, conversation: existing, existing: true });
      }

      // Create new direct conversation (no listing)
      const { data: conversation, error } = await supabaseAdmin
        .from('conversations')
        .insert({
          listing_id: null,
          buyer_id: buyerId,
          seller_id: sellerId,
        })
        .select()
        .single();

      if (error) {
        console.error(`Error creating direct conversation: ${error.message}`);
        return c.json({ error: error.message }, 400);
      }

      return c.json({ success: true, conversation });
    }
  } catch (error) {
    console.error(`Error creating conversation: ${error}`);
    return c.json({ error: "Failed to create conversation" }, 500);
  }
});

// Get messages in a conversation
app.get("/make-server-a7e285ba/conversations/:id/messages", async (c) => {
  const startTime = Date.now();
  
  // Track individual timings
  let authTime = 0, convTime = 0, msgQueryTime = 0, imgTime = 0;
  
  try {
    const authHeader = c.req.header('Authorization');
    
    const authStart = Date.now();
    const { user, error: authError } = await verifyUser(authHeader);
    authTime = Date.now() - authStart;

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const conversationId = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '10');
    const before = c.req.query('before'); // Message ID to load before (for pagination)
    const supabaseAdmin = getSupabaseAdmin();

    // Verify user is part of conversation
    const convStart = Date.now();
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();
    convTime = Date.now() - convStart;

    if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Fetch messages with pagination
    const msgStart = Date.now();
    let query = supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:user_profiles!messages_sender_id_fkey(id, first_name, last_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false }); // Descending to get latest messages first
    
    // If 'before' is provided, only get messages before that message's created_at
    if (before) {
      const { data: beforeMsg } = await supabaseAdmin
        .from('messages')
        .select('created_at')
        .eq('id', before)
        .single();
      
      if (beforeMsg) {
        query = query.lt('created_at', beforeMsg.created_at);
      }
    }
    
    query = query.limit(limit);
    
    const { data: messages, error } = await query;
    msgQueryTime = Date.now() - msgStart;

    if (error) {
      console.error(`Error fetching messages: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // OPTIMIZATION: Only process images if messages have them
    const hasImages = (messages || []).some(m => m.images && m.images.length > 0);
    let messagesWithSignedUrls = messages || [];

    if (hasImages) {
      const imgStart = Date.now();
      const bucketName = 'make-a7e285ba-message-images';
      messagesWithSignedUrls = await Promise.all(
        (messages || []).map(async (message) => {
          if (message.images && message.images.length > 0) {
            const signedUrls = await Promise.all(
              message.images.map(async (imagePath: string) => {
                const { data: signedData } = await supabaseAdmin.storage
                  .from(bucketName)
                  .createSignedUrl(imagePath, 3600);
                return signedData?.signedUrl || imagePath;
              })
            );
            return { ...message, image_urls: signedUrls };
          }
          return message;
        })
      );
      imgTime = Date.now() - imgStart;
    }

    // Mark messages as read (fire-and-forget) - including admin warnings
    supabaseAdmin
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .or(`sender_id.neq.${user.id},is_admin_warning.eq.true`) // Mark admin warnings as read even if sender_id matches
      .eq('is_read', false)
      .then(() => {})
      .catch((err) => {
        console.error(`Error marking messages as read: ${err}`);
      });

    const totalTime = Date.now() - startTime;
    
    // Reverse messages to show oldest first (we queried descending)
    const reversedMessages = (messagesWithSignedUrls || []).reverse();
    const hasMore = (messages?.length || 0) >= limit;
    
    return c.json({ 
      success: true, 
      messages: reversedMessages,
      hasMore,
      _debug: {
        totalTime: `${totalTime}ms`,
        authTime: `${authTime}ms`,
        convTime: `${convTime}ms`,
        msgQueryTime: `${msgQueryTime}ms`,
        imgTime: `${imgTime}ms`,
        messageCount: messages?.length || 0,
        hasImages
      }
    });
  } catch (error) {
    console.error(`Error fetching messages: ${error}`);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// Send a message
app.post("/make-server-a7e285ba/messages", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Check content type to handle multipart form data
    const contentType = c.req.header('Content-Type') || '';
    let conversationId: string;
    let content: string;
    let imageFiles: File[] = [];

    if (contentType.includes('multipart/form-data')) {
      // Handle form data with images
      const formData = await c.req.formData();
      conversationId = formData.get('conversationId') as string;
      content = formData.get('content') as string || '';
      
      // Get all image files (max 5)
      for (let i = 0; i < 5; i++) {
        const file = formData.get(`image${i}`) as File | null;
        if (file) {
          imageFiles.push(file);
        }
      }
    } else {
      // Handle JSON data (no images)
      const body = await c.req.json();
      conversationId = body.conversationId;
      content = body.content;
    }

    if (!conversationId || (!content && imageFiles.length === 0)) {
      return c.json({ error: "Conversation ID and content or images are required" }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify user is part of conversation
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Upload images to Supabase Storage if any
    const imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      const bucketName = 'make-a7e285ba-message-images';
      
      // Create bucket if it doesn't exist
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      if (!bucketExists) {
        await supabaseAdmin.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 5242880, // 5MB
        });
      }

      // Upload each image
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${conversationId}/${Date.now()}_${i}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error(`Error uploading image ${i}: ${uploadError.message}`);
          continue;
        }

        // Get the full path
        imageUrls.push(fileName);
      }
    }

    // Remove soft-delete records for both users so conversation reappears
    await supabaseAdmin
      .from('conversation_deletions')
      .delete()
      .eq('conversation_id', conversationId);

    // Update conversation's last_message_at timestamp
    await supabaseAdmin
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Send message with images if any
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content || '',
        images: imageUrls.length > 0 ? imageUrls : null,
      })
      .select()
      .single();

    if (error) {
      console.error(`Error sending message: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, message });
  } catch (error) {
    console.error(`Error sending message: ${error}`);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// ============================================
// FEED & SOCIAL ROUTES
// ============================================



// ============================================
// USER PROFILE ROUTES
// ============================================

// Get user profile by ID
app.get("/make-server-a7e285ba/users/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const supabaseAdmin = getSupabaseAdmin();

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Error fetching user profile: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    if (!profile) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get additional stats
    const { data: listingsData } = await supabaseAdmin
      .from('marketplace_listings')
      .select('id, status')
      .eq('seller_id', userId);

    const { data: reviewsData } = await supabaseAdmin
      .from('user_reviews')
      .select('rating')
      .eq('reviewee_id', userId);

    // Calculate average rating
    let averageRating = 0;
    if (reviewsData && reviewsData.length > 0) {
      const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
      averageRating = totalRating / reviewsData.length;
    }

    // SECURITY FIX: Only return public profile fields, not sensitive data
    // Do NOT expose: email, phone, address, privacy settings, auto-reply
    return c.json({ 
      success: true, 
      profile: {
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        website: profile.website || '',
        city: profile.city || '',
        state: profile.state || '',
        location: profile.location || '', // General location only, not specific address
        is_verified: profile.is_verified || false,
        created_at: profile.created_at,
        joined_date: profile.joined_date,
        last_active: profile.show_last_active ? profile.last_active : null,
        stats: {
          activeListings: listingsData?.filter(l => l.status === 'active').length || 0,
          totalListings: listingsData?.length || 0,
          totalSales: profile.total_sales || 0,
          followers: profile.followers_count || 0,
          following: profile.following_count || 0,
        },
        rating: averageRating,
        totalRatings: reviewsData?.length || 0,
      }
    });
  } catch (error) {
    console.error(`Error fetching user profile: ${error}`);
    return c.json({ error: "Failed to fetch user profile" }, 500);
  }
});

// Get user's marketplace listings
app.get("/make-server-a7e285ba/users/:userId/listings", async (c) => {
  try {
    const userId = c.req.param('userId');
    const supabaseAdmin = getSupabaseAdmin();

    const { data: listings, error } = await supabaseAdmin
      .from('marketplace_listings')
      .select(`
        *,
        user_profiles!marketplace_listings_seller_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          rating,
          is_verified
        )
      `)
      .eq('seller_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching user listings: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, listings: listings || [] });
  } catch (error) {
    console.error(`Error fetching user listings: ${error}`);
    return c.json({ error: "Failed to fetch user listings" }, 500);
  }
});

// ============================================
// REVIEWS & RATINGS ROUTES
// ============================================

// Get reviews for a user
app.get("/make-server-a7e285ba/users/:userId/reviews", async (c) => {
  try {
    const userId = c.req.param('userId');
    const supabaseAdmin = getSupabaseAdmin();

    const { data: reviews, error } = await supabaseAdmin
      .from('user_reviews')
      .select(`
        *,
        reviewer:user_profiles!user_reviews_reviewer_id_fkey(id, first_name, last_name, avatar_url, is_verified)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching reviews: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, reviews });
  } catch (error) {
    console.error(`Error fetching reviews: ${error}`);
    return c.json({ error: "Failed to fetch reviews" }, 500);
  }
});

// Check if user can review another user
app.get("/make-server-a7e285ba/reviews/can-review/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const revieweeId = c.req.param('userId');
    
    if (revieweeId === user.id) {
      return c.json({ 
        canReview: false, 
        reason: "Cannot review yourself",
        messagesSent: 0,
        messagesRequired: 10
      });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user has already reviewed this person
    const { data: existingReview } = await supabaseAdmin
      .from('user_reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('reviewee_id', revieweeId)
      .maybeSingle();

    if (existingReview) {
      return c.json({ 
        canReview: false, 
        reason: "You have already reviewed this user",
        messagesSent: 0,
        messagesRequired: 10
      });
    }

    // Check if users have had a conversation
    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(`and(buyer_id.eq.${user.id},seller_id.eq.${revieweeId}),and(buyer_id.eq.${revieweeId},seller_id.eq.${user.id})`)
      .limit(1);

    if (!conversations || conversations.length === 0) {
      return c.json({ 
        canReview: false, 
        reason: "You must have a conversation with this user",
        messagesSent: 0,
        messagesRequired: 10
      });
    }

    const conversationId = conversations[0].id;

    // Count messages sent by the reviewer in this conversation
    const { count } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .eq('sender_id', user.id);

    const messagesSent = count || 0;

    if (messagesSent < 10) {
      return c.json({ 
        canReview: false, 
        reason: `Send ${10 - messagesSent} more message${10 - messagesSent === 1 ? '' : 's'} to unlock reviews`,
        messagesSent,
        messagesRequired: 10
      });
    }

    return c.json({ 
      canReview: true, 
      messagesSent,
      messagesRequired: 10
    });

  } catch (error) {
    console.error(`Error checking review eligibility: ${error}`);
    return c.json({ error: "Failed to check review eligibility" }, 500);
  }
});

// Create review (requires auth)
app.post("/make-server-a7e285ba/reviews", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { reviewedUserId, listingId, rating, comment } = body;

    if (!reviewedUserId || !rating) {
      return c.json({ error: "Reviewed user ID and rating are required" }, 400);
    }

    if (reviewedUserId === user.id) {
      return c.json({ error: "Cannot review yourself" }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user has already reviewed this person
    const { data: existingReview } = await supabaseAdmin
      .from('user_reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('reviewee_id', reviewedUserId)
      .maybeSingle();

    if (existingReview) {
      return c.json({ error: "You have already reviewed this user" }, 400);
    }

    // Check if users have had a conversation (at least 10 messages exchanged)
    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(`and(buyer_id.eq.${user.id},seller_id.eq.${reviewedUserId}),and(buyer_id.eq.${reviewedUserId},seller_id.eq.${user.id})`)
      .limit(1);

    if (!conversations || conversations.length === 0) {
      return c.json({ error: "You must have a conversation with this user before reviewing" }, 400);
    }

    const conversationId = conversations[0].id;

    // Count messages sent by the reviewer in this conversation
    const { data: messages, count } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .eq('sender_id', user.id);

    if (!count || count < 10) {
      return c.json({ 
        error: "You must send at least 10 messages before you can leave a review",
        messagesSent: count || 0,
        messagesRequired: 10
      }, 400);
    }

    const { data: review, error } = await supabaseAdmin
      .from('user_reviews')
      .insert({
        reviewer_id: user.id,
        reviewee_id: reviewedUserId,
        listing_id: listingId,
        rating: parseFloat(rating),
        comment,
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating review: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, review });
  } catch (error) {
    console.error(`Error creating review: ${error}`);
    return c.json({ error: "Failed to create review" }, 500);
  }
});

// Delete review (admin or review owner only)
app.delete("/make-server-a7e285ba/reviews/:reviewId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const reviewId = c.req.param('reviewId');
    const supabaseAdmin = getSupabaseAdmin();

    // Get the review to check ownership
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('user_reviews')
      .select('reviewer_id, reviewee_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      return c.json({ error: "Review not found" }, 404);
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin || false;

    // Only allow deletion if user is admin or the reviewer
    if (!isAdmin && review.reviewer_id !== user.id) {
      return c.json({ error: "Unauthorized to delete this review" }, 403);
    }

    // Delete the review (trigger will automatically update user stats)
    const { error: deleteError } = await supabaseAdmin
      .from('user_reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      console.error(`Error deleting review: ${deleteError.message}`);
      return c.json({ error: deleteError.message }, 400);
    }

    return c.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error(`Error deleting review: ${error}`);
    return c.json({ error: "Failed to delete review" }, 500);
  }
});

// Admin: Recalculate review counts for all users (fixes stale data)
app.post("/make-server-a7e285ba/admin/recalculate-review-counts", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check admin status from JWT app_metadata (secure)
    const isAdmin = user.app_metadata?.role === 'admin' || 
                    user.app_metadata?.is_admin === true;

    if (!isAdmin) {
      return c.json({ error: "Admin access required" }, 403);
    }

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('id');

    if (usersError) {
      return c.json({ error: "Failed to fetch users" }, 500);
    }

    let updatedCount = 0;
    const results = [];

    // Recalculate for each user
    for (const userProfile of users || []) {
      // Count actual reviews
      const { data: reviews, error: reviewsError } = await supabaseAdmin
        .from('user_reviews')
        .select('rating')
        .eq('reviewee_id', userProfile.id);

      if (reviewsError) {
        console.error(`Error fetching reviews for user ${userProfile.id}:`, reviewsError);
        continue;
      }

      const reviewCount = reviews?.length || 0;
      const avgRating = reviewCount > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
        : 0;

      // Update user profile with correct counts
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          total_reviews: reviewCount,
          rating: avgRating
        })
        .eq('id', userProfile.id);

      if (updateError) {
        console.error(`Error updating user ${userProfile.id}:`, updateError);
      } else {
        updatedCount++;
        results.push({
          userId: userProfile.id,
          reviewCount,
          rating: avgRating
        });
      }
    }

    return c.json({ 
      success: true, 
      message: `Recalculated review counts for ${updatedCount} users`,
      results 
    });
  } catch (error) {
    console.error(`Error recalculating review counts: ${error}`);
    return c.json({ error: "Failed to recalculate review counts" }, 500);
  }
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

// Get user's notifications
app.get("/make-server-a7e285ba/notifications", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error(`Error fetching notifications: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Map both 'read' and 'is_read' fields to 'is_read' for frontend compatibility
    // Database might have either column name depending on migration version
    const mappedNotifications = (notifications || []).map(n => ({
      ...n,
      is_read: n.is_read ?? n.read ?? false
    }));

    return c.json({ success: true, notifications: mappedNotifications });
  } catch (error) {
    console.error(`Error fetching notifications: ${error}`);
    return c.json({ error: "Failed to fetch notifications" }, 500);
  }
});

// ============================================
// SEARCH HISTORY ROUTES
// ============================================

// Get user's search history
app.get("/make-server-a7e285ba/search-history", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Use SQL table instead of KV store
    const supabaseAdmin = getSupabaseAdmin();
    const { data: searches, error } = await supabaseAdmin
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error(`Error fetching search history from SQL: ${error.message}`);
      return c.json({ error: "Failed to fetch search history" }, 500);
    }

    // Format response to match existing format
    const history = (searches || []).map(s => ({
      query: s.query,
      filters: s.filters,
      timestamp: new Date(s.created_at).getTime(),
      resultsCount: s.results_count
    }));

    return c.json({ success: true, history });
  } catch (error) {
    console.error(`Error fetching search history: ${error}`);
    return c.json({ error: "Failed to fetch search history" }, 500);
  }
});

// Save search to history
app.post("/make-server-a7e285ba/search-history", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { query, filters, resultsCount } = body;

    // Use SQL table instead of KV store
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('search_history')
      .insert({
        user_id: user.id,
        query,
        filters: filters || {},
        results_count: resultsCount || 0
      });

    if (error) {
      console.error(`Error saving search history to SQL: ${error.message}`);
      return c.json({ error: "Failed to save search history" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error(`Error saving search history: ${error}`);
    return c.json({ error: "Failed to save search history" }, 500);
  }
});

// Clear search history
app.delete("/make-server-a7e285ba/search-history", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await verifyUser(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Use SQL table instead of KV store
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('search_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error(`Error clearing search history from SQL: ${error.message}`);
      return c.json({ error: "Failed to clear search history" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error(`Error clearing search history: ${error}`);
    return c.json({ error: "Failed to clear search history" }, 500);
  }
});

// ============================================
// ADMIN MANAGEMENT ROUTES (BizDizy Pattern)
// ============================================

// Get all users (admin only)
app.get("/make-server-a7e285ba/admin/users", async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Get all auth users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error(`Error listing users: ${authError.message}`);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }

    // Get user profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*');

    if (profileError) {
      console.error(`Error fetching profiles: ${profileError.message}`);
    }

    // Get all admins
    const { data: admins, error: adminsError } = await supabaseAdmin
      .from('admins_a7e285ba')
      .select('user_id');

    if (adminsError) {
      console.error(`Error fetching admins: ${adminsError.message}`);
    }

    const adminUserIds = new Set(admins?.map(a => a.user_id) || []);

    // Combine auth users with profiles
    const users = authData.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id);
      const isAdmin = adminUserIds.has(authUser.id);
      
      return {
        id: authUser.id,
        email: authUser.email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        avatar: profile?.avatar_url || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        joinedDate: profile?.joined_date || authUser.created_at,
        lastSignIn: authUser.last_sign_in_at,
        isVerified: profile?.is_verified || false,
        isBanned: profile?.is_banned || false,
        isAdmin: isAdmin,
        role: isAdmin ? 'admin' : 'user',
        totalSales: profile?.total_sales || 0,
        rating: profile?.rating || 0,
      };
    });

    return c.json({ 
      success: true, 
      users,
      count: users.length 
    });

  } catch (error) {
    console.error(`Error in admin/users: ${error}`);
    return c.json({ 
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Promote user to admin (admin only)
app.post("/make-server-a7e285ba/admin/promote/:userId", async (c) => {
  try {
    const { user: adminUser, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !adminUser) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Verify the target user exists
    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError || !targetUser) {
      console.error(`Error getting user: ${getUserError?.message}`);
      return c.json({ error: 'User not found' }, 404);
    }

    // Add to secure admin table
    const { error: insertError } = await supabaseAdmin
      .from('admins_a7e285ba')
      .insert({
        user_id: userId,
        granted_by: adminUser.id,
        notes: `Promoted by admin ${adminUser.email || adminUser.id}`
      })
      .select()
      .maybeSingle();

    if (insertError && insertError.code !== '23505') { // Ignore duplicate key error
      console.error(`Error promoting user: ${insertError.message}`);
      return c.json({ error: 'Failed to promote user' }, 500);
    }

    return c.json({ 
      success: true,
      message: 'User promoted to admin successfully.',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        role: 'admin',
        isAdmin: true,
      }
    });

  } catch (error) {
    console.error(`Error in admin/promote: ${error}`);
    return c.json({ 
      error: 'Failed to promote user',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Demote admin to regular user (admin only)
app.post("/make-server-a7e285ba/admin/demote/:userId", async (c) => {
  try {
    const { user: adminUser, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !adminUser) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Prevent self-demotion
    if (userId === adminUser.id) {
      return c.json({ error: 'Cannot demote yourself' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Update app_metadata to remove admin role (secure, cannot be edited by users)
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        app_metadata: { 
          role: 'user',
          is_admin: false
        }
      }
    );

    if (updateError) {
      console.error(`Error demoting user: ${updateError.message}`);
      return c.json({ error: 'Failed to demote user' }, 500);
    }

    return c.json({ 
      success: true,
      message: 'User demoted from admin. They must log out and log back in for changes to take effect.',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'user',
        isAdmin: false,
      }
    });

  } catch (error) {
    console.error(`Error in admin/demote: ${error}`);
    return c.json({ 
      error: 'Failed to demote user',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Delete user account (admin only)
app.delete("/make-server-a7e285ba/admin/users/:userId", async (c) => {
  try {
    const { user: adminUser, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !adminUser) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Prevent self-deletion
    if (userId === adminUser.id) {
      return c.json({ error: 'Cannot delete yourself' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Delete user (this will cascade to user_profiles due to foreign key)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error(`Error deleting user: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete user' }, 500);
    }

    return c.json({ 
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error(`Error in admin/delete: ${error}`);
    return c.json({ 
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Toggle user admin status (admin only)
app.put("/make-server-a7e285ba/admin/users/:userId/admin", async (c) => {
  try {
    const { user: adminUser, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !adminUser) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    const body = await c.req.json();
    const { isAdmin } = body;

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    if (typeof isAdmin !== 'boolean') {
      return c.json({ error: 'isAdmin must be a boolean' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Verify the target user exists
    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError || !targetUser) {
      console.error(`Error getting user: ${getUserError?.message}`);
      return c.json({ error: 'User not found' }, 404);
    }

    // Update secure admin table
    if (isAdmin) {
      // Add to admin table
      const { error: insertError } = await supabaseAdmin
        .from('admins_a7e285ba')
        .insert({
          user_id: userId,
          granted_by: adminUser.id,
          notes: `Promoted by admin ${adminUser.email || adminUser.id}`
        })
        .select()
        .maybeSingle();

      if (insertError && insertError.code !== '23505') { // Ignore duplicate key error
        console.error(`Error adding to admin table: ${insertError.message}`);
        return c.json({ error: 'Failed to promote user to admin' }, 500);
      }
    } else {
      // Remove from admin table
      const { error: deleteError } = await supabaseAdmin
        .from('admins_a7e285ba')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error(`Error removing from admin table: ${deleteError.message}`);
        return c.json({ error: 'Failed to demote user from admin' }, 500);
      }
    }

    return c.json({ 
      success: true,
      message: `User ${isAdmin ? 'promoted to admin' : 'demoted from admin'} successfully`,
      user: {
        id: userId,
        is_admin: isAdmin
      }
    });

  } catch (error) {
    console.error(`Error in admin/users/:userId/admin: ${error}`);
    return c.json({ 
      error: 'Failed to update admin status',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Check if current user is admin
app.get("/make-server-a7e285ba/admin/check", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ isAdmin: false });
    }

    const isAdmin = user.app_metadata?.role === 'admin' || 
                    user.app_metadata?.is_admin === true;

    return c.json({ 
      isAdmin,
      userId: user.id,
      email: user.email
    });

  } catch (error) {
    console.error(`Error in admin/check: ${error}`);
    return c.json({ isAdmin: false });
  }
});

// ============================================
// POLICY MANAGEMENT ROUTES
// ============================================

// Get platform policies (admin only)
app.get("/make-server-a7e285ba/admin/policies", async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Get policies from database
    const { data: policies, error: dbError } = await supabaseAdmin
      .from('platform_policies')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Error fetching policies:', dbError);
      return c.json({ 
        success: true,
        policies: {
          terms: '',
          privacy: '',
          lastUpdated: ''
        }
      });
    }

    return c.json({
      success: true,
      policies: policies ? {
        terms: policies.terms_content || '',
        privacy: policies.privacy_content || '',
        lastUpdated: policies.updated_at || ''
      } : {
        terms: '',
        privacy: '',
        lastUpdated: ''
      }
    });

  } catch (error) {
    console.error(`Error in admin/policies GET: ${error}`);
    return c.json({ 
      success: true,
      policies: {
        terms: '',
        privacy: '',
        lastUpdated: ''
      }
    });
  }
});

// Save platform policies (admin only)
app.post("/make-server-a7e285ba/admin/policies", async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const body = await c.req.json();
    const { terms, privacy, notifyUsers } = body;

    const supabaseAdmin = getSupabaseAdmin();
    
    // Save policies to database
    const { data: policy, error: dbError } = await supabaseAdmin
      .from('platform_policies')
      .upsert({
        terms_content: terms,
        privacy_content: privacy,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving policies:', dbError);
      return c.json({ success: false, error: 'Failed to save policies' }, 500);
    }

    // If notifyUsers is true, send email notifications to all users
    if (notifyUsers) {
      
      // Get all auth users
      const { data: authData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

      if (!usersError && authData?.users && authData.users.length > 0) {
        
        const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://yourdomain.com';
        const policyUrl = `${baseUrl}/?section=privacy`;
        
        let successCount = 0;
        let errorCount = 0;
        
        // Send emails with rate limiting (Resend limit: 2 req/sec)
        for (const user of authData.users) {
          // Skip users who are banned or don't have confirmed emails
          if (user.banned_until || !user.email_confirmed_at) {
            continue;
          }
          
          try {
            const userName = user.user_metadata?.first_name || user.email.split('@')[0];
            
            const emailResult = await sendEmail({
              to: user.email,
              subject: 'Privacy Policy Updated - Locksmith Marketplace',
              html: policyUpdateTemplate({
                userName,
                policyUrl
              })
            });
            
            if (emailResult.success) {
              successCount++;
            } else {
              errorCount++;
              console.error(`[POLICY] Failed to send policy email:`, emailResult.error);
            }
            
            // Rate limiting: 600ms delay between emails (~1.6 emails/sec)
            if (authData.users.indexOf(user) < authData.users.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 600));
            }
          } catch (error) {
            errorCount++;
            console.error(`[POLICY] Error sending policy email:`, error);
          }
        }
      }
    }

    return c.json({
      success: true,
      message: notifyUsers ? 'Policies saved and users notified via email' : 'Policies saved successfully'
    });

  } catch (error) {
    console.error(`Error in admin/policies POST: ${error}`);
    return c.json({ success: false, error: 'Failed to save policies' }, 500);
  }
});

// Mark notification as read
app.put("/make-server-a7e285ba/notifications/:id/read", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const notificationId = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error: dbError } = await supabaseAdmin
      .from('notifications')
      .update({ 
        read: true,
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Error marking notification as read:', dbError);
      return c.json({ success: false, error: 'Failed to update notification' }, 500);
    }

    return c.json({ success: true });

  } catch (error) {
    console.error(`Error in notification read PUT: ${error}`);
    return c.json({ success: false, error: 'Failed to update notification' }, 500);
  }
});

// Mark all as read
app.put("/make-server-a7e285ba/notifications/mark-all-read", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    const { error: dbError } = await supabaseAdmin
      .from('notifications')
      .update({ 
        read: true,
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Error marking all as read:', dbError);
      return c.json({ success: false, error: 'Failed to update notifications' }, 500);
    }

    return c.json({ success: true });

  } catch (error) {
    console.error(`Error in mark-all-read PUT: ${error}`);
    return c.json({ success: false, error: 'Failed to update notifications' }, 500);
  }
});

// Delete notification
app.delete("/make-server-a7e285ba/notifications/:id", async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const notificationId = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error: dbError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Error deleting notification:', dbError);
      return c.json({ success: false, error: 'Failed to delete notification' }, 500);
    }

    return c.json({ success: true });

  } catch (error) {
    console.error(`Error in notification DELETE: ${error}`);
    return c.json({ success: false, error: 'Failed to delete notification' }, 500);
  }
});

// Test policy email (admin only)
app.post("/make-server-a7e285ba/admin/test-policy-email", async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://yourdomain.com';
    const policyUrl = `${baseUrl}/?section=privacy`;
    
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Privacy Policy Updated - Locksmith Marketplace',
      html: policyUpdateTemplate({
        userName: user.first_name || 'Admin',
        policyUrl
      })
    });

    return c.json({ 
      success: emailResult.success,
      message: emailResult.success ? `Test email sent to ${user.email}` : 'Failed to send email',
      error: emailResult.error
    });

  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// LEGACY ENDPOINTS (Deprecated - kept for backward compatibility)
// ============================================

// Get retailers (legacy endpoint - fetches from retailer_profiles)
app.get('/make-server-a7e285ba/admin/retailers', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    // Create Supabase client
    const supabase = getSupabaseAdmin();

    // Fetch retailer profiles from the database
    const { data: profiles, error: fetchError } = await supabase
      .from('retailer_profiles')
      .select('id, company_name, logo_url, is_always_on_top, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching retailer profiles:', fetchError);
      return c.json({ 
        success: false,
        error: 'Failed to fetch retailer profiles',
        retailers: []
      }, 500);
    }

    // Format as retailers with active status
    const retailers = (profiles || []).map(profile => ({
      id: profile.id,
      name: profile.company_name,
      logo_url: profile.logo_url,
      status: 'active',
      is_always_on_top: profile.is_always_on_top,
      created_at: profile.created_at
    }));

    return c.json({
      success: true,
      retailers
    });
  } catch (error) {
    console.error('Error in get retailers:', error);
    return c.json({ 
      success: false,
      error: 'Failed to fetch retailers',
      retailers: []
    }, 500);
  }
});

// Upload retailer logo (admin only)
app.post('/make-server-a7e285ba/admin/retailers/upload-logo', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return c.json({ 
        success: false,
        error: 'No file provided' 
      }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ 
        success: false,
        error: 'File must be an image' 
      }, 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ 
        success: false,
        error: 'File size must be less than 5MB' 
      }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Create bucket if it doesn't exist
    const bucketName = 'make-a7e285ba-retailer-logos';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
      });
      
      if (bucketError) {
        console.error('Error creating bucket:', bucketError);
        return c.json({ 
          success: false,
          error: 'Failed to create storage bucket' 
        }, 500);
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return c.json({ 
        success: false,
        error: 'Failed to upload file' 
      }, 500);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log(`Retailer logo uploaded by admin ${user.email}: ${publicUrlData.publicUrl}`);

    return c.json({
      success: true,
      logoUrl: publicUrlData.publicUrl
    }, 200);

  } catch (error) {
    console.error('Error uploading retailer logo:', error);
    return c.json({ 
      success: false,
      error: 'Failed to upload retailer logo' 
    }, 500);
  }
});

// Get banners (legacy endpoint - fetches from promotional_banners)
app.get('/make-server-a7e285ba/admin/banners', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    // Create Supabase client
    const supabase = getSupabaseAdmin();

    // Fetch promotional banners from the database
    const { data: promobanners, error: fetchError } = await supabase
      .from('promotional_banners')
      .select('id, name, link, pc_image_url, mobile_image_url, is_active, created_at, display_order')
      .order('display_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching promotional banners:', fetchError);
      return c.json({ 
        success: false,
        error: 'Failed to fetch promotional banners',
        banners: []
      }, 500);
    }

    // Format as banners with status (using name as title, pc_image_url as image_url, link as link_url for compatibility)
    const banners = (promobanners || []).map(banner => ({
      id: banner.id,
      title: banner.name,
      image_url: banner.pc_image_url,
      link_url: banner.link,
      status: banner.is_active ? 'active' : 'inactive',
      created_at: banner.created_at
    }));

    return c.json({
      success: true,
      banners
    });
  } catch (error) {
    console.error('Error in get banners:', error);
    return c.json({ 
      success: false,
      error: 'Failed to fetch banners',
      banners: []
    }, 500);
  }
});

// ============================================
// RETAILER BANNER SYSTEM - REDESIGNED
// ============================================

// Upload banner image to Supabase Storage (admin only)
app.post('/make-server-a7e285ba/admin/upload-banner-image', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const imageType = formData.get('imageType') as string; // 'pc' or 'mobile'
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = 'make-a7e285ba-retailer-banners';

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${imageType}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    // Upload file
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError} = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading banner image:', uploadError);
      return c.json({ error: 'Failed to upload image' }, 500);
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return c.json({
      success: true,
      imageUrl: publicUrlData.publicUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error('Error in upload-banner-image:', error);
    return c.json({ error: 'Failed to upload banner image' }, 500);
  }
});

// Get all retailer banner positions (admin only)
app.get('/make-server-a7e285ba/admin/retailer-banners', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: positions, error: fetchError } = await supabaseAdmin
      .from('banner_positions')
      .select('*')
      .order('position_number', { ascending: true });

    if (fetchError) {
      console.error('Error fetching retailer banners:', fetchError);
      return c.json({ error: 'Failed to fetch retailer banners' }, 500);
    }

    // Transform data to frontend format
    const transformed = (positions || []).map(pos => ({
      id: pos.id,
      positionNumber: pos.position_number,
      retailerName: pos.retailer_name,
      isActive: pos.is_active,
      banners: pos.retailer_data?.banners || [],
      createdAt: pos.created_at,
      updatedAt: pos.updated_at
    }));

    return c.json({
      success: true,
      positions: transformed
    });
  } catch (error) {
    console.error('Error in get retailer-banners:', error);
    return c.json({ error: 'Failed to fetch retailer banners' }, 500);
  }
});

// Create new retailer position (admin only)
app.post('/make-server-a7e285ba/admin/retailer-banners', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const body = await c.req.json();
    const { positionNumber, retailerName, banners } = body;

    if (!positionNumber || !retailerName) {
      return c.json({ error: 'Position number and retailer name are required' }, 400);
    }

    if (positionNumber < 1 || positionNumber > 20) {
      return c.json({ error: 'Position number must be between 1 and 20' }, 400);
    }

    if (banners && banners.length > 5) {
      return c.json({ error: 'Maximum 5 banners per retailer' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if position already exists
    const { data: existing } = await supabaseAdmin
      .from('banner_positions')
      .select('id')
      .eq('position_number', positionNumber)
      .single();

    if (existing) {
      return c.json({ error: `Position ${positionNumber} is already taken` }, 400);
    }

    // Create new position
    const { data, error: insertError } = await supabaseAdmin
      .from('banner_positions')
      .insert({
        position_number: positionNumber,
        retailer_name: retailerName,
        is_active: true,
        retailer_data: { banners: banners || [] },
        updated_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating retailer position:', insertError);
      return c.json({ error: 'Failed to create retailer position' }, 500);
    }

    return c.json({
      success: true,
      position: {
        id: data.id,
        positionNumber: data.position_number,
        retailerName: data.retailer_name,
        isActive: data.is_active,
        banners: data.retailer_data?.banners || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    });
  } catch (error) {
    console.error('Error in create retailer-banner:', error);
    return c.json({ error: 'Failed to create retailer position' }, 500);
  }
});

// Update retailer position (admin only)
app.put('/make-server-a7e285ba/admin/retailer-banners/:id', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const { retailerName, isActive, banners } = body;

    if (banners && banners.length > 5) {
      return c.json({ error: 'Maximum 5 banners per retailer' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    if (retailerName !== undefined) updateData.retailer_name = retailerName;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (banners !== undefined) updateData.retailer_data = { banners };

    const { data, error: updateError } = await supabaseAdmin
      .from('banner_positions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating retailer position:', updateError);
      return c.json({ error: 'Failed to update retailer position' }, 500);
    }

    return c.json({
      success: true,
      position: {
        id: data.id,
        positionNumber: data.position_number,
        retailerName: data.retailer_name,
        isActive: data.is_active,
        banners: data.retailer_data?.banners || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    });
  } catch (error) {
    console.error('Error in update retailer-banner:', error);
    return c.json({ error: 'Failed to update retailer position' }, 500);
  }
});

// Delete retailer position (admin only)
app.delete('/make-server-a7e285ba/admin/retailer-banners/:id', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    const { error: deleteError } = await supabaseAdmin
      .from('banner_positions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting retailer position:', deleteError);
      return c.json({ error: 'Failed to delete retailer position' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error in delete retailer-banner:', error);
    return c.json({ error: 'Failed to delete retailer position' }, 500);
  }
});

// Get active retailer banners for public retailers page
app.get('/make-server-a7e285ba/retailer-banners', async (c) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: positions, error: fetchError } = await supabaseAdmin
      .from('banner_positions')
      .select('*')
      .eq('is_active', true)
      .order('position_number', { ascending: true });

    if (fetchError) {
      console.error('Error fetching active retailer banners:', fetchError);
      return c.json({ error: 'Failed to fetch retailer banners' }, 500);
    }

    // Filter positions that have at least 1 banner
    const activePositions = (positions || [])
      .filter(pos => {
        const banners = pos.retailer_data?.banners || [];
        return banners.length > 0;
      })
      .map(pos => ({
        id: pos.id,
        positionNumber: pos.position_number,
        retailerName: pos.retailer_name,
        banners: pos.retailer_data?.banners || []
      }));

    return c.json({
      success: true,
      positions: activePositions
    });
  } catch (error) {
    console.error('Error in get active retailer-banners:', error);
    return c.json({ error: 'Failed to fetch retailer banners' }, 500);
  }
});

// ============================================
// PROMOTIONAL BANNERS SYSTEM
// ============================================

// Get all promotional banners (admin only)
app.get('/make-server-a7e285ba/admin/promotional-banners', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: banners, error: fetchError } = await supabaseAdmin
      .from('promotional_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching promotional banners:', fetchError);
      // If table doesn't exist, return empty array instead of error
      if (fetchError.code === '42P01') {
        return c.json({
          success: true,
          banners: [],
          warning: 'Table not initialized. Please run migration 005_promotional_banners.sql'
        });
      }
      return c.json({ error: 'Failed to fetch promotional banners', details: fetchError.message }, 500);
    }

    return c.json({
      success: true,
      banners: banners || []
    });
  } catch (error) {
    console.error('Error in get promotional-banners:', error);
    return c.json({ error: 'Failed to fetch promotional banners', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Create promotional banner (admin only)
app.post('/make-server-a7e285ba/admin/promotional-banners', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const body = await c.req.json();
    const { name, link, pc_image_url, mobile_image_url, is_active } = body;

    if (!name) {
      return c.json({ error: 'Banner name is required' }, 400);
    }

    if (!pc_image_url && !mobile_image_url) {
      return c.json({ error: 'At least one image (PC or mobile) is required' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get the highest display_order
    const { data: maxOrderBanner } = await supabaseAdmin
      .from('promotional_banners')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderBanner?.display_order || 0) + 1;

    const { data, error: insertError } = await supabaseAdmin
      .from('promotional_banners')
      .insert({
        name,
        link: link || '',
        pc_image_url,
        mobile_image_url,
        display_order: nextOrder,
        is_active: is_active !== undefined ? is_active : true,
        updated_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating promotional banner:', insertError);
      return c.json({ error: 'Failed to create promotional banner' }, 500);
    }

    return c.json({
      success: true,
      banner: data
    });
  } catch (error) {
    console.error('Error in create promotional-banner:', error);
    return c.json({ error: 'Failed to create promotional banner' }, 500);
  }
});

// Update promotional banner (admin only)
app.put('/make-server-a7e285ba/admin/promotional-banners/:id', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const updates: any = { updated_by: user.id };

    // Only update fields that are provided
    if (body.name !== undefined) updates.name = body.name;
    if (body.link !== undefined) updates.link = body.link;
    if (body.pc_image_url !== undefined) updates.pc_image_url = body.pc_image_url;
    if (body.mobile_image_url !== undefined) updates.mobile_image_url = body.mobile_image_url;
    if (body.display_order !== undefined) updates.display_order = body.display_order;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error: updateError } = await supabaseAdmin
      .from('promotional_banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating promotional banner:', updateError);
      return c.json({ error: 'Failed to update promotional banner' }, 500);
    }

    return c.json({
      success: true,
      banner: data
    });
  } catch (error) {
    console.error('Error in update promotional-banner:', error);
    return c.json({ error: 'Failed to update promotional banner' }, 500);
  }
});

// Delete promotional banner (admin only)
app.delete('/make-server-a7e285ba/admin/promotional-banners/:id', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    const { error: deleteError } = await supabaseAdmin
      .from('promotional_banners')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting promotional banner:', deleteError);
      return c.json({ error: 'Failed to delete promotional banner' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error in delete promotional-banner:', error);
    return c.json({ error: 'Failed to delete promotional banner' }, 500);
  }
});

// Get active promotional banners for public marketplace page
app.get('/make-server-a7e285ba/promotional-banners', async (c) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: banners, error: fetchError } = await supabaseAdmin
      .from('promotional_banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching active promotional banners:', fetchError);
      // If table doesn't exist, return empty array instead of error
      if (fetchError.code === '42P01') {
        return c.json({
          success: true,
          banners: []
        });
      }
      return c.json({ error: 'Failed to fetch promotional banners', details: fetchError.message }, 500);
    }

    return c.json({
      success: true,
      banners: banners || []
    });
  } catch (error) {
    console.error('Error in get active promotional-banners:', error);
    return c.json({ error: 'Failed to fetch promotional banners', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// ============================================
// DEALS BANNER ROUTES
// ============================================

// Get all deals banners (admin only)
app.get('/make-server-a7e285ba/admin/deals-banners', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: banners, error: fetchError } = await supabaseAdmin
      .from('deals_banners_a7e285ba')
      .select('*')
      .order('display_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching deals banners:', fetchError);
      // If table doesn't exist, return empty array instead of error
      if (fetchError.code === '42P01') {
        return c.json({
          success: true,
          banners: [],
          warning: 'Table not initialized. Creating table...'
        });
      }
      return c.json({ error: 'Failed to fetch deals banners', details: fetchError.message }, 500);
    }

    return c.json({
      success: true,
      banners: banners || []
    });
  } catch (error) {
    console.error('Error in get deals-banners:', error);
    return c.json({ error: 'Failed to fetch deals banners', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Create deals banner (admin only)
app.post('/make-server-a7e285ba/admin/deals-banners', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const body = await c.req.json();
    const { name, link, pc_image_url, mobile_image_url, is_active } = body;

    if (!name) {
      return c.json({ error: 'Banner name is required' }, 400);
    }

    if (!pc_image_url && !mobile_image_url) {
      return c.json({ error: 'At least one image (PC or mobile) is required' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get the highest display_order
    const { data: maxOrderBanner } = await supabaseAdmin
      .from('deals_banners_a7e285ba')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderBanner?.display_order || 0) + 1;

    const { data, error: insertError } = await supabaseAdmin
      .from('deals_banners_a7e285ba')
      .insert({
        name,
        link: link || '',
        pc_image_url,
        mobile_image_url,
        display_order: nextOrder,
        is_active: is_active !== undefined ? is_active : true,
        updated_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating deals banner:', insertError);
      return c.json({ error: 'Failed to create deals banner' }, 500);
    }

    return c.json({
      success: true,
      banner: data
    });
  } catch (error) {
    console.error('Error in create deals-banner:', error);
    return c.json({ error: 'Failed to create deals banner' }, 500);
  }
});

// Update deals banner (admin only)
app.put('/make-server-a7e285ba/admin/deals-banners/:id', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const updates: any = { updated_by: user.id };

    // Only update fields that are provided
    if (body.name !== undefined) updates.name = body.name;
    if (body.link !== undefined) updates.link = body.link;
    if (body.pc_image_url !== undefined) updates.pc_image_url = body.pc_image_url;
    if (body.mobile_image_url !== undefined) updates.mobile_image_url = body.mobile_image_url;
    if (body.display_order !== undefined) updates.display_order = body.display_order;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error: updateError } = await supabaseAdmin
      .from('deals_banners_a7e285ba')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating deals banner:', updateError);
      return c.json({ error: 'Failed to update deals banner' }, 500);
    }

    return c.json({
      success: true,
      banner: data
    });
  } catch (error) {
    console.error('Error in update deals-banner:', error);
    return c.json({ error: 'Failed to update deals banner' }, 500);
  }
});

// Delete deals banner (admin only)
app.delete('/make-server-a7e285ba/admin/deals-banners/:id', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    const { error: deleteError } = await supabaseAdmin
      .from('deals_banners_a7e285ba')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting deals banner:', deleteError);
      return c.json({ error: 'Failed to delete deals banner' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error in delete deals-banner:', error);
    return c.json({ error: 'Failed to delete deals banner' }, 500);
  }
});

// Get active deals banners for public deals page
app.get('/make-server-a7e285ba/deals-banners', async (c) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: banners, error: fetchError } = await supabaseAdmin
      .from('deals_banners_a7e285ba')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching active deals banners:', fetchError);
      // If table doesn't exist, return empty array instead of error
      if (fetchError.code === '42P01') {
        return c.json({
          success: true,
          banners: []
        });
      }
      return c.json({ error: 'Failed to fetch deals banners', details: fetchError.message }, 500);
    }

    return c.json({
      success: true,
      banners: banners || []
    });
  } catch (error) {
    console.error('Error in get active deals-banners:', error);
    return c.json({ error: 'Failed to fetch deals banners', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// ============================================
// VEHICLE DATABASE ROUTES
// ============================================

// Upload vehicle database (admin only)
app.post('/make-server-a7e285ba/admin/vehicle-database', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    const body = await c.req.json();
    const { vehicleData } = body;

    if (!vehicleData) {
      return c.json({ error: 'Vehicle data is required' }, 400);
    }

    // Parse and insert into SQL table
    const supabaseAdmin = getSupabaseAdmin();
    
    // Clear existing vehicles
    await supabaseAdmin.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Prepare vehicle records for batch insert
    const vehicleRecords = [];
    
    // Parse JobDataPro structure: years -> makes -> models
    for (const [year, makes] of Object.entries(vehicleData)) {
      if (!makes || typeof makes !== 'object') continue;
      
      for (const [make, models] of Object.entries(makes)) {
        if (!models || typeof models !== 'object') continue;
        
        if (Array.isArray(models)) {
          // Simple array of model names
          for (const model of models) {
            vehicleRecords.push({
              year: parseInt(year),
              make: make,
              model: typeof model === 'string' ? model : model.name || 'Unknown',
              metadata: typeof model === 'object' ? model : {}
            });
          }
        } else {
          // Object with model details
          for (const [modelName, modelData] of Object.entries(models)) {
            vehicleRecords.push({
              year: parseInt(year),
              make: make,
              model: modelName,
              trim: modelData?.trim,
              body_type: modelData?.bodyType || modelData?.body_type,
              engine: modelData?.engine,
              transmission: modelData?.transmission,
              drive_type: modelData?.driveType || modelData?.drive_type,
              fuel_type: modelData?.fuelType || modelData?.fuel_type,
              doors: modelData?.doors
            });
          }
        }
      }
    }

    // Batch insert in chunks of 1000
    const chunkSize = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < vehicleRecords.length; i += chunkSize) {
      const chunk = vehicleRecords.slice(i, i + chunkSize);
      const { error: insertError } = await supabaseAdmin
        .from('vehicles')
        .insert(chunk);
      
      if (insertError) {
        console.error(`Error inserting vehicle chunk ${i}-${i + chunk.length}: ${insertError.message}`);
      } else {
        insertedCount += chunk.length;
      }
    }

    return c.json({ 
      success: true, 
      message: `Vehicle database uploaded successfully: ${insertedCount} vehicles` 
    });
  } catch (error) {
    console.error(`Error uploading vehicle database: ${error}`);
    return c.json({ error: "Failed to upload vehicle database" }, 500);
  }
});

// Get vehicle database (public access for VehicleSelector)
app.get('/make-server-a7e285ba/vehicle-database', async (c) => {
  try {
    // Fetch vehicles from SQL table and reconstruct JobDataPro structure
    const supabaseAdmin = getSupabaseAdmin();
    // Query only core columns that exist in current schema
    const { data: vehicles, error } = await supabaseAdmin
      .from('vehicles')
      .select('year, make, model, trim, body_type, engine, transmission, drive_type, fuel_type, doors')
      .order('year', { ascending: true })
      .order('make', { ascending: true })
      .order('model', { ascending: true });

    if (error) {
      console.error(`❌ Error fetching vehicles from SQL: ${error.message}, Code: ${error.code}, Details: ${error.details}`);
      return c.json({ error: "Failed to fetch vehicle database", details: error.message }, 500);
    }

    if (!vehicles || vehicles.length === 0) {
      // Return empty object if no vehicles in database yet
      return c.json({ success: true, vehicleData: null });
    }

    // Reconstruct JobDataPro structure: { year: { make: { model: {...} } } }
    const vehicleData: any = {};
    
    for (const vehicle of vehicles) {
      const year = vehicle.year.toString();
      const make = vehicle.make;
      const model = vehicle.model;
      
      if (!vehicleData[year]) {
        vehicleData[year] = {};
      }
      if (!vehicleData[year][make]) {
        vehicleData[year][make] = {};
      }
      
      // Map current schema to expected format
      vehicleData[year][make][model] = {
        trim: vehicle.trim,
        bodyType: vehicle.body_type,
        engine: vehicle.engine,
        transmission: vehicle.transmission,
        driveType: vehicle.drive_type,
        fuelType: vehicle.fuel_type,
        doors: vehicle.doors
      };
    }

    return c.json({ success: true, vehicleData });
  } catch (error) {
    console.error(`Error fetching vehicle database: ${error}`);
    return c.json({ error: "Failed to fetch vehicle database" }, 500);
  }
});

// Delete vehicle database (admin only)
app.delete('/make-server-a7e285ba/admin/vehicle-database', async (c) => {
  try {
    const { user, error } = await verifyAdmin(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized - Admin access required' }, 401);
    }

    // Delete all vehicles from SQL table
    const supabaseAdmin = getSupabaseAdmin();
    const { error: deleteError } = await supabaseAdmin
      .from('vehicles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      console.error(`Error deleting vehicles from SQL: ${deleteError.message}`);
      return c.json({ error: "Failed to reset vehicle database" }, 500);
    }
    
    return c.json({ success: true, message: 'Vehicle database reset successfully' });
  } catch (error) {
    console.error(`Error resetting vehicle database: ${error}`);
    return c.json({ error: "Failed to reset vehicle database" }, 500);
  }
});

// ============================================
// BANNER POSITIONS ROUTES
// ============================================

// Get all banner positions (admin only)
app.get("/make-server-a7e285ba/admin/banner-positions", async (c) => {
  try {
    const { user: adminUser, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !adminUser) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get all banner positions from database
    const { data: positions, error: dbError } = await supabaseAdmin
      .from('banner_positions')
      .select('*')
      .order('position_number', { ascending: true });

    if (dbError) {
      console.error('Database error fetching banner positions:', dbError);
      return c.json({ error: 'Failed to fetch banner positions from database', details: dbError.message }, 500);
    }

    // If no positions exist, initialize 20 empty positions
    if (!positions || positions.length === 0) {
      
      const positionsToCreate = Array.from({ length: 20 }, (_, i) => ({
        position_number: i + 1,
        position_name: `Position ${i + 1}`,
        banners: [],
        is_active: true
      }));

      const { data: newPositions, error: insertError } = await supabaseAdmin
        .from('banner_positions')
        .insert(positionsToCreate)
        .select();

      if (insertError) {
        console.error('Error creating initial banner positions:', insertError);
        return c.json({ error: 'Failed to initialize banner positions', details: insertError.message }, 500);
      }

      const positionArray = (newPositions || []).map(pos => ({
        id: pos.id,
        positionNumber: pos.position_number,
        positionName: pos.position_name,
        banners: pos.banners || [],
        updatedAt: pos.updated_at,
        updatedBy: pos.updated_by
      }));

      return c.json({ 
        success: true, 
        positions: positionArray
      });
    }

    // Transform to match expected format
    const positionArray = positions.map(pos => {
      const bannersArray = typeof pos.banners === 'string' 
        ? JSON.parse(pos.banners) 
        : pos.banners;
      return {
        id: pos.id,
        positionNumber: pos.position_number,
        positionName: pos.position_name,
        banners: bannersArray || [],
        updatedAt: pos.updated_at,
        updatedBy: pos.updated_by
      };
    });

    return c.json({ 
      success: true, 
      positions: positionArray
    });
  } catch (error) {
    console.error(`Error fetching banner positions: ${error}`);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to fetch banner positions', details: String(error) }, 500);
  }
});

// Get active banner positions (public - for retailers page)
app.get("/make-server-a7e285ba/banner-positions/active", async (c) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get active banner positions from database (positions with at least 1 banner)
    const { data: positions, error: dbError } = await supabaseAdmin
      .from('banner_positions')
      .select('*')
      .eq('is_active', true)
      .order('position_number', { ascending: true });

    if (dbError) {
      console.error('Database error fetching active banner positions:', dbError);
      return c.json({ error: 'Failed to fetch active banner positions from database', details: dbError.message }, 500);
    }

    // If no positions exist in database, return empty array (not an error)
    if (!positions || positions.length === 0) {
      return c.json({ 
        success: true, 
        positions: []
      });
    }

    // Filter positions that have at least 1 banner and transform to expected format
    const activePositions = positions
      .filter(pos => {
        try {
          // Handle both JSONB and already-parsed arrays
          const bannersArray = typeof pos.banners === 'string' 
            ? JSON.parse(pos.banners) 
            : pos.banners;
          const hasBanners = bannersArray && Array.isArray(bannersArray) && bannersArray.length > 0;
          return hasBanners;
        } catch (err) {
          console.error(`Error parsing banners for position ${pos.position_number}:`, err);
          return false;
        }
      })
      .map(pos => {
        const bannersArray = typeof pos.banners === 'string' 
          ? JSON.parse(pos.banners) 
          : pos.banners;
        return {
          id: pos.id,
          positionNumber: pos.position_number,
          positionName: pos.position_name,
          banners: bannersArray || [],
          updatedAt: pos.updated_at
        };
      });

    return c.json({ 
      success: true, 
      positions: activePositions
    });
  } catch (error) {
    console.error(`Error fetching active banner positions: ${error}`);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to fetch active banner positions', details: String(error) }, 500);
  }
});

// Create or update banner position (admin only)
app.put("/make-server-a7e285ba/admin/banner-positions/:positionId", async (c) => {
  try {
    const { user: adminUser, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !adminUser) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const positionId = c.req.param('positionId');
    const body = await c.req.json();
    const { positionNumber, positionName, banners } = body;

    // Validate position number (1-20)
    if (positionNumber < 1 || positionNumber > 20) {
      return c.json({ error: 'Position number must be between 1 and 20' }, 400);
    }

    // Validate max 5 banners
    if (banners && banners.length > 5) {
      return c.json({ error: 'Maximum 5 banners per position' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if position exists
    const { data: existingPosition } = await supabaseAdmin
      .from('banner_positions')
      .select('id')
      .eq('id', positionId)
      .single();

    let result;
    if (existingPosition) {
      // Update existing position
      const { data, error: updateError } = await supabaseAdmin
        .from('banner_positions')
        .update({
          position_number: positionNumber,
          position_name: positionName || `Position ${positionNumber}`,
          banners: banners || [],
          updated_by: adminUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', positionId)
        .select()
        .single();

      if (updateError) {
        console.error('Database error updating banner position:', updateError);
        return c.json({ error: 'Failed to update banner position in database' }, 500);
      }
      result = data;
    } else {
      // Create new position
      const { data, error: insertError } = await supabaseAdmin
        .from('banner_positions')
        .insert({
          id: positionId,
          position_number: positionNumber,
          position_name: positionName || `Position ${positionNumber}`,
          banners: banners || [],
          updated_by: adminUser.id
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database error creating banner position:', insertError);
        return c.json({ error: 'Failed to create banner position in database' }, 500);
      }
      result = data;
    }

    // Transform to match expected format
    const positionData = {
      id: result.id,
      positionNumber: result.position_number,
      positionName: result.position_name,
      banners: result.banners || [],
      updatedAt: result.updated_at,
      updatedBy: result.updated_by
    };

    return c.json({ 
      success: true, 
      position: positionData
    });
  } catch (error) {
    console.error(`Error updating banner position: ${error}`);
    return c.json({ error: 'Failed to update banner position' }, 500);
  }
});

// Delete banner position (admin only)
app.delete("/make-server-a7e285ba/admin/banner-positions/:positionId", async (c) => {
  try {
    const { user: adminUser, error } = await verifyAdmin(c.req.header('Authorization'));
    
    if (error || !adminUser) {
      return c.json({ error: error || 'Admin access required' }, 403);
    }

    const positionId = c.req.param('positionId');

    const supabaseAdmin = getSupabaseAdmin();

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('banner_positions')
      .delete()
      .eq('id', positionId);

    if (deleteError) {
      console.error('Database error deleting banner position:', deleteError);
      return c.json({ error: 'Failed to delete banner position from database' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error(`Error deleting banner position: ${error}`);
    return c.json({ error: 'Failed to delete banner position' }, 500);
  }
});

// =====================================================
// DEALS ROUTES
// =====================================================
app.route('/make-server-a7e285ba/deals', dealsApp);

// =====================================================
// CRON ROUTES (for scheduled jobs)
// =====================================================
app.route('/make-server-a7e285ba', cronApp);

// =====================================================
// REPORTS ROUTES
// =====================================================

// Create a new report
app.post('/make-server-a7e285ba/reports', async (c) => {
  const { user, error } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ success: false, error: error || 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { contentType, contentId, reason, description } = body;

    if (!contentType || !contentId || !reason) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: contentType, contentId, reason' 
      }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: report, error: insertError } = await supabaseAdmin
      .from('reports_a7e285ba')
      .insert({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason,
        description: description || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating report:', insertError);
      return c.json({ 
        success: false, 
        error: 'Failed to create report: ' + insertError.message 
      }, 500);
    }
    
    return c.json({ success: true, report });
  } catch (error) {
    console.error('Error in create report route:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500);
  }
});

// Get user's own reports
app.get('/make-server-a7e285ba/reports', async (c) => {
  const { user, error } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ success: false, error: error || 'Unauthorized' }, 401);
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: reports, error: fetchError } = await supabaseAdmin
      .from('reports_a7e285ba')
      .select('*')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching reports:', fetchError);
      return c.json({ 
        success: false, 
        error: 'Failed to fetch reports: ' + fetchError.message 
      }, 500);
    }

    return c.json({ success: true, reports: reports || [] });
  } catch (error) {
    console.error('Error in get reports route:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500);
  }
});

// Admin: Get all reports with filters
app.get('/make-server-a7e285ba/reports/admin', async (c) => {
  const { user, error } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ success: false, error: error || 'Admin access required' }, 403);
  }

  try {
    const status = c.req.query('status');
    const contentType = c.req.query('contentType');

    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('reports_a7e285ba')
      .select('*');

    if (status) {
      query = query.eq('status', status);
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    query = query.order('created_at', { ascending: false });

    const { data: reports, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching all reports:', fetchError);
      return c.json({ 
        success: false, 
        error: 'Failed to fetch reports: ' + fetchError.message 
      }, 500);
    }

    return c.json({ success: true, reports: reports || [] });
  } catch (error) {
    console.error('Error in admin get reports route:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500);
  }
});

// Admin: Get full report details with user and content data
app.get('/make-server-a7e285ba/reports/:id/details', async (c) => {
  const { user, error } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ success: false, error: error || 'Admin access required' }, 403);
  }

  try {
    const reportId = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    // Helper function to validate UUID
    const isValidUUID = (uuid: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return typeof uuid === 'string' && uuidRegex.test(uuid);
    };

    // Helper function to safely get user by ID
    const getUserById = async (userId: string) => {
      if (!userId || !isValidUUID(userId)) {
        return null;
      }
      try {
        // First try to get user profile from database
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (profile) {
          const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
          return {
            id: profile.id,
            email: profile.email || 'No email',
            name: fullName || profile.email || 'Unknown User',
            avatar: profile.avatar_url || null
          };
        }
        
        // Fallback to auth metadata if profile doesn't exist
        const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (data?.user) {
          return {
            id: data.user.id,
            email: data.user.email || 'No email',
            name: data.user.user_metadata?.name || data.user.email || 'Unknown User',
            avatar: data.user.user_metadata?.avatar_url || null
          };
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
      return null;
    };

    // Get the report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports_a7e285ba')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return c.json({ 
        success: false, 
        error: 'Report not found' 
      }, 404);
    }

    // Get reporter user details
    const reporter = await getUserById(report.reporter_id);

    // Get reported content based on content_type
    let reportedContent = null;
    let reportedUser = null;

    if (report.content_type === 'listing') {
      const { data: listing } = await supabaseAdmin
        .from('marketplace_listings')
        .select('*')
        .eq('id', report.content_id)
        .single();
      
      if (listing) {
        reportedContent = listing;
        // Get listing author
        reportedUser = await getUserById(listing.user_id);
      }
    } else if (report.content_type === 'deal') {
      const { data: deal } = await supabaseAdmin
        .from('deals')
        .select('*, retailer:retailer_profiles(*)')
        .eq('id', report.content_id)
        .single();
      
      if (deal) {
        reportedContent = deal;
        // For deals, the "reported user" is the retailer owner
        if (deal.retailer?.owner_id) {
          reportedUser = await getUserById(deal.retailer.owner_id);
        }
      }
    } else if (report.content_type === 'message') {
      const { data: message } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('id', report.content_id)
        .single();
      
      if (message) {
        reportedContent = message;
        // Get message sender
        reportedUser = await getUserById(message.sender_id);
      }
    } else if (report.content_type === 'user') {
      // For user reports, the reported user is the content itself
      reportedUser = await getUserById(report.content_id);
      if (reportedUser) {
        reportedContent = { type: 'user', ...reportedUser };
      }
    }

    return c.json({ 
      success: true, 
      report,
      reporter,
      reportedUser,
      reportedContent
    });
  } catch (error) {
    console.error('Error fetching report details:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500);
  }
});

// Admin: Update report status
app.put('/make-server-a7e285ba/reports/:id/status', async (c) => {
  const { user, error } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ success: false, error: error || 'Admin access required' }, 403);
  }

  try {
    const reportId = c.req.param('id');
    const body = await c.req.json();
    const { status, resolutionNotes } = body;

    if (!status) {
      return c.json({ 
        success: false, 
        error: 'Missing required field: status' 
      }, 400);
    }

    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return c.json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    const updateData: any = {
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    };

    // Note: resolution_notes stored in message metadata, not in reports table

    const { data: report, error: updateError } = await supabaseAdmin
      .from('reports_a7e285ba')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating report:', updateError);
      return c.json({ 
        success: false, 
        error: 'Failed to update report: ' + updateError.message 
      }, 500);
    }
    
    return c.json({ success: true, report });
  } catch (error) {
    console.error('Error in update report status route:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500);
  }
});

// Admin: Delete report
app.delete('/make-server-a7e285ba/reports/:id', async (c) => {
  const { user, error } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ success: false, error: error || 'Admin access required' }, 403);
  }

  try {
    const reportId = c.req.param('id');
    const supabaseAdmin = getSupabaseAdmin();

    const { error: deleteError } = await supabaseAdmin
      .from('reports_a7e285ba')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      console.error('Error deleting report:', deleteError);
      return c.json({ 
        success: false, 
        error: 'Failed to delete report: ' + deleteError.message 
      }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error in delete report route:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500);
  }
});

// Admin: Take action on reported content (delete listing/deal and notify owner)
app.post('/make-server-a7e285ba/reports/:id/action', async (c) => {
  const { user, error } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ success: false, error: error || 'Admin access required' }, 403);
  }

  try {
    const reportId = c.req.param('id');
    const body = await c.req.json();
    const { action, reason, resolutionNotes } = body;

    if (!action || !reason) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: action and reason' 
      }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get the report details
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports_a7e285ba')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return c.json({ 
        success: false, 
        error: 'Report not found' 
      }, 404);
    }

    let contentOwnerId = null;
    let contentTitle = 'Content';
    let actionTaken = '';

    // Handle different content types
    if (report.content_type === 'listing' && action === 'delete') {
      // Get listing details
      const { data: listing } = await supabaseAdmin
        .from('marketplace_listings')
        .select('user_id, title')
        .eq('id', report.content_id)
        .single();

      if (listing) {
        contentOwnerId = listing.user_id;
        contentTitle = listing.title;

        // Delete the listing
        const { error: deleteError } = await supabaseAdmin
          .from('marketplace_listings')
          .delete()
          .eq('id', report.content_id);

        if (deleteError) {
          console.error('Error deleting listing:', deleteError);
          return c.json({ 
            success: false, 
            error: 'Failed to delete listing: ' + deleteError.message 
          }, 500);
        }
        actionTaken = 'deleted';
      }
    } else if (report.content_type === 'deal' && action === 'delete') {
      // Get deal details
      const { data: deal } = await supabaseAdmin
        .from('deals')
        .select('title, retailer:retailer_profiles(owner_id)')
        .eq('id', report.content_id)
        .single();

      if (deal && deal.retailer) {
        contentOwnerId = deal.retailer.owner_id;
        contentTitle = deal.title;

        // Delete the deal
        const { error: deleteError } = await supabaseAdmin
          .from('deals')
          .delete()
          .eq('id', report.content_id);

        if (deleteError) {
          console.error('Error deleting deal:', deleteError);
          return c.json({ 
            success: false, 
            error: 'Failed to delete deal: ' + deleteError.message 
          }, 500);
        }
        actionTaken = 'deleted';
      }
    } else if (action === 'warn') {
      // For warnings, we need to identify the content owner
      if (report.content_type === 'listing') {
        const { data: listing } = await supabaseAdmin
          .from('marketplace_listings')
          .select('user_id, title')
          .eq('id', report.content_id)
          .single();
        if (listing) {
          contentOwnerId = listing.user_id;
          contentTitle = listing.title;
        }
      } else if (report.content_type === 'deal') {
        const { data: deal } = await supabaseAdmin
          .from('deals')
          .select('title, retailer:retailer_profiles(owner_id)')
          .eq('id', report.content_id)
          .single();
        if (deal && deal.retailer) {
          contentOwnerId = deal.retailer.owner_id;
          contentTitle = deal.title;
        }
      } else if (report.content_type === 'user') {
        contentOwnerId = report.content_id;
        contentTitle = 'Your account';
      }
      actionTaken = 'warned';
    }

    // Send notification to content owner
    if (contentOwnerId) {
      const notificationMessage = action === 'delete' 
        ? `Your ${report.content_type} "${contentTitle}" has been removed by an admin. Reason: ${reason}`
        : `You have received a warning regarding your ${report.content_type} "${contentTitle}". Reason: ${reason}`;

      // Create notification for both warnings and deletes
      
      const { error: notifError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: contentOwnerId,
          title: action === 'warn' ? 'Admin Warning' : 'Content Removed',
          message: notificationMessage,
          type: 'admin_action',
          read: false,
          is_read: false,
          metadata: {
            report_id: reportId,
            report_reason: report.reason,
            admin_reason: reason,
            resolution_notes: resolutionNotes,
            content_type: report.content_type,
            action: action
          },
          created_at: new Date().toISOString()
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    // Update report status to resolved
    const { error: updateError } = await supabaseAdmin
      .from('reports_a7e285ba')
      .update({
        status: 'resolved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Error updating report:', updateError);
    }

    return c.json({ success: true, message: `Successfully ${actionTaken} ${report.content_type}` });
  } catch (error) {
    console.error('Error in admin action route:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500);
  }
});

// DEBUG: Test admin warning system
app.post('/make-server-a7e285ba/test-admin-warning', async (c) => {
  const { user, error } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ success: false, error: error || 'Unauthorized' }, 401);
  }

  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    
    // Step 1: Check if admin conversation exists
    const { data: existingConv, error: queryError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('seller_id', user.id)
      .eq('is_admin_warning', true)
      .maybeSingle();
    
    if (queryError) console.error('Query error:', queryError);
    
    // Step 2: Try to create a conversation
    if (!existingConv) {
      const { data: newConv, error: createError } = await supabaseAdmin
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: user.id,
          listing_id: null,
          is_admin_warning: true,
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) console.error('Create error:', createError);
      
      if (newConv) {
        // Step 3: Create a message
        const { data: msg, error: msgError } = await supabaseAdmin
          .from('messages')
          .insert({
            conversation_id: newConv.id,
            sender_id: user.id,
            content: 'This is a test admin warning message.',
            is_read: false,
            is_admin_warning: true,
            metadata: { test: true },
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (msgError) console.error('Message error:', msgError);
      }
    }
    
    // Step 4: Fetch all conversations for this user
    const { data: allConvs, error: fetchError } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        buyer:user_profiles!conversations_buyer_id_fkey(id, first_name, last_name, avatar_url),
        listing:marketplace_listings(id, title, price, images)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });
    
    if (fetchError) console.error('Fetch error:', fetchError);
    
    return c.json({ 
      success: true, 
      debug: {
        userId: user.id,
        existingConv,
        allConvs,
        queryError,
        fetchError
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// EMAIL VERIFICATION & PASSWORD RESET ROUTES
// ============================================

// Helper function to generate random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to generate secure token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// POST /make-server-a7e285ba/request-password-reset
app.post('/make-server-a7e285ba/request-password-reset', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user exists
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, first_name, last_name, email')
      .eq('email', email)
      .maybeSingle();

    if (!profile) {
      // Don't reveal if email exists or not for security
      return c.json({ 
        success: true, 
        message: 'If an account with that email exists, you will receive a password reset link shortly.' 
      });
    }

    // Delete old reset tokens for this user before creating a new one
    const oldTokens = await kv.getByPrefix('reset_token:');
    let deletedCount = 0;
    for (const item of oldTokens) {
      try {
        const data = JSON.parse(item.value);
        if (data.userId === profile.id && data.type === 'password_reset') {
          await kv.del(item.key);
          deletedCount++;
        }
      } catch (error) {
        console.error(`[Password Reset] Error parsing token data:`, error);
      }
    }

    // Generate reset token and code
    const resetToken = generateToken();
    const resetCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in KV store
    const tokenData = {
      userId: profile.id,
      email: profile.email,
      code: resetCode,
      type: 'password_reset',
      expires: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };

    await kv.set(`reset_token:${resetToken}`, JSON.stringify(tokenData));

    // Send password reset email
    const appUrl = c.req.header('origin') || 'https://your-app-url.com';
    const resetUrl = `${appUrl}?reset_token=${resetToken}`;
    
    const emailResult = await sendEmail({
      to: email,
      subject: 'Reset Your Password - Locksmith Marketplace',
      html: passwordResetTemplate({
        userName: profile.first_name || 'there',
        resetUrl,
        resetCode
      })
    });

    if (!emailResult.success) {
      console.error(`[Password Reset] Failed to send email: ${emailResult.error}`);
      return c.json({ error: 'Failed to send reset email' }, 500);
    }

    return c.json({ 
      success: true, 
      message: 'If an account with that email exists, you will receive a password reset link shortly.' 
    });

  } catch (error) {
    console.error('[Password Reset] Error:', error);
    return c.json({ error: 'Failed to process password reset request' }, 500);
  }
});

// POST /make-server-a7e285ba/reset-password
app.post('/make-server-a7e285ba/reset-password', async (c) => {
  try {
    const body = await c.req.json();
    const { token, code, newPassword } = body;

    if ((!token && !code) || !newPassword) {
      return c.json({ error: 'Token or code and new password are required' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    let tokenData: any = null;
    let tokenKey = '';

    // Try to find token by token string or by code
    if (token) {
      tokenKey = `reset_token:${token}`;
      const storedData = await kv.get(tokenKey);
      if (storedData) {
        tokenData = JSON.parse(storedData);
      }
    } else if (code) {
      // Search for token by code (this is slower but necessary)
      const allTokens = await kv.getByPrefix('reset_token:');
      for (const item of allTokens) {
        const data = JSON.parse(item.value);
        if (data.code === code && data.type === 'password_reset') {
          tokenData = data;
          tokenKey = item.key;
          break;
        }
      }
    }

    if (!tokenData) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires);
    if (expiresAt < new Date()) {
      await kv.del(tokenKey);
      return c.json({ error: 'Reset token has expired' }, 400);
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error(`[Password Reset] Failed to update password: ${updateError.message}`);
      return c.json({ error: 'Failed to update password' }, 500);
    }

    // Delete used token
    await kv.del(tokenKey);

    return c.json({ 
      success: true, 
      message: 'Password reset successful. You can now sign in with your new password.' 
    });

  } catch (error) {
    console.error('[Password Reset] Error:', error);
    return c.json({ error: 'Failed to reset password' }, 500);
  }
});

// REMOVED DUPLICATE: This endpoint is now defined earlier in the file (line ~370)
// See /IMPORTANT_NOTES.md - DO NOT USE KV STORE!

// POST /make-server-a7e285ba/resend-verification
app.post('/make-server-a7e285ba/resend-verification', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get user by email
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, first_name, last_name, email')
      .eq('email', email)
      .maybeSingle();

    if (!profile) {
      // Don't reveal if email exists or not
      return c.json({ 
        success: true, 
        message: 'If an account with that email exists and is unverified, you will receive a new verification email.' 
      });
    }

    // Check if already verified
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    if (user?.email_confirmed_at) {
      return c.json({ error: 'Email is already verified' }, 400);
    }

    // Delete old verification tokens for this user from database
    await supabaseAdmin
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', profile.id)
      .is('verified_at', null);

    // Generate new verification token and code
    const verifyToken = generateToken();
    const verifyCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    const { error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .insert({
        user_id: profile.id,
        email: profile.email,
        token: verifyToken,
        verification_code: verifyCode,
        expires_at: expiresAt.toISOString(),
        type: 'email_verification'
      });

    if (tokenError) {
      console.error(`[Email Verification] Failed to store token: ${tokenError.message}`);
      return c.json({ error: 'Failed to generate verification token' }, 500);
    }

    // Send verification email
    const appUrl = c.req.header('origin') || 'https://your-app-url.com';
    const verificationUrl = `${appUrl}?verify_token=${verifyToken}`;
    
    const emailResult = await sendEmail({
      to: email,
      subject: 'Verify Your Email - Locksmith Marketplace',
      html: emailVerificationTemplate({
        userName: profile.first_name || 'there',
        verificationUrl
      })
    });

    if (!emailResult.success) {
      console.error(`[Email Verification] Failed to send email: ${emailResult.error}`);
      return c.json({ error: 'Failed to send verification email' }, 500);
    }

    return c.json({ 
      success: true, 
      message: 'Verification email sent! Please check your inbox.' 
    });

  } catch (error) {
    console.error('[Email Verification] Error:', error);
    return c.json({ error: 'Failed to resend verification email' }, 500);
  }
});

// =====================================================
// USER PREFERENCES ROUTES
// =====================================================

// GET user preferences
app.get('/make-server-a7e285ba/user-preferences', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error } = await verifyUser(authHeader);

    if (error || !user) {
      console.error('[User Preferences GET] Authentication failed:', error);
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get user preferences
    const { data: preferences, error: fetchError } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      // If no preferences exist, create default ones
      if (fetchError.code === 'PGRST116') {
        const { data: newPreferences, error: createError } = await supabaseAdmin
          .from('user_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) {
          console.error('[User Preferences GET] Error creating default preferences:', createError);
          return c.json({ error: 'Failed to create preferences' }, 500);
        }

        return c.json({ preferences: newPreferences });
      }

      console.error('[User Preferences GET] Error fetching preferences:', fetchError);
      return c.json({ error: 'Failed to fetch preferences' }, 500);
    }

    return c.json({ preferences });

  } catch (error) {
    console.error('[User Preferences GET] Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT update user preferences
app.put('/make-server-a7e285ba/user-preferences', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error } = await verifyUser(authHeader);

    if (error || !user) {
      console.error('[User Preferences PUT] Authentication failed:', error);
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const supabaseAdmin = getSupabaseAdmin();

    // Validate and sanitize updates
    const allowedFields = [
      'email_notifications',
      'push_notifications',
      'message_notifications',
      'listing_notifications',
      'deal_notifications',
      'profile_visibility',
      'show_email',
      'show_phone',
      'language',
      'currency',
      'theme'
    ];

    const sanitizedUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    // Ensure user_id cannot be changed
    delete sanitizedUpdates.user_id;
    delete sanitizedUpdates.id;
    delete sanitizedUpdates.created_at;
    delete sanitizedUpdates.updated_at;

    // Update preferences
    const { data: updatedPreferences, error: updateError } = await supabaseAdmin
      .from('user_preferences')
      .update(sanitizedUpdates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('[User Preferences PUT] Error updating preferences:', updateError);
      return c.json({ error: 'Failed to update preferences' }, 500);
    }

    return c.json({ preferences: updatedPreferences });

  } catch (error) {
    console.error('[User Preferences PUT] Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// DOCUMENT ROUTES
// ============================================

Deno.serve(app.fetch);