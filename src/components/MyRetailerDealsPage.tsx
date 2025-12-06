import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { 
  ArrowLeft, Plus, Edit2, Trash2, Pause, Play, Archive, 
  RefreshCw, Search, Eye, Heart, Clock, DollarSign, Image as ImageIcon,
  X, Upload, AlertCircle, Tag, Store
} from "lucide-react";
import { DealsService } from "../utils/services";
import { CSVBulkUpload } from "./deals/CSVBulkUpload";
import { isAdminUser } from "../utils/auth";

interface MyRetailerDealsPageProps {
  user: any;
  onBack: () => void;
  onNavigateToProfile: () => void;
}

export function MyRetailerDealsPage({ user, onBack, onNavigateToProfile }: MyRetailerDealsPageProps) {
  const [profile, setProfile] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [dealTypes, setDealTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "archived">("all");
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [allRetailers, setAllRetailers] = useState<any[]>([]);
  const [retailerFilter, setRetailerFilter] = useState<string>("all");
  
  // Bulk selection
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Bulk renew
  const [showBulkRenewDialog, setShowBulkRenewDialog] = useState(false);
  const [isBulkRenewing, setIsBulkRenewing] = useState(false);
  
  // Bulk archive
  const [showBulkArchiveDialog, setShowBulkArchiveDialog] = useState(false);
  const [isBulkArchiving, setIsBulkArchiving] = useState(false);
  
  // Bulk renew limit error
  const [showLimitErrorDialog, setShowLimitErrorDialog] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState("");
  
  // Relist confirmation
  const [showRelistDialog, setShowRelistDialog] = useState(false);
  const [relistingDeal, setRelistingDeal] = useState<any>(null);
  const [isRelisting, setIsRelisting] = useState(false);
  
  // Create/Edit Modal
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [dealForm, setDealForm] = useState<any>({
    title: "",
    description: "",
    price: "",
    original_price: "",
    external_url: "",
    deal_type_id: "",
    retailer_profile_id: "", // Admin can select retailer
  });
  const [isSaving, setIsSaving] = useState(false);
  const [dealFormFiles, setDealFormFiles] = useState<File[]>([]);
  const [dealFormPreviews, setDealFormPreviews] = useState<string[]>([]);
  
  // Image Upload
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentDealForImages, setCurrentDealForImages] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Check if admin first
      const adminStatus = isAdminUser(user);
      setIsAdmin(adminStatus);

      // Get retailer profile
      const profileData = await DealsService.getMyRetailerProfile();
      
      // If not admin and no profile, redirect
      if (!adminStatus && !profileData) {
        toast.error("You don't have a retailer profile");
        onBack();
        return;
      }
      
      setProfile(profileData);

      // Get all deals
      const dealsData = await DealsService.getDeals();
      
      // If admin, show ALL deals. If retailer, filter to only their deals
      if (adminStatus) {
        setDeals(dealsData.deals); // Admin sees all
        
        // Load all retailers for filter
        const retailersData = await DealsService.getRetailerProfiles();
        setAllRetailers(retailersData);
      } else {
        // Retailer only sees their own deals
        const myDeals = dealsData.deals.filter((deal: any) => deal.retailer_profile_id === profileData.id);
        setDeals(myDeals);
      }

      // Get deal types
      const typesData = await DealsService.getDealTypes();
      setDealTypes(typesData);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeal = () => {
    setEditingDeal(null);
    setDealForm({
      title: "",
      description: "",
      price: "",
      original_price: "",
      external_url: "",
      deal_type_id: "",
      retailer_profile_id: "", // Admin can select retailer
    });
    setDealFormFiles([]);
    setDealFormPreviews([]);
    setShowDealModal(true);
  };

  const handleEditDeal = (deal: any) => {
    setEditingDeal(deal);
    setDealForm({
      title: deal.title,
      description: deal.description || "",
      price: deal.price.toString(),
      original_price: deal.original_price ? deal.original_price.toString() : "",
      external_url: deal.external_url,
      deal_type_id: deal.deal_type_id || "",
      retailer_profile_id: deal.retailer_profile_id || "", // Admin can select retailer
    });
    setDealFormFiles([]);
    setDealFormPreviews([]);
    setShowDealModal(true);
  };

  const handleSaveDeal = async () => {
    // Validation
    if (!dealForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!dealForm.price || parseFloat(dealForm.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!dealForm.external_url.trim()) {
      toast.error("Product URL is required");
      return;
    }
    
    // Validate original price vs sale price
    if (dealForm.original_price && parseFloat(dealForm.original_price) > 0) {
      if (parseFloat(dealForm.original_price) <= parseFloat(dealForm.price)) {
        toast.error("Original price must be greater than sale price");
        return;
      }
    }
    
    // Admin must select a retailer profile
    if (isAdmin && !dealForm.retailer_profile_id) {
      toast.error("Please select a retailer profile");
      return;
    }

    setIsSaving(true);
    try {
      // Calculate expiration date (2 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 2);
      
      const dealData = {
        title: dealForm.title,
        description: dealForm.description,
        price: parseFloat(dealForm.price),
        original_price: dealForm.original_price ? parseFloat(dealForm.original_price) : null,
        external_url: dealForm.external_url,
        deal_type_id: dealForm.deal_type_id || null,
        retailer_profile_id: isAdmin ? dealForm.retailer_profile_id : profile.id,
        expires_at: expiresAt.toISOString(),
      };

      let dealId: string;
      if (editingDeal) {
        // Don't update expires_at when editing
        delete dealData.expires_at;
        await DealsService.updateDeal(editingDeal.id, dealData);
        dealId = editingDeal.id;
        toast.success("Deal updated successfully!");
      } else {
        const newDeal = await DealsService.createDeal(dealData);
        dealId = newDeal.id;
        toast.success("Deal created successfully!");
      }

      // Upload images if any
      if (dealFormFiles.length > 0) {
        try {
          for (let i = 0; i < dealFormFiles.length; i++) {
            await DealsService.uploadDealImageFile(dealId, dealFormFiles[i], i);
          }
          toast.success(`Uploaded ${dealFormFiles.length} image(s)`);
        } catch (error: any) {
          console.error("Error uploading images:", error);
          toast.error(`Deal saved but image upload failed: ${error.message}`);
        }
      }

      setDealFormFiles([]);
      setDealFormPreviews([]);
      loadData();
    } catch (error: any) {
      console.error("Error saving deal:", error);
      const errorMessage = error.details || error.message || "Failed to save deal";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (deal: any) => {
    try {
      const newStatus = deal.status === "active" ? "paused" : "active";
      await DealsService.updateDeal(deal.id, { status: newStatus });
      toast.success(`Deal ${newStatus === "active" ? "activated" : "paused"}`);
      loadData();
    } catch (error: any) {
      console.error("Error toggling deal status:", error);
      toast.error(error.message || "Failed to update deal status");
    }
  };

  const handleArchiveDeal = async (deal: any) => {
    if (!confirm("Archive this deal? It will no longer be visible to customers.")) return;
    
    try {
      await DealsService.updateDeal(deal.id, { status: "archived" });
      toast.success("Deal archived");
      loadData();
    } catch (error: any) {
      console.error("Error archiving deal:", error);
      toast.error(error.message || "Failed to archive deal");
    }
  };

  const handleRelistDeal = async (deal: any) => {
    setRelistingDeal(deal);
    setShowRelistDialog(true);
  };

  const handleConfirmRelist = async () => {
    setIsRelisting(true);
    try {
      // Calculate new expiration date (2 days from now)
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 2);
      
      await DealsService.updateDeal(relistingDeal.id, { 
        status: "active",
        expires_at: newExpiresAt.toISOString()
      });
      toast.success("Deal relisted successfully! Active for 2 more days.");
      loadData();
    } catch (error: any) {
      console.error("Error relisting deal:", error);
      toast.error(error.message || "Failed to relist deal");
    } finally {
      setIsRelisting(false);
      setShowRelistDialog(false);
    }
  };

  const handleDeleteDeal = async (deal: any) => {
    if (!confirm("Permanently delete this deal? This cannot be undone.")) return;
    
    try {
      await DealsService.deleteDeal(deal.id);
      toast.success("Deal deleted");
      loadData();
    } catch (error: any) {
      console.error("Error deleting deal:", error);
      toast.error(error.message || "Failed to delete deal");
    }
  };

  // Bulk selection handlers
  const toggleSelectDeal = (dealId: string) => {
    const newSelected = new Set(selectedDealIds);
    if (newSelected.has(dealId)) {
      newSelected.delete(dealId);
    } else {
      newSelected.add(dealId);
    }
    setSelectedDealIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedDealIds.size === filteredDeals.length) {
      setSelectedDealIds(new Set());
    } else {
      setSelectedDealIds(new Set(filteredDeals.map(d => d.id)));
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await DealsService.bulkDeleteDeals(Array.from(selectedDealIds));
      toast.success(`Successfully deleted ${selectedDealIds.size} deal(s)`);
      setSelectedDealIds(new Set());
      setShowBulkDeleteDialog(false);
      loadData();
    } catch (error: any) {
      console.error("Error bulk deleting deals:", error);
      toast.error(error.message || "Failed to delete deals");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkRenewClick = () => {
    setShowBulkRenewDialog(true);
  };

  const handleBulkRenew = async () => {
    setIsBulkRenewing(true);
    try {
      await DealsService.bulkRenewDeals(Array.from(selectedDealIds));
      toast.success(`Successfully renewed ${selectedDealIds.size} deal(s)`);
      setSelectedDealIds(new Set());
      setShowBulkRenewDialog(false);
      loadData();
    } catch (error: any) {
      console.error("Error bulk renewing deals:", error);
      // Show error in modal if it's a limit error
      if (error.message && (error.message.includes('exceeding your limit') || error.message.includes('active listings per day'))) {
        setLimitErrorMessage(error.message);
        setShowLimitErrorDialog(true);
        setShowBulkRenewDialog(false);
      } else {
        toast.error(error.message || "Failed to renew deals");
      }
    } finally {
      setIsBulkRenewing(false);
    }
  };

  const handleBulkArchive = async () => {
    setIsBulkArchiving(true);
    try {
      await DealsService.bulkArchiveDeals(Array.from(selectedDealIds));
      toast.success(`Successfully archived ${selectedDealIds.size} deal(s)`);
      setSelectedDealIds(new Set());
      setShowBulkArchiveDialog(false);
      loadData();
    } catch (error: any) {
      console.error("Error bulk archiving deals:", error);
      toast.error(error.message || "Failed to archive deals");
    } finally {
      setIsBulkArchiving(false);
    }
  };

  const handleManageImages = (deal: any) => {
    setCurrentDealForImages(deal);
    setImageUrl("");
    setSelectedFiles([]);
    setUploadPreviews([]);
    setShowImageModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImageCount = currentDealForImages?.images?.length || 0;
    const maxNew = 4 - currentImageCount;

    if (files.length > maxNew) {
      toast.error(`You can only upload ${maxNew} more image(s). Maximum 4 images per deal.`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setSelectedFiles(validFiles);
    setUploadPreviews(previews);
  };

  const handleUploadFiles = async () => {
    if (!currentDealForImages || selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setIsUploadingImage(true);
    try {
      // Upload files sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        await DealsService.uploadDealImageFile(currentDealForImages.id, selectedFiles[i], i);
      }
      toast.success(`Successfully uploaded ${selectedFiles.length} image(s)!`);
      setSelectedFiles([]);
      setUploadPreviews([]);
      loadData();
      // Refresh current deal
      const updatedDeals = await DealsService.getDeals();
      const updatedDeal = updatedDeals.deals.find((d: any) => d.id === currentDealForImages.id);
      setCurrentDealForImages(updatedDeal);
    } catch (error: any) {
      console.error("Error uploading files:", error);
      toast.error(error.message || "Failed to upload files");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDealFormFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImageCount = editingDeal?.images?.length || 0;
    const maxNew = 4 - currentImageCount;

    if (files.length > maxNew) {
      toast.error(`You can only upload ${maxNew} more image(s). Maximum 4 images per deal.`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setDealFormFiles(validFiles);
    setDealFormPreviews(previews);
  };

  const handleRemoveDealFormFile = (index: number) => {
    const newFiles = [...dealFormFiles];
    const newPreviews = [...dealFormPreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setDealFormFiles(newFiles);
    setDealFormPreviews(newPreviews);
  };

  const handleUploadImage = async () => {
    if (!currentDealForImages || !imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    const currentImageCount = currentDealForImages?.images?.length || 0;
    if (currentImageCount >= 4) {
      toast.error("Maximum 4 images per deal");
      return;
    }

    setIsUploadingImage(true);
    try {
      await DealsService.addDealImage(currentDealForImages.id, imageUrl);
      toast.success("Image added successfully!");
      setImageUrl("");
      loadData();
      // Refresh current deal
      const updatedDeals = await DealsService.getDeals();
      const updatedDeal = updatedDeals.deals.find((d: any) => d.id === currentDealForImages.id);
      setCurrentDealForImages(updatedDeal);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Delete this image?")) return;
    
    try {
      await DealsService.deleteDealImage(imageId);
      toast.success("Image deleted");
      loadData();
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast.error(error.message || "Failed to delete image");
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
    const matchesRetailer = retailerFilter === "all" || deal.retailer_profile_id === retailerFilter;
    return matchesSearch && matchesStatus && matchesRetailer;
  });

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff < 0) return "0m left";
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h left`;
    return `${minutes}m left`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-gray-600">Loading your deals...</p>
        </div>
      </div>
    );
  }

  // Admin doesn't need a profile to view deals
  if (!profile && !isAdmin) {
    return null;
  }

  // Calculate today's deal count
  const today = new Date().toISOString().split('T')[0];
  const todayDealsCount = deals.filter(deal => 
    deal.created_at.split('T')[0] === today
  ).length;
  const remainingDeals = profile?.daily_deal_limit === 0 
    ? "Unlimited" 
    : Math.max(0, (profile?.daily_deal_limit || 0) - todayDealsCount);
  const canCreateDeal = !profile || profile.daily_deal_limit === 0 || todayDealsCount < profile.daily_deal_limit;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Dashboard
                {isAdmin && (
                  <Badge className="ml-2 bg-blue-600">Admin View</Badge>
                )}
              </h1>
              <p className="text-sm text-gray-600">
                {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} • 
                {" "}{remainingDeals} remaining today
              </p>
            </div>
          </div>

          {!canCreateDeal && (
            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-900">
                <p className="font-medium">Daily limit reached</p>
                <p>You've created {todayDealsCount} deals today. Your limit is {profile?.daily_deal_limit} deals per day.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2 justify-end">
            {selectedDealIds.size > 0 && (
              <>
                <Button
                  variant="default"
                  onClick={handleBulkRenewClick}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Renew {selectedDealIds.size}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkArchiveDialog(true)}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Archive {selectedDealIds.size}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowBulkDeleteDialog(true)}
                >
                  Delete {selectedDealIds.size}
                </Button>
              </>
            )}
            {!isAdmin && (
              <Button
                variant="outline"
                onClick={onNavigateToProfile}
              >
                Retailer Profile
              </Button>
            )}
            <Button
              onClick={handleCreateDeal}
              disabled={!canCreateDeal}
              title={!canCreateDeal ? "Daily deal limit reached" : ""}
            >
              Create Deal
            </Button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 items-center flex-wrap">
              {/* Admin: Retailer Filter */}
              {isAdmin && allRetailers.length > 0 && (
                <Select value={retailerFilter} onValueChange={setRetailerFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Retailers">
                      {retailerFilter === "all" 
                        ? "All Retailers" 
                        : allRetailers.find(r => r.id === retailerFilter)?.company_name || "All Retailers"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Retailers</SelectItem>
                    {allRetailers.map((retailer) => (
                      <SelectItem key={retailer.id} value={retailer.id}>
                        {retailer.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {filteredDeals.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 border rounded">
                  <Checkbox
                    checked={filteredDeals.length > 0 && selectedDealIds.size === filteredDeals.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm">Select All</span>
                </div>
              )}
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "paused" ? "default" : "outline"}
                onClick={() => setStatusFilter("paused")}
                size="sm"
              >
                Paused
              </Button>
              <Button
                variant={statusFilter === "archived" ? "default" : "outline"}
                onClick={() => setStatusFilter("archived")}
                size="sm"
              >
                Archived
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Bulk Upload Section */}
      {!isAdmin && profile && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <CSVBulkUpload 
            profile={profile}
            dealTypes={dealTypes}
            onSuccess={loadData}
          />
        </div>
      )}

      {/* Deals List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filteredDeals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "No deals match your filters" 
                  : "You haven't created any deals yet"}
              </p>
              {canCreateDeal && (
                <Button onClick={handleCreateDeal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Deal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredDeals.map((deal) => (
              <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedDealIds.has(deal.id)}
                    onCheckedChange={() => toggleSelectDeal(deal.id)}
                    className="bg-white shadow-md"
                  />
                </div>

                <CardContent className="p-0">
                  {/* Image Section */}
                  <div className="relative bg-gray-100 aspect-video">
                    {deal.images && deal.images.length > 0 ? (
                      <img
                        src={deal.images[0].image_url}
                        alt={deal.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}

                    {/* Discount Badge */}
                    {deal.original_price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full shadow-lg">
                        <span className="font-bold">
                          {Math.round(((deal.original_price - deal.price) / deal.original_price) * 100)}% OFF
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge variant={deal.status === "active" ? "default" : deal.status === "paused" ? "secondary" : "outline"} className="bg-green-600 text-white">
                        {deal.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    {/* Retailer Info */}
                    <div className="flex items-center gap-2 mb-2">
                      {deal.retailer_profile?.logo_url ? (
                        <img
                          src={deal.retailer_profile.logo_url}
                          alt={deal.retailer_profile.company_name}
                          className="w-6 h-6 rounded object-cover"
                        />
                      ) : (
                        <Store className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {deal.retailer_profile?.company_name || 'Unknown Retailer'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {deal.title}
                    </h3>

                    {/* Deal Type */}
                    {deal.deal_type && (
                      <Badge
                        variant="outline"
                        className="mb-3"
                        style={{
                          borderColor: deal.deal_type.color,
                          color: deal.deal_type.color,
                        }}
                      >
                        {deal.deal_type.name}
                      </Badge>
                    )}

                    {/* Price Section */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-green-600">
                        ${deal.price.toFixed(2)}
                      </span>
                      {deal.original_price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${deal.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Time Remaining */}
                    <div className="flex items-center gap-1 text-sm mb-3">
                      <Clock className="h-4 w-4" />
                      <span className={`font-medium ${
                        deal.status === 'archived' 
                          ? 'text-gray-500' 
                          : 'text-orange-600'
                      }`}>
                        {deal.status === 'archived' ? 'Archived' : formatTimeRemaining(deal.expires_at)}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{deal.view_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{deal.save_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        <span>{deal.images?.length || 0}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDeal(deal)}
                        className="w-full"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageImages(deal)}
                        className="w-full"
                      >
                        Images
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(deal)}
                        disabled={deal.status === "archived"}
                        className="w-full"
                      >
                        {deal.status === "active" ? (
                          <>
                            Pause
                          </>
                        ) : (
                          <>
                            Activate
                          </>
                        )}
                      </Button>
                      {deal.status !== "archived" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchiveDeal(deal)}
                          className="w-full"
                        >
                          Archive
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRelistDeal(deal)}
                            className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 border-green-500"
                          >
                            Relist
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDeal(deal)}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Deal Modal */}
      <Dialog open={showDealModal} onOpenChange={(open) => {
        if (!open) {
          // Clean up preview URLs when closing
          dealFormPreviews.forEach(url => URL.revokeObjectURL(url));
          setDealFormPreviews([]);
          setDealFormFiles([]);
        }
        setShowDealModal(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal ? "Edit Deal" : "Create New Deal"}</DialogTitle>
            <DialogDescription>
              {editingDeal ? "Update deal information" : "Add a new deal for your products"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input
                value={dealForm.title}
                onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                placeholder="e.g., Smart Pro Programmer - 50% Off"
              />
            </div>

            {/* Admin: Retailer Profile Selector */}
            {isAdmin && (
              <div>
                <label className="text-sm font-medium mb-1 block">Retailer Profile *</label>
                <Select
                  value={dealForm.retailer_profile_id}
                  onValueChange={(value) => setDealForm({ ...dealForm, retailer_profile_id: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a retailer">
                      {dealForm.retailer_profile_id 
                        ? allRetailers.find(r => r.id === dealForm.retailer_profile_id)?.company_name 
                        : "Select a retailer"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allRetailers.map((retailer) => (
                      <SelectItem key={retailer.id} value={retailer.id}>
                        <div className="flex items-center gap-2">
                          {retailer.logo_url && (
                            <img 
                              src={retailer.logo_url} 
                              alt={retailer.company_name} 
                              className="w-5 h-5 rounded object-cover"
                            />
                          )}
                          <span>{retailer.company_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={dealForm.description}
                onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                placeholder="Describe the deal..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Sale Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={dealForm.price}
                  onChange={(e) => setDealForm({ ...dealForm, price: e.target.value })}
                  placeholder="49.99"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Original Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={dealForm.original_price}
                  onChange={(e) => setDealForm({ ...dealForm, original_price: e.target.value })}
                  placeholder="99.99"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Product URL *</label>
              <Input
                type="url"
                value={dealForm.external_url}
                onChange={(e) => setDealForm({ ...dealForm, external_url: e.target.value })}
                onBlur={(e) => {
                  const url = e.target.value.trim();
                  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                    setDealForm({ ...dealForm, external_url: `https://${url}` });
                  }
                }}
                placeholder="https://yourwebsite.com/product"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Deal Type</label>
              <Select
                value={dealForm.deal_type_id}
                onValueChange={(value) => setDealForm({ ...dealForm, deal_type_id: value === "none" ? "" : value })}
                className="w-full"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No category">
                    {dealForm.deal_type_id ? dealTypes.find(type => type.id === dealForm.deal_type_id)?.name : "No category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {dealTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Deal Images (Optional)</label>
                <Badge variant={dealFormFiles.length >= 4 ? "destructive" : "secondary"}>
                  {dealFormFiles.length + (editingDeal?.images?.length || 0)} / 4 images
                </Badge>
              </div>
              
              {editingDeal?.images && editingDeal.images.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Current: {editingDeal.images.length} image(s). Use "Images" button to manage.
                  </p>
                </div>
              )}

              {(dealFormFiles.length + (editingDeal?.images?.length || 0)) < 4 && (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDealFormFileSelect}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload up to {4 - (editingDeal?.images?.length || 0)} more images (max 10MB each)
                  </p>
                </>
              )}

              {dealFormPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {dealFormPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full aspect-square object-cover rounded border-2 border-blue-500"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveDealFormFile(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Badge className="absolute bottom-1 left-1 text-xs">New</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
              <p className="font-medium mb-1">Deal Duration</p>
              <p>Deals automatically expire after 2 days from creation.</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveDeal} disabled={isSaving} className="flex-1">
                {isSaving ? "Saving..." : editingDeal ? "Update Deal" : "Create Deal"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDealModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Management Modal */}
      <Dialog open={showImageModal} onOpenChange={(open) => {
        if (!open) {
          // Clean up preview URLs when closing
          uploadPreviews.forEach(url => URL.revokeObjectURL(url));
          setUploadPreviews([]);
          setSelectedFiles([]);
        }
        setShowImageModal(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Deal Images</DialogTitle>
            <DialogDescription>
              {currentDealForImages?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Count Badge */}
            <div className="flex items-center justify-between mb-2">
              <Badge variant={currentDealForImages?.images?.length >= 4 ? "destructive" : "secondary"}>
                {currentDealForImages?.images?.length || 0} / 4 images
              </Badge>
              {currentDealForImages?.images?.length >= 4 && (
                <span className="text-sm text-red-600">Maximum limit reached</span>
              )}
            </div>

            {/* Upload Files */}
            {(!currentDealForImages?.images || currentDealForImages.images.length < 4) && (
              <div>
                <label className="text-sm font-medium mb-1 block">Upload Images from Computer</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isUploadingImage || (currentDealForImages?.images?.length >= 4)}
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {uploadPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full aspect-square object-cover rounded border-2 border-blue-500"
                          />
                          <Badge className="absolute top-1 right-1 text-xs">New</Badge>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleUploadFiles}
                      disabled={isUploadingImage}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingImage ? "Uploading..." : `Upload ${selectedFiles.length} Image(s)`}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Or Upload from URL */}
            {(!currentDealForImages?.images || currentDealForImages.images.length < 4) && (
              <div>
                <label className="text-sm font-medium mb-1 block">Or Add Image URL</label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={isUploadingImage}
                  />
                  <Button
                    onClick={handleUploadImage}
                    disabled={isUploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploadingImage ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Images */}
            {currentDealForImages?.images && currentDealForImages.images.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Current Images ({currentDealForImages.images.length})</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentDealForImages.images.map((image: any) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image_url}
                        alt="Deal"
                        className="w-full aspect-square object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!currentDealForImages?.images || currentDealForImages.images.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No images yet. Upload your first image above.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedDealIds.size} Deal(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedDealIds.size} selected deal(s)</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? "Deleting..." : `Delete ${selectedDealIds.size} Deal(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Renew Confirmation Dialog */}
      <AlertDialog open={showBulkRenewDialog} onOpenChange={setShowBulkRenewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renew {selectedDealIds.size} Deal(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will renew <strong>{selectedDealIds.size} selected deal(s)</strong> for another 2 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkRenewing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkRenew} 
              disabled={isBulkRenewing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isBulkRenewing ? "Renewing..." : `Renew ${selectedDealIds.size} Deal(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Archive Confirmation Dialog */}
      <AlertDialog open={showBulkArchiveDialog} onOpenChange={setShowBulkArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedDealIds.size} Deal(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive <strong>{selectedDealIds.size} selected deal(s)</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkArchive} 
              disabled={isBulkArchiving}
              className="bg-gray-600 hover:bg-gray-700"
            >
              {isBulkArchiving ? "Archiving..." : `Archive ${selectedDealIds.size} Deal(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Relist Confirmation Dialog */}
      <AlertDialog open={showRelistDialog} onOpenChange={setShowRelistDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Relist Deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will relist the deal for another 2 days. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRelisting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRelist} 
              disabled={isRelisting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRelisting ? "Relisting..." : "Relist"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Renew Limit Error Dialog */}
      <AlertDialog open={showLimitErrorDialog} onOpenChange={setShowLimitErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Daily Deal Limit Exceeded
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left whitespace-pre-wrap">
              {limitErrorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowLimitErrorDialog(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}