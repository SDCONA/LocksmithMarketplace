import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { 
  Store, ArrowLeft, Edit2, Save, X, Globe, Mail, Phone, 
  Package, TrendingUp, Eye, Heart, AlertCircle, Tag, Upload, Image as ImageIcon
} from "lucide-react";
import { DealsService } from "../utils/services";

interface RetailerDashboardPageProps {
  user: any;
  onBack: () => void;
  onManageDeals: () => void;
}

export function RetailerDashboardPage({ user, onBack, onManageDeals }: RetailerDashboardPageProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await DealsService.getMyRetailerProfile();
      if (!data) {
        toast.error("You don't have a retailer profile");
        onBack();
        return;
      }
      setProfile(data);
      setEditForm({
        company_name: data.company_name,
        description: data.description || "",
        logo_url: data.logo_url || "",
        website_url: data.website_url || "",
        contact_email: data.contact_email || "",
        contact_phone: data.contact_phone || "",
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error(error.message || "Failed to load profile");
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      // Retailers can only update basic info (not limits, permissions, etc.)
      await DealsService.updateRetailerProfile(profile.id, {
        company_name: editForm.company_name,
        description: editForm.description,
        logo_url: editForm.logo_url,
        website_url: editForm.website_url,
        contact_email: editForm.contact_email,
        contact_phone: editForm.contact_phone,
      });
      
      await loadProfile();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      company_name: profile.company_name,
      description: profile.description || "",
      logo_url: profile.logo_url || "",
      website_url: profile.website_url || "",
      contact_email: profile.contact_email || "",
      contact_phone: profile.contact_phone || "",
    });
    setLogoPreview(null);
    setIsEditing(false);
  };

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);

    // Upload immediately
    setIsUploadingLogo(true);
    try {
      const updatedProfile = await DealsService.uploadRetailerLogo(profile.id, file);
      setProfile(updatedProfile);
      setEditForm({ ...editForm, logo_url: updatedProfile.logo_url });
      toast.success("Logo uploaded successfully!");
      // Reload the profile to get the latest data
      await loadProfile();
      setLogoPreview(null);
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error(error.message || "Failed to upload logo");
      setLogoPreview(null);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading retailer dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Calculate stats
  const totalDeals = profile.deals?.[0]?.count || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>

          <div className="flex items-start gap-4">
            <div className="relative group">
              {profile.logo_url ? (
                <img
                  src={logoPreview || profile.logo_url}
                  alt={profile.company_name}
                  className="w-20 h-20 rounded-lg object-cover bg-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-white/20 flex items-center justify-center">
                  <Store className="h-10 w-10 text-white" />
                </div>
              )}
              
              {/* Logo Upload Button */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileSelect}
                  disabled={isUploadingLogo}
                  className="hidden"
                />
                {isUploadingLogo ? (
                  <span className="text-white text-xs">Uploading...</span>
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </label>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Retailer Profile</h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {profile.is_active ? "Active" : "Paused"}
                </Badge>
                {profile.is_always_on_top && (
                  <Badge variant="secondary" className="bg-yellow-500 text-white">
                    Priority Retailer
                  </Badge>
                )}
                {profile.has_csv_permission && (
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    CSV Upload Enabled
                  </Badge>
                )}
              </div>
            </div>

            {!isEditing && (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{totalDeals}</div>
              <div className="text-sm text-gray-600">Total Deals</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Tag className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">
                {profile.daily_deal_limit === 0 ? "∞" : profile.daily_deal_limit}
              </div>
              <div className="text-sm text-gray-600">Daily Limit</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{profile.is_active ? "Active" : "Paused"}</div>
              <div className="text-sm text-gray-600">Status</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Store className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">
                {profile.is_always_on_top ? "Yes" : "No"}
              </div>
              <div className="text-sm text-gray-600">Priority</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        {!isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your retailer profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <p className="text-gray-900">{profile.company_name}</p>
              </div>

              {profile.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{profile.description}</p>
                </div>
              )}

              {profile.website_url && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Website</label>
                  <a
                    href={profile.website_url?.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="h-4 w-4" />
                    {profile.website_url}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.contact_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <a
                      href={`mailto:${profile.contact_email}`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-4 w-4" />
                      {profile.contact_email}
                    </a>
                  </div>
                )}

                {profile.contact_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <a
                      href={`tel:${profile.contact_phone}`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-4 w-4" />
                      {profile.contact_phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Profile Settings Info</p>
                      <p>You can edit basic information like company name, description, and contact details.</p>
                      <p className="mt-2">Daily deal limits, CSV permissions, and priority status are managed by administrators.</p>
                      {profile.has_csv_permission && (
                        <p className="mt-2 text-green-700 font-medium">
                          ✓ CSV bulk upload is enabled for your account. Contact support for upload instructions.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your retailer profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Company Name *
                </label>
                <Input
                  value={editForm.company_name}
                  onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Tell customers about your company..."
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Website URL
                </label>
                <Input
                  type="url"
                  value={editForm.website_url}
                  onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={editForm.contact_email}
                    onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                    placeholder="contact@yourcompany.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Contact Phone
                  </label>
                  <Input
                    type="tel"
                    value={editForm.contact_phone}
                    onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manage Deals Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Manage Your Deals</h3>
                <p className="text-sm text-gray-600">
                  Create, edit, and manage your product deals
                </p>
              </div>
              <Button onClick={onManageDeals} size="lg">
                <Package className="h-4 w-4 mr-2" />
                My Deals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}