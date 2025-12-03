import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { UserService } from "../utils/services/user";
import { toast } from "sonner";
import { 
  Edit3,
  MapPin,
  Globe,
  User,
  Shield,
  Bell,
  Eye,
  MessageCircle,
  Camera
} from "lucide-react";

interface EditMarketplaceProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  marketplaceProfile?: any;
  onUpdateMarketplaceProfile: (profileData: any) => void;
}

export function EditMarketplaceProfileModal({
  isOpen,
  onClose,
  user,
  marketplaceProfile,
  onUpdateMarketplaceProfile
}: EditMarketplaceProfileModalProps) {
  const [formData, setFormData] = useState({
    displayName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown User",
    bio: marketplaceProfile?.bio || user?.bio || "Active marketplace seller specializing in automotive keys and accessories.",
    location: marketplaceProfile?.location || user?.location || "San Francisco, CA",
    website: marketplaceProfile?.website || user?.website || "",
    phonePublic: marketplaceProfile?.phonePublic !== undefined ? marketplaceProfile?.phonePublic : user?.phonePublic || false,
    emailPublic: marketplaceProfile?.emailPublic !== undefined ? marketplaceProfile?.emailPublic : user?.emailPublic || false,
    showLastActive: marketplaceProfile?.showLastActive !== undefined ? marketplaceProfile?.showLastActive : user?.showLastActive !== false,
    autoReply: marketplaceProfile?.autoReply !== undefined ? marketplaceProfile?.autoReply : user?.autoReply || false,
    autoReplyMessage: marketplaceProfile?.autoReplyMessage || user?.autoReplyMessage || "Thank you for your message! I'll respond as soon as possible.",
    allowOffers: marketplaceProfile?.allowOffers !== undefined ? marketplaceProfile?.allowOffers : user?.allowOffers !== false,
    showcaseVerification: marketplaceProfile?.showcaseVerification !== undefined ? marketplaceProfile?.showcaseVerification : user?.showcaseVerification !== false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Initialize marketplace profile data with separate avatar
  const [marketplaceProfileData, setMarketplaceProfileData] = useState({
    marketplaceAvatar: marketplaceProfile?.marketplaceAvatar || user?.marketplaceAvatar || null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Include the selected image as marketplace avatar in the profile data
      const updatedProfileData = {
        ...formData,
        ...(selectedImage && { marketplaceAvatar: selectedImage })
      };
      
      // Update marketplace profile
      onUpdateMarketplaceProfile(updatedProfileData);
      
      console.log('Marketplace profile updated:', updatedProfileData);
      onClose();
    } catch (error) {
      console.error('Failed to update marketplace profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Marketplace Profile
          </DialogTitle>
          <DialogDescription>
            Customize how you appear to buyers and other sellers in the marketplace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedImage || marketplaceProfileData.marketplaceAvatar || user?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {formData.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Your profile picture is managed through your main account settings.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          try {
                            // Create a preview URL for immediate feedback
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const imageUrl = event.target?.result as string;
                              setSelectedImage(imageUrl);
                            };
                            reader.readAsDataURL(file);
                            
                            // Upload to backend
                            if (user?.accessToken) {
                              toast.promise(
                                UserService.uploadAvatar(user.accessToken, file),
                                {
                                  loading: 'Uploading avatar...',
                                  success: (uploadResult) => {
                                    if (uploadResult.success && uploadResult.url) {
                                      setSelectedImage(uploadResult.url);
                                      return 'Avatar uploaded successfully!';
                                    }
                                    throw new Error(uploadResult.error || 'Upload failed');
                                  },
                                  error: (err) => err.message || 'Failed to upload avatar'
                                }
                              );
                            } else {
                              toast.error('You must be logged in to upload an avatar');
                            }
                          } catch (error) {
                            console.error('Error uploading avatar:', error);
                            toast.error('Failed to upload avatar');
                          }
                        }
                      };
                      input.click();
                    }}
                  >
                    Change Picture
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Public Information
              </CardTitle>
              <CardDescription>
                This information will be visible to other marketplace users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">


              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell buyers about yourself and what you sell..."
                  className="min-h-[80px]"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/300 characters
                </p>
              </div>



              <div>
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Website (Optional)
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://your-website.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control what information is visible to other users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Phone Number</Label>
                  <p className="text-xs text-gray-500">
                    Allow buyers to see your phone number for direct contact
                  </p>
                </div>
                <Switch
                  checked={formData.phonePublic}
                  onCheckedChange={(checked) => handleInputChange('phonePublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Email Address</Label>
                  <p className="text-xs text-gray-500">
                    Allow buyers to see your email address
                  </p>
                </div>
                <Switch
                  checked={formData.emailPublic}
                  onCheckedChange={(checked) => handleInputChange('emailPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Last Active</Label>
                  <p className="text-xs text-gray-500">
                    Display when you were last online to buyers
                  </p>
                </div>
                <Switch
                  checked={formData.showLastActive}
                  onCheckedChange={(checked) => handleInputChange('showLastActive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    Showcase Verification Badge
                  </Label>
                  <p className="text-xs text-gray-500">
                    Prominently display your verified status
                  </p>
                </div>
                <Switch
                  checked={formData.showcaseVerification}
                  onCheckedChange={(checked) => handleInputChange('showcaseVerification', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Communication Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Communication Settings
              </CardTitle>
              <CardDescription>
                Manage how you communicate with buyers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Reply Messages</Label>
                  <p className="text-xs text-gray-500">
                    Automatically respond to new messages
                  </p>
                </div>
                <Switch
                  checked={formData.autoReply}
                  onCheckedChange={(checked) => handleInputChange('autoReply', checked)}
                />
              </div>

              {formData.autoReply && (
                <div>
                  <Label htmlFor="autoReplyMessage">Auto-Reply Message</Label>
                  <Textarea
                    id="autoReplyMessage"
                    value={formData.autoReplyMessage}
                    onChange={(e) => handleInputChange('autoReplyMessage', e.target.value)}
                    placeholder="Enter your automatic reply message..."
                    className="min-h-[60px]"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.autoReplyMessage.length}/200 characters
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Price Offers</Label>
                  <p className="text-xs text-gray-500">
                    Let buyers make offers on your listings
                  </p>
                </div>
                <Switch
                  checked={formData.allowOffers}
                  onCheckedChange={(checked) => handleInputChange('allowOffers', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Status Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Profile Preview</CardTitle>
              <CardDescription>
                How your profile will appear to other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedImage || marketplaceProfileData.marketplaceAvatar || user?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {formData.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{formData.displayName}</h3>
                    {formData.showcaseVerification && user?.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {formData.location}
                  </div>
                  <p className="text-sm text-gray-700">{formData.bio}</p>
                  {formData.showLastActive && (
                    <p className="text-xs text-gray-500 mt-2">Active today</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}