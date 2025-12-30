import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { MarketplaceCard } from "./MarketplaceCard";
import { SearchResultCard } from "./SearchResultCard";
import { NotificationsSection } from "./NotificationsSection";
import { UserService, DealsService } from "../utils/services";
import { AuthService } from "../utils/auth";
import { projectId } from "../utils/supabase/info";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import { 
  ArrowLeft,
  ArrowRight,
  User, 
  Settings, 
  Heart, 
  Package, 
  Bell, 
  Shield, 
  Edit3, 
  Upload,
  Trash2,
  Star,
  Eye,
  MessageCircle,
  Camera,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  ExternalLink,
  Flag,
  MoreVertical,
  AlertTriangle,
  UserX,
  TrendingUp,
  ZoomIn,
  ZoomOut,
  Store
} from "lucide-react";

interface AccountPageProps {
  user: any;
  onBack: () => void;
  onUpdateUser: (userData: any) => void;
  orderHistory?: any[];
  onViewProfile?: (userId: string) => void;
  onNavigateToRetailer?: () => void;
  onLogout?: () => void;
  onNotificationRead?: () => void;
}

// Mock data for demonstration - RESET: Empty array
const mockOrderHistory = [];

export function AccountPage({ 
  user, 
  onBack, 
  onUpdateUser, 
  orderHistory = mockOrderHistory,
  onViewProfile,
  onNavigateToRetailer,
  onLogout,
  onNotificationRead
}: AccountPageProps) {
  console.log('AccountPage - User data:', user);
  console.log('AccountPage - User phone:', user?.phone);
  console.log('AccountPage - User address:', user?.address);
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasRetailerProfile, setHasRetailerProfile] = useState(false);
  const [isCheckingRetailer, setIsCheckingRetailer] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    city: user?.location || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || ""
  });

  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    newMessageNotifications: true,
    listingUpdates: true,
    priceAlerts: false,
    twoFactorAuth: false,
    profileVisibility: "public"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Image cropper state
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Check if user has a retailer profile
  useEffect(() => {
    const checkRetailerProfile = async () => {
      if (!user) {
        setIsCheckingRetailer(false);
        return;
      }
      
      try {
        const profile = await DealsService.getMyRetailerProfile();
        setHasRetailerProfile(!!profile);
      } catch (error) {
        console.error("Error checking retailer profile:", error);
        setHasRetailerProfile(false);
      } finally {
        setIsCheckingRetailer(false);
      }
    };

    checkRetailerProfile();
  }, [user]);

  // Sync profileData when user prop changes
  useEffect(() => {
    if (user) {
      console.log('Syncing profileData with user:', user);
      console.log('User address:', user.address);
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        city: user.location || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || ""
      });
    }
  }, [user]);

  // Load notifications when tab is activated
  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotifications();
    }
  }, [activeTab]);

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      setLoadingNotifications(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/notifications`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleSaveProfile = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please sign in to update your profile');
      return;
    }

    try {
      const result = await UserService.updateProfile(accessToken, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.city
      });

      if (result.success && result.user) {
        onUpdateUser(result.user);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please sign in to change your password');
      return;
    }

    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      const result = await UserService.changePassword(
        accessToken,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password updated successfully');
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please sign in to delete your account');
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const result = await UserService.deleteAccount(accessToken);

      if (result.success) {
        toast.success('Your account has been scheduled for deletion. You have 15 days to contact support for recovery.');
        setShowDeleteConfirm(false);
        
        // Logout the user
        await AuthService.signOut();
        
        // Call onLogout if provided
        if (onLogout) {
          onLogout();
        }
      } else {
        toast.error(result.error || 'Failed to delete account');
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Failed to delete account');
      setShowDeleteConfirm(false);
    }
  };

  const handleReportReview = (reviewId: string, reportType: string, reviewerName: string) => {
    // In real app, submit report to backend
    console.log("Review reported:", { reviewId, reportType, reviewerName });
    
    // Show confirmation message based on report type
    const reportTypeNames = {
      "inappropriate-content": "Inappropriate Content",
      "spam-fake": "Spam or Fake Review",
      "harassment": "Harassment or Abusive Language",
      "false-information": "False Information",
      "other": "Other Violation"
    };
    
    const reportTypeName = reportTypeNames[reportType as keyof typeof reportTypeNames] || "Unknown";
    alert(`Thank you for reporting this review by ${reviewerName} for: ${reportTypeName}. We'll review your report and take appropriate action if necessary.`);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the same file can be selected again
    e.target.value = '';

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Only images are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    // Create preview URL and open crop dialog
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedFile(file);
      setShowCropDialog(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas size to the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSaveCroppedImage = async () => {
    if (!selectedImage || !croppedAreaPixels || !selectedFile) return;

    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please sign in to upload photo');
      return;
    }

    setIsCropping(true);

    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);
      
      // Create file from blob
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Upload avatar
      const uploadResult = await UserService.uploadAvatar(accessToken, croppedFile);
      
      if (!uploadResult.success || !uploadResult.url) {
        toast.error(uploadResult.error || 'Failed to upload image');
        setIsCropping(false);
        return;
      }

      // Update profile with new avatar URL
      const updateResult = await UserService.updateProfile(accessToken, {
        avatar: uploadResult.url
      });

      if (updateResult.success && updateResult.user) {
        onUpdateUser(updateResult.user);
        toast.success('Profile picture updated successfully');
        setShowCropDialog(false);
        setSelectedImage(null);
        setSelectedFile(null);
        setCroppedAreaPixels(null);
      } else {
        toast.error(updateResult.error || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to process image');
    } finally {
      setIsCropping(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-3 xs:py-4 sm:py-6 pb-24 md:pb-6 max-w-6xl">
        {/* Header */}


        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 xs:space-y-5 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="profile" className="flex items-center space-x-1 xs:space-x-2 py-2 xs:py-2.5 px-1 xs:px-2 text-xs xs:text-sm">
              <User className="h-3 w-3 xs:h-4 xs:w-4" />
              <span className="hidden xs:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-1 xs:space-x-2 py-2 xs:py-2.5 px-1 xs:px-2 text-xs xs:text-sm">
              <Bell className="h-3 w-3 xs:h-4 xs:w-4" />
              <span className="hidden xs:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-1 xs:space-x-2 py-2 xs:py-2.5 px-1 xs:px-2 text-xs xs:text-sm">
              <Settings className="h-3 w-3 xs:h-4 xs:w-4" />
              <span className="hidden xs:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Retailer Dashboard Link */}
          {!isCheckingRetailer && hasRetailerProfile && onNavigateToRetailer && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">

            </Card>
          )}
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 xs:space-y-5 sm:space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information and profile details.</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={() => setIsEditing(false)} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-white bg-white">
                      <AvatarImage src={user?.avatar} className="object-cover object-center w-full h-full" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {/* Edit Profile Picture Button */}
                    {isEditing && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Account profile picture button clicked - executing handler');
                          document.getElementById('photo-upload')?.click();
                        }}
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-1 right-1 bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 opacity-70 h-6 w-6 p-0 rounded-full z-10 cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />

                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="city"
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationsSection onNotificationsRead={onNotificationRead} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>Manage your account deletion.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete your account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900 text-sm">
              <strong>Please note:</strong> After deleting your account, we will keep your information for 15 days in case you change your mind. You can contact support within this period to restore your account.
            </div>
            <div className="text-sm">
              <div className="mb-2">All of your data, including:</div>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Profile information and settings</li>
                <li>Marketplace listings</li>
                <li>Messages and conversations</li>
                <li>Saved items and favorites</li>
                <li>Order history</li>
              </ul>
              <div className="text-destructive mt-2">
                will be permanently deleted after the 15-day recovery period.
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Cropper Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
            <DialogDescription>
              Adjust the position and zoom to crop your profile picture.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Cropper Container */}
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              {selectedImage && (
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            {/* Zoom Control */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4" />
                Zoom
              </Label>
              <div className="flex items-center gap-3">
                <ZoomOut className="h-4 w-4 text-gray-500" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 w-12">{zoom.toFixed(1)}x</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCropDialog(false);
                setSelectedImage(null);
                setSelectedFile(null);
              }}
              disabled={isCropping}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCroppedImage}
              disabled={isCropping}
            >
              {isCropping ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}