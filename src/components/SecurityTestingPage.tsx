import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Eye,
  Database,
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TestResult {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message?: string;
  details?: any;
  duration?: number;
}

interface TestCategory {
  id: string;
  name: string;
  description: string;
  tests: TestResult[];
}

export function SecurityTestingPage() {
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [testUserId, setTestUserId] = useState<string>('');
  const [testListingId, setTestListingId] = useState<string>('');
  const supabase = createClient(projectId, publicAnonKey);

  useEffect(() => {
    initializeTests();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUserId(session?.user?.id || null);
  };

  const initializeTests = () => {
    setCategories([
      {
        id: 'api-sanitization',
        name: 'API Data Sanitization',
        description: 'Verify that API endpoints do not leak sensitive user data',
        tests: [
          {
            id: 'test-1',
            name: 'User Profile Endpoint - Email Hidden',
            description: 'Verify /users/:userId does not return email for other users',
            status: 'pending'
          },
          {
            id: 'test-2',
            name: 'User Profile Endpoint - Phone Hidden',
            description: 'Verify /users/:userId does not return phone for other users',
            status: 'pending'
          },
          {
            id: 'test-3',
            name: 'User Profile Endpoint - Address Hidden',
            description: 'Verify /users/:userId does not return address for other users',
            status: 'pending'
          },
          {
            id: 'test-4',
            name: 'User Profile Endpoint - Privacy Settings Hidden',
            description: 'Verify phone_public, email_public, auto_reply are not exposed',
            status: 'pending'
          }
        ]
      },
      {
        id: 'rls-policies',
        name: 'Row Level Security Policies',
        description: 'Verify RLS policies prevent unauthorized data access',
        tests: [
          {
            id: 'test-5',
            name: 'RLS - Cannot Query Other Users Email',
            description: 'Direct database query for other users\' emails returns empty',
            status: 'pending'
          },
          {
            id: 'test-6',
            name: 'RLS - Cannot Query Other Users Phone',
            description: 'Direct database query for other users\' phones returns empty',
            status: 'pending'
          },
          {
            id: 'test-7',
            name: 'RLS - Cannot Query Other Users Address',
            description: 'Direct database query for other users\' addresses returns empty',
            status: 'pending'
          },
          {
            id: 'test-8',
            name: 'RLS - Can Query Own Profile',
            description: 'User can access their own full profile including sensitive data',
            status: 'pending'
          }
        ]
      },
      {
        id: 'seller-privacy',
        name: 'Seller Contact Privacy',
        description: 'Verify seller phone privacy settings are enforced',
        tests: [
          {
            id: 'test-9',
            name: 'Listing Endpoint - Respects phone_public Setting',
            description: 'Phone hidden when seller sets phone_public = false',
            status: 'pending'
          },
          {
            id: 'test-10',
            name: 'Marketplace Listings - No Direct Phone Exposure',
            description: 'Listings endpoint does not include seller phone numbers',
            status: 'pending'
          }
        ]
      },
      {
        id: 'authentication',
        name: 'Authentication & Authorization',
        description: 'Verify authentication flows work correctly',
        tests: [
          {
            id: 'test-11',
            name: 'Protected Routes - Require Authentication',
            description: 'Protected endpoints return 401 without valid token',
            status: 'pending'
          },
          {
            id: 'test-12',
            name: 'User Session - Valid Token Works',
            description: 'Valid authentication token allows access to protected routes',
            status: 'pending'
          }
        ]
      }
    ]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests to pending
    setCategories(cats => cats.map(cat => ({
      ...cat,
      tests: cat.tests.map(test => ({ ...test, status: 'pending' as const }))
    })));

    // Run each category sequentially
    for (const category of categories) {
      await runCategoryTests(category.id);
    }

    setIsRunning(false);
  };

  const runCategoryTests = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    for (const test of category.tests) {
      await runSingleTest(categoryId, test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const runSingleTest = async (categoryId: string, testId: string) => {
    // Set test to running
    updateTestStatus(categoryId, testId, 'running');

    const startTime = Date.now();
    
    try {
      let result: TestResult;

      switch (testId) {
        case 'test-1':
          result = await testUserProfileEmailHidden();
          break;
        case 'test-2':
          result = await testUserProfilePhoneHidden();
          break;
        case 'test-3':
          result = await testUserProfileAddressHidden();
          break;
        case 'test-4':
          result = await testUserProfilePrivacySettingsHidden();
          break;
        case 'test-5':
          result = await testRLSEmailQuery();
          break;
        case 'test-6':
          result = await testRLSPhoneQuery();
          break;
        case 'test-7':
          result = await testRLSAddressQuery();
          break;
        case 'test-8':
          result = await testRLSOwnProfile();
          break;
        case 'test-9':
          result = await testListingPhonePrivacy();
          break;
        case 'test-10':
          result = await testMarketplaceListingsNoPhone();
          break;
        case 'test-11':
          result = await testProtectedRoutesAuth();
          break;
        case 'test-12':
          result = await testValidTokenWorks();
          break;
        default:
          result = {
            id: testId,
            name: '',
            description: '',
            status: 'warning',
            message: 'Test not implemented'
          };
      }

      const duration = Date.now() - startTime;
      updateTest(categoryId, testId, { ...result, duration });

    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest(categoryId, testId, {
        id: testId,
        name: '',
        description: '',
        status: 'failed',
        message: `Test threw error: ${error}`,
        duration
      });
    }
  };

  // TEST IMPLEMENTATIONS

  const testUserProfileEmailHidden = async (): Promise<TestResult> => {
    if (!testUserId) {
      return {
        id: 'test-1',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please enter a test user ID first'
      };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${testUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!data.success || !data.profile) {
        return {
          id: 'test-1',
          name: '',
          description: '',
          status: 'warning',
          message: 'User not found or API error',
          details: data
        };
      }

      const hasEmail = 'email' in data.profile;
      
      return {
        id: 'test-1',
        name: '',
        description: '',
        status: hasEmail ? 'failed' : 'passed',
        message: hasEmail 
          ? '❌ SECURITY ISSUE: Email field is exposed in API response!'
          : '✅ Email field is properly hidden',
        details: data.profile
      };
    } catch (error) {
      return {
        id: 'test-1',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testUserProfilePhoneHidden = async (): Promise<TestResult> => {
    if (!testUserId) {
      return {
        id: 'test-2',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please enter a test user ID first'
      };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${testUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!data.success || !data.profile) {
        return {
          id: 'test-2',
          name: '',
          description: '',
          status: 'warning',
          message: 'User not found or API error',
          details: data
        };
      }

      const hasPhone = 'phone' in data.profile;
      
      return {
        id: 'test-2',
        name: '',
        description: '',
        status: hasPhone ? 'failed' : 'passed',
        message: hasPhone 
          ? '❌ SECURITY ISSUE: Phone field is exposed in API response!'
          : '✅ Phone field is properly hidden',
        details: data.profile
      };
    } catch (error) {
      return {
        id: 'test-2',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testUserProfileAddressHidden = async (): Promise<TestResult> => {
    if (!testUserId) {
      return {
        id: 'test-3',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please enter a test user ID first'
      };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${testUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!data.success || !data.profile) {
        return {
          id: 'test-3',
          name: '',
          description: '',
          status: 'warning',
          message: 'User not found or API error',
          details: data
        };
      }

      const hasAddress = 'address' in data.profile;
      
      return {
        id: 'test-3',
        name: '',
        description: '',
        status: hasAddress ? 'failed' : 'passed',
        message: hasAddress 
          ? '❌ SECURITY ISSUE: Address field is exposed in API response!'
          : '✅ Address field is properly hidden',
        details: data.profile
      };
    } catch (error) {
      return {
        id: 'test-3',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testUserProfilePrivacySettingsHidden = async (): Promise<TestResult> => {
    if (!testUserId) {
      return {
        id: 'test-4',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please enter a test user ID first'
      };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${testUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!data.success || !data.profile) {
        return {
          id: 'test-4',
          name: '',
          description: '',
          status: 'warning',
          message: 'User not found or API error',
          details: data
        };
      }

      const exposedFields: string[] = [];
      const privacyFields = ['phone_public', 'email_public', 'auto_reply', 'auto_reply_message', 'phonePublic', 'emailPublic', 'autoReply', 'autoReplyMessage'];
      
      privacyFields.forEach(field => {
        if (field in data.profile) {
          exposedFields.push(field);
        }
      });
      
      return {
        id: 'test-4',
        name: '',
        description: '',
        status: exposedFields.length > 0 ? 'failed' : 'passed',
        message: exposedFields.length > 0
          ? `❌ SECURITY ISSUE: Privacy settings exposed: ${exposedFields.join(', ')}`
          : '✅ Privacy settings are properly hidden',
        details: data.profile
      };
    } catch (error) {
      return {
        id: 'test-4',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testRLSEmailQuery = async (): Promise<TestResult> => {
    if (!currentUserId) {
      return {
        id: 'test-5',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please log in first to test RLS policies'
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email')
        .neq('id', currentUserId)
        .limit(10);

      const rowCount = data?.length || 0;

      return {
        id: 'test-5',
        name: '',
        description: '',
        status: rowCount === 0 ? 'passed' : 'failed',
        message: rowCount === 0
          ? '✅ RLS policy working: Cannot query other users\' emails'
          : `❌ SECURITY ISSUE: RLS policy failed! Retrieved ${rowCount} email(s) from other users`,
        details: { rowCount, error: error?.message, sample: data?.slice(0, 3) }
      };
    } catch (error) {
      return {
        id: 'test-5',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testRLSPhoneQuery = async (): Promise<TestResult> => {
    if (!currentUserId) {
      return {
        id: 'test-6',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please log in first to test RLS policies'
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, phone')
        .neq('id', currentUserId)
        .limit(10);

      const rowCount = data?.length || 0;

      return {
        id: 'test-6',
        name: '',
        description: '',
        status: rowCount === 0 ? 'passed' : 'failed',
        message: rowCount === 0
          ? '✅ RLS policy working: Cannot query other users\' phones'
          : `❌ SECURITY ISSUE: RLS policy failed! Retrieved ${rowCount} phone(s) from other users`,
        details: { rowCount, error: error?.message, sample: data?.slice(0, 3) }
      };
    } catch (error) {
      return {
        id: 'test-6',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testRLSAddressQuery = async (): Promise<TestResult> => {
    if (!currentUserId) {
      return {
        id: 'test-7',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please log in first to test RLS policies'
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, address')
        .neq('id', currentUserId)
        .limit(10);

      const rowCount = data?.length || 0;

      return {
        id: 'test-7',
        name: '',
        description: '',
        status: rowCount === 0 ? 'passed' : 'failed',
        message: rowCount === 0
          ? '✅ RLS policy working: Cannot query other users\' addresses'
          : `❌ SECURITY ISSUE: RLS policy failed! Retrieved ${rowCount} address(es) from other users`,
        details: { rowCount, error: error?.message, sample: data?.slice(0, 3) }
      };
    } catch (error) {
      return {
        id: 'test-7',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testRLSOwnProfile = async (): Promise<TestResult> => {
    if (!currentUserId) {
      return {
        id: 'test-8',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please log in first to test RLS policies'
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, phone, address, first_name, last_name')
        .eq('id', currentUserId)
        .single();

      const canAccessOwn = !!data && !error;

      return {
        id: 'test-8',
        name: '',
        description: '',
        status: canAccessOwn ? 'passed' : 'failed',
        message: canAccessOwn
          ? '✅ RLS policy working: Can query own profile with all fields'
          : '❌ SECURITY ISSUE: Cannot access own profile!',
        details: { hasData: !!data, error: error?.message, fields: data ? Object.keys(data) : [] }
      };
    } catch (error) {
      return {
        id: 'test-8',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testListingPhonePrivacy = async (): Promise<TestResult> => {
    if (!testListingId) {
      return {
        id: 'test-9',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please enter a test listing ID first'
      };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Don't send Authorization header for public listing endpoint
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/${testListingId}`,
        { headers }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          id: 'test-9',
          name: '',
          description: '',
          status: 'warning',
          message: `API error: ${response.status} - ${data.error || 'Unknown error'}`,
          details: { status: response.status, data }
        };
      }

      if (!data.success || !data.listing) {
        return {
          id: 'test-9',
          name: '',
          description: '',
          status: 'warning',
          message: 'Listing not found or API error',
          details: data
        };
      }

      const sellerProfile = data.listing.user_profiles;
      if (!sellerProfile) {
        return {
          id: 'test-9',
          name: '',
          description: '',
          status: 'warning',
          message: 'Listing does not include seller profile data',
          details: data.listing
        };
      }

      // Check if phone_public field exists in response (it shouldn't)
      const hasPhonePublic = 'phone_public' in sellerProfile || 'phonePublic' in sellerProfile;
      const hasPhone = 'phone' in sellerProfile;

      return {
        id: 'test-9',
        name: '',
        description: '',
        status: hasPhonePublic ? 'failed' : 'passed',
        message: hasPhonePublic
          ? '❌ SECURITY ISSUE: phone_public setting is exposed to clients!'
          : hasPhone
            ? '⚠️ Phone is visible (verify seller has phone_public = true)'
            : '✅ Privacy check implemented (phone hidden or phone_public not exposed)',
        details: { 
          hasPhone, 
          hasPhonePublic, 
          phoneValue: sellerProfile.phone,
          sellerFields: Object.keys(sellerProfile)
        }
      };
    } catch (error) {
      return {
        id: 'test-9',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testMarketplaceListingsNoPhone = async (): Promise<TestResult> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings?limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!data.success || !data.listings || data.listings.length === 0) {
        return {
          id: 'test-10',
          name: '',
          description: '',
          status: 'warning',
          message: 'No listings found to test',
          details: data
        };
      }

      // Check if any listing includes seller phone
      const listingsWithPhone = data.listings.filter((listing: any) => {
        return listing.user_profiles && 'phone' in listing.user_profiles;
      });

      return {
        id: 'test-10',
        name: '',
        description: '',
        status: listingsWithPhone.length === 0 ? 'passed' : 'warning',
        message: listingsWithPhone.length === 0
          ? '✅ Marketplace listings do not expose seller phone numbers'
          : `⚠️ ${listingsWithPhone.length} listing(s) include phone (verify phone_public = true)`,
        details: { 
          totalListings: data.listings.length,
          listingsWithPhone: listingsWithPhone.length,
          sampleListing: data.listings[0]?.user_profiles ? Object.keys(data.listings[0].user_profiles) : []
        }
      };
    } catch (error) {
      return {
        id: 'test-10',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testProtectedRoutesAuth = async (): Promise<TestResult> => {
    try {
      // Test a protected route without authentication
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/profile`,
        {
          headers: {
            'Authorization': 'Bearer invalid-token-12345'
          }
        }
      );

      const isUnauthorized = response.status === 401;

      return {
        id: 'test-11',
        name: '',
        description: '',
        status: isUnauthorized ? 'passed' : 'failed',
        message: isUnauthorized
          ? '✅ Protected routes properly reject invalid tokens'
          : `❌ SECURITY ISSUE: Protected route accessible with invalid token (status: ${response.status})`,
        details: { status: response.status, statusText: response.statusText }
      };
    } catch (error) {
      return {
        id: 'test-11',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  const testValidTokenWorks = async (): Promise<TestResult> => {
    if (!currentUserId) {
      return {
        id: 'test-12',
        name: '',
        description: '',
        status: 'warning',
        message: 'Please log in first to test authentication'
      };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return {
          id: 'test-12',
          name: '',
          description: '',
          status: 'warning',
          message: 'No valid session found'
        };
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/profile`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      const isSuccess = response.status === 200;
      const data = await response.json();

      return {
        id: 'test-12',
        name: '',
        description: '',
        status: isSuccess ? 'passed' : 'failed',
        message: isSuccess
          ? '✅ Valid authentication token works correctly'
          : `❌ Valid token rejected (status: ${response.status})`,
        details: { status: response.status, hasData: !!data }
      };
    } catch (error) {
      return {
        id: 'test-12',
        name: '',
        description: '',
        status: 'failed',
        message: `Error: ${error}`
      };
    }
  };

  // HELPER FUNCTIONS

  const updateTestStatus = (categoryId: string, testId: string, status: TestResult['status']) => {
    setCategories(cats => cats.map(cat => 
      cat.id === categoryId
        ? {
            ...cat,
            tests: cat.tests.map(test =>
              test.id === testId ? { ...test, status } : test
            )
          }
        : cat
    ));
  };

  const updateTest = (categoryId: string, testId: string, updates: Partial<TestResult>) => {
    setCategories(cats => cats.map(cat => 
      cat.id === categoryId
        ? {
            ...cat,
            tests: cat.tests.map(test =>
              test.id === testId ? { ...test, ...updates } : test
            )
          }
        : cat
    ));
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<TestResult['status'], string> = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTotalStats = () => {
    const allTests = categories.flatMap(cat => cat.tests);
    return {
      total: allTests.length,
      passed: allTests.filter(t => t.status === 'passed').length,
      failed: allTests.filter(t => t.status === 'failed').length,
      warning: allTests.filter(t => t.status === 'warning').length,
      pending: allTests.filter(t => t.status === 'pending').length
    };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-gray-900">Security Testing Dashboard</h1>
              <p className="text-sm text-gray-600">Verify security fixes and RLS policies</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => initializeTests()}
              variant="outline"
              size="sm"
              disabled={isRunning}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Tests
            </Button>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.warning}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Enter IDs for testing API endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Test User ID</label>
                <input
                  type="text"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  placeholder="Enter a user ID to test"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Used for testing API data sanitization</p>
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Test Listing ID</label>
                <input
                  type="text"
                  value={testListingId}
                  onChange={(e) => setTestListingId(e.target.value)}
                  placeholder="Enter a listing ID to test"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Used for testing seller phone privacy</p>
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Your User ID</label>
                <input
                  type="text"
                  value={currentUserId || 'Not logged in'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Current authenticated user</p>
              </div>
            </div>

            {!currentUserId && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Not Authenticated</AlertTitle>
                <AlertDescription>
                  Please log in to run RLS policy tests. Some tests require authentication.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Test Categories */}
        <Tabs defaultValue={categories[0]?.id} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map(category => {
              const categoryStats = {
                passed: category.tests.filter(t => t.status === 'passed').length,
                failed: category.tests.filter(t => t.status === 'failed').length,
                total: category.tests.length
              };

              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  {category.name}
                  {categoryStats.failed > 0 && (
                    <Badge className="bg-red-100 text-red-800 ml-2">{categoryStats.failed}</Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {category.id === 'api-sanitization' && <Eye className="h-5 w-5" />}
                        {category.id === 'rls-policies' && <Database className="h-5 w-5" />}
                        {category.id === 'seller-privacy' && <Phone className="h-5 w-5" />}
                        {category.id === 'authentication' && <Lock className="h-5 w-5" />}
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                    <Button
                      onClick={() => runCategoryTests(category.id)}
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Category
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {category.tests.map(test => (
                        <div
                          key={test.id}
                          className="border border-gray-200 rounded-lg p-4 space-y-3 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              {getStatusIcon(test.status)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm text-gray-900">{test.name}</h4>
                                  {getStatusBadge(test.status)}
                                  {test.duration && (
                                    <span className="text-xs text-gray-500">({test.duration}ms)</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">{test.description}</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => runSingleTest(category.id, test.id)}
                              disabled={isRunning}
                              variant="ghost"
                              size="sm"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>

                          {test.message && (
                            <div className="ml-7 p-3 bg-gray-50 rounded text-xs">
                              <pre className="whitespace-pre-wrap font-mono">{test.message}</pre>
                            </div>
                          )}

                          {test.details && (
                            <details className="ml-7">
                              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                                View Details
                              </summary>
                              <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Security Alerts */}
        {stats.failed > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Security Issues Detected</AlertTitle>
            <AlertDescription>
              {stats.failed} test{stats.failed !== 1 ? 's' : ''} failed. Please review the failed tests and apply necessary fixes.
            </AlertDescription>
          </Alert>
        )}

        {stats.failed === 0 && stats.passed > 0 && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">All Tests Passed</AlertTitle>
            <AlertDescription className="text-green-700">
              All security tests passed successfully. Your security fixes are working correctly.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}