import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { UserPreferencesService, UserPreferences } from "../utils/services/settings";
import { AuthService } from "../utils/auth";
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  User, 
  Globe, 
  CreditCard, 
  Smartphone,
  Mail,
  MessageCircle,
  Eye,
  Lock,
  Trash2,
  Download,
  HelpCircle,
  Loader2
} from "lucide-react";

interface SettingsPageProps {
  user: any;
  onBack: () => void;
  onUpdateUser: (userData: any) => void;
}

export function SettingsPage({ user, onBack, onUpdateUser }: SettingsPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [listingNotifications, setListingNotifications] = useState(true);
  const [dealNotifications, setDealNotifications] = useState(true);
  
  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'users' | 'private'>("public");
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  
  // Regional Preferences
  const [language, setLanguage] = useState<'en' | 'es' | 'fr' | 'de'>("en");
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'CAD'>("USD");
  
  // Appearance
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>("light");

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const token = await AuthService.getFreshToken();
      if (!token) {
        toast.error("Please sign in to access settings");
        onBack();
        return;
      }

      const preferences = await UserPreferencesService.getPreferences(token);
      
      // Update state with loaded preferences
      setEmailNotifications(preferences.email_notifications);
      setPushNotifications(preferences.push_notifications);
      setMessageNotifications(preferences.message_notifications);
      setListingNotifications(preferences.listing_notifications);
      setDealNotifications(preferences.deal_notifications);
      setProfileVisibility(preferences.profile_visibility);
      setShowEmail(preferences.show_email);
      setShowPhone(preferences.show_phone);
      setLanguage(preferences.language);
      setCurrency(preferences.currency);
      setTheme(preferences.theme);

      console.log("✅ User preferences loaded successfully");
    } catch (error: any) {
      console.error("❌ Error loading preferences:", error);
      toast.error(error.message || "Failed to load preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const token = await AuthService.getFreshToken();
      if (!token) {
        toast.error("Please sign in to save settings");
        return;
      }

      const updates: Partial<UserPreferences> = {
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        message_notifications: messageNotifications,
        listing_notifications: listingNotifications,
        deal_notifications: dealNotifications,
        profile_visibility: profileVisibility,
        show_email: showEmail,
        show_phone: showPhone,
        language: language,
        currency: currency,
        theme: theme,
      };

      await UserPreferencesService.updatePreferences(token, updates);
      
      console.log("✅ User preferences saved successfully");
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      console.error("❌ Error saving preferences:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // In a real app, this would delete the account
      console.log("Account deletion requested");
    }
  };

  const handleDownloadData = () => {
    // In a real app, this would trigger data export
    console.log("Data download requested");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading your preferences...</p>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive email updates about your activity</p>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">Get push notifications on your device</p>
                    </div>
                    <Switch 
                      checked={pushNotifications} 
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Message Notifications</Label>
                      <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                    </div>
                    <Switch 
                      checked={messageNotifications} 
                      onCheckedChange={setMessageNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Listing Notifications</Label>
                      <p className="text-sm text-gray-600">Get notified about your listing activity</p>
                    </div>
                    <Switch 
                      checked={listingNotifications} 
                      onCheckedChange={setListingNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Deal Notifications</Label>
                      <p className="text-sm text-gray-600">Get notified about deals and offers</p>
                    </div>
                    <Switch 
                      checked={dealNotifications} 
                      onCheckedChange={setDealNotifications}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end space-x-4">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}