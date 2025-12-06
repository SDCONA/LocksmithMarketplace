import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { 
  Tag, Edit, Trash2, Plus, Archive, Play, Pause, 
  Clock, Eye, Bookmark, ExternalLink, Image as ImageIcon,
  Calendar, DollarSign, Store, RefreshCw, Upload, X, GripVertical
} from "lucide-react";
import { DealsService } from "../../utils/services";
import { projectId } from "../../utils/supabase/info";
import { AuthService } from "../../utils/auth";

interface Deal {
  id: string;
  created_at: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  external_url: string;
  expires_at: string;
  status: string;
  view_count: number;
  save_count: number;
  retailer_profile: any;
  deal_type: any;
  images: any[];
}

interface RetailerProfile {
  id: string;
  company_name: string;
  daily_deal_limit: number;
  is_active: boolean;
}

interface DealType {
  id: string;
  name: string;
  color: string;
}

export function DealsManagementAdmin() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [retailers, setRetailers] = useState<RetailerProfile[]>([]);
  const [dealTypes, setDealTypes] = useState<DealType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [retailerFilter, setRetailerFilter] = useState("all");
  
  // Bulk selection
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    retailer_profile_id: "",
    deal_type_id: "",
    title: "",
    description: "",
    price: "",
    original_price: "",
    external_url: "",
    expires_at: "",
  });

  const [dealImages, setDealImages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dealsToday, setDealsToday] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (statusFilter !== "all") {
      loadDeals();
    }
  }, [statusFilter, retailerFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dealsData, profilesData, typesData] = await Promise.all([
        DealsService.getDeals(),
        DealsService.getRetailerProfiles(),
        DealsService.getDealTypes(),
      ]);
      
      setDeals(dealsData.deals || []);
      setDealsToday(dealsData.dealsToday || {});
      setRetailers(profilesData);
      setDealTypes(typesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load deals data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeals = async () => {
    try {
      const data = await DealsService.getDeals();
      setDeals(data.deals || []);
      setDealsToday(data.dealsToday || {});
    } catch (error) {
      console.error("Error loading deals:", error);
    }
  };

  const handleCreate = async () => {
    if (!formData.retailer_profile_id || !formData.title || !formData.price || !formData.external_url || !formData.expires_at) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const dealData = {
        retailer_profile_id: formData.retailer_profile_id,
        deal_type_id: (formData.deal_type_id && formData.deal_type_id !== 'none') ? formData.deal_type_id : null,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        external_url: formData.external_url,
        expires_at: formData.expires_at,
      };

      await DealsService.createDeal(dealData);
      toast.success("Deal created successfully");
      setShowCreateDialog(false);
      resetForm();
      loadDeals();
    } catch (error: any) {
      console.error("Error creating deal:", error);
      toast.error(error.message || "Failed to create deal");
    }
  };

  const handleEdit = async () => {
    if (!selectedDeal) return;

    try {
      const dealData = {
        deal_type_id: (formData.deal_type_id && formData.deal_type_id !== 'none') ? formData.deal_type_id : null,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        external_url: formData.external_url,
        expires_at: formData.expires_at,
        status: selectedDeal.status,
      };

      await DealsService.updateDeal(selectedDeal.id, dealData);
      toast.success("Deal updated successfully");
      setShowEditDialog(false);
      resetForm();
      loadDeals();
    } catch (error: any) {
      console.error("Error updating deal:", error);
      toast.error(error.message || "Failed to update deal");
    }
  };

  const handleDelete = async () => {
    if (!selectedDeal) return;

    try {
      await DealsService.deleteDeal(selectedDeal.id);
      toast.success("Deal deleted successfully");
      setShowDeleteDialog(false);
      setSelectedDeal(null);
      loadDeals();
    } catch (error: any) {
      console.error("Error deleting deal:", error);
      toast.error(error.message || "Failed to delete deal");
    }
  };

  const handleArchive = async (dealId: string) => {
    try {
      await DealsService.archiveDeal(dealId);
      toast.success("Deal archived");
      loadDeals();
    } catch (error: any) {
      console.error("Error archiving deal:", error);
      toast.error(error.message || "Failed to archive deal");
    }
  };

  const handleRestore = async () => {
    if (!selectedDeal || !formData.expires_at) return;

    try {
      await DealsService.restoreDeal(selectedDeal.id, formData.expires_at);
      toast.success("Deal restored successfully");
      setShowRestoreDialog(false);
      setSelectedDeal(null);
      loadDeals();
    } catch (error: any) {
      console.error("Error restoring deal:", error);
      toast.error(error.message || "Failed to restore deal");
    }
  };

  const handlePause = async (dealId: string) => {
    try {
      await DealsService.pauseDeal(dealId);
      toast.success("Deal paused");
      loadDeals();
    } catch (error: any) {
      console.error("Error pausing deal:", error);
      toast.error(error.message || "Failed to pause deal");
    }
  };

  const handleActivate = async (dealId: string) => {
    try {
      await DealsService.activateDeal(dealId);
      toast.success("Deal activated");
      loadDeals();
    } catch (error: any) {
      console.error("Error activating deal:", error);
      toast.error(error.message || "Failed to activate deal");
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
      loadDeals();
    } catch (error: any) {
      console.error("Error bulk deleting deals:", error);
      toast.error(error.message || "Failed to delete deals");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDeal) return;

    setUploadingImage(true);
    try {
      // Upload to listing images bucket (we'll use the existing endpoint)
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const token = await AuthService.getFreshToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/upload/listing-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        }
      );

      if (!response.ok) throw new Error('Failed to upload image');

      const { url } = await response.json();
      
      // Add image to deal
      const displayOrder = dealImages.length;
      await DealsService.uploadDealImage(selectedDeal.id, url, displayOrder);
      
      toast.success("Image uploaded successfully");
      loadDealImages(selectedDeal.id);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await DealsService.deleteDealImage(imageId);
      toast.success("Image deleted");
      if (selectedDeal) {
        loadDealImages(selectedDeal.id);
      }
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast.error(error.message || "Failed to delete image");
    }
  };

  const loadDealImages = async (dealId: string) => {
    try {
      const deal = await DealsService.getDeal(dealId);
      setDealImages(deal.images || []);
    } catch (error) {
      console.error("Error loading deal images:", error);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    // Set default expiration to 2 days from now
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 2);
    setFormData({
      ...formData,
      expires_at: defaultExpiration.toISOString().slice(0, 16),
    });
    setShowCreateDialog(true);
  };

  const openEditDialog = (deal: Deal) => {
    setSelectedDeal(deal);
    setFormData({
      retailer_profile_id: deal.retailer_profile.id,
      deal_type_id: deal.deal_type?.id || "",
      title: deal.title,
      description: deal.description || "",
      price: deal.price.toString(),
      original_price: deal.original_price?.toString() || "",
      external_url: deal.external_url,
      expires_at: new Date(deal.expires_at).toISOString().slice(0, 16),
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDeleteDialog(true);
  };

  const openRestoreDialog = (deal: Deal) => {
    setSelectedDeal(deal);
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 2);
    setFormData({
      ...formData,
      expires_at: defaultExpiration.toISOString().slice(0, 16),
    });
    setShowRestoreDialog(true);
  };

  const openImageDialog = (deal: Deal) => {
    setSelectedDeal(deal);
    loadDealImages(deal.id);
    setShowImageDialog(true);
  };

  const resetForm = () => {
    setFormData({
      retailer_profile_id: "",
      deal_type_id: "",
      title: "",
      description: "",
      price: "",
      original_price: "",
      external_url: "",
      expires_at: "",
    });
    setSelectedDeal(null);
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
    const matchesRetailer = retailerFilter === "all" || deal.retailer_profile.id === retailerFilter;
    return matchesSearch && matchesStatus && matchesRetailer;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500">Paused</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff < 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Deal Management
              </CardTitle>
              <CardDescription>
                Create and manage deals for all retailer profiles
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Deal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={retailerFilter} onValueChange={setRetailerFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Retailers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Retailers</SelectItem>
                {retailers.map((retailer) => (
                  <SelectItem key={retailer.id} value={retailer.id}>
                    {retailer.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 flex items-center justify-end gap-2">
              {selectedDealIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedDealIds.size} Selected
                </Button>
              )}
              <Badge variant="outline">{filteredDeals.length} Deals</Badge>
            </div>
          </div>

          {/* Deals Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredDeals.length > 0 && selectedDealIds.size === filteredDeals.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Deal</TableHead>
                  <TableHead>Retailer</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading deals...
                    </TableCell>
                  </TableRow>
                ) : filteredDeals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No deals found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDealIds.has(deal.id)}
                          onCheckedChange={() => toggleSelectDeal(deal.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {deal.images && deal.images.length > 0 ? (
                            <img
                              src={deal.images[0].image_url}
                              alt={deal.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{deal.title}</div>
                            {deal.deal_type && (
                              <Badge 
                                variant="outline" 
                                className="text-xs mt-1"
                                style={{ 
                                  borderColor: deal.deal_type.color,
                                  color: deal.deal_type.color 
                                }}
                              >
                                {deal.deal_type.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{deal.retailer_profile.company_name}</div>
                          {dealsToday[deal.retailer_profile.id] !== undefined && (
                            <div className="text-xs text-gray-500">
                              {dealsToday[deal.retailer_profile.id]}/{deal.retailer_profile.daily_deal_limit === 0 ? "∞" : deal.retailer_profile.daily_deal_limit} today
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${deal.price}</div>
                          {deal.original_price && (
                            <div className="text-xs text-gray-500 line-through">
                              ${deal.original_price}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {formatTimeRemaining(deal.expires_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {deal.view_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Bookmark className="h-3 w-3" />
                            {deal.save_count}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(deal.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(deal)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openImageDialog(deal)}
                            title="Manage Images"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          {deal.status === "active" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePause(deal.id)}
                                title="Pause"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchive(deal.id)}
                                title="Archive"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {deal.status === "paused" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivate(deal.id)}
                              title="Activate"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {deal.status === "archived" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRestoreDialog(deal)}
                              title="Restore"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(deal)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? "Edit Deal" : "Create New Deal"}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog ? "Update deal information" : "Create a new deal with expiration and pricing"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Retailer Selection (Create only) */}
            {showCreateDialog && (
              <div>
                <Label htmlFor="retailer">Retailer Profile *</Label>
                <Select
                  value={formData.retailer_profile_id}
                  onValueChange={(value) => setFormData({ ...formData, retailer_profile_id: value })}
                >
                  <SelectTrigger id="retailer">
                    <SelectValue placeholder="Select retailer" />
                  </SelectTrigger>
                  <SelectContent>
                    {retailers
                      .filter(r => r.is_active)
                      .map((retailer) => (
                        <SelectItem key={retailer.id} value={retailer.id}>
                          {retailer.company_name}
                          {dealsToday[retailer.id] !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({dealsToday[retailer.id]}/{retailer.daily_deal_limit === 0 ? "∞" : retailer.daily_deal_limit} today)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Deal Type */}
            <div>
              <Label htmlFor="deal_type">Deal Type (Optional)</Label>
              <Select
                value={formData.deal_type_id}
                onValueChange={(value) => setFormData({ ...formData, deal_type_id: value })}
              >
                <SelectTrigger id="deal_type">
                  <SelectValue placeholder="Select deal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {dealTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <span style={{ color: type.color }}>●</span> {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Deal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., 50% Off Car Key Replacement"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
                placeholder="Brief description of the deal"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Sale Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.99"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="original_price">Original Price (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="59.99"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* External URL */}
            <div>
              <Label htmlFor="external_url">Product URL *</Label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="external_url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  placeholder="https://retailer.com/product"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Link to the product on the retailer's website
              </p>
            </div>

            {/* Expiration Date */}
            <div>
              <Label htmlFor="expires_at">Expiration Date & Time *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Default: 2 days from creation
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={showEditDialog ? handleEdit : handleCreate}>
              {showEditDialog ? "Update Deal" : "Create Deal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={(open) => {
        if (!open) {
          setShowRestoreDialog(false);
          setSelectedDeal(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Deal</DialogTitle>
            <DialogDescription>
              Set a new expiration date to restore this deal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDeal && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{selectedDeal.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedDeal.retailer_profile.company_name}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="restore_expires_at">New Expiration Date *</Label>
              <Input
                id="restore_expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRestoreDialog(false);
                setSelectedDeal(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRestore}>
              Restore Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Management Dialog */}
      <Dialog open={showImageDialog} onOpenChange={(open) => {
        if (!open) {
          setShowImageDialog(false);
          setSelectedDeal(null);
          setDealImages([]);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Deal Images</DialogTitle>
            <DialogDescription>
              Upload and manage images for this deal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDeal && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{selectedDeal.title}</p>
              </div>
            )}

            {/* Upload Button */}
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {uploadingImage ? "Uploading..." : "Click to upload image"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Max 10MB</p>
                </div>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </div>

            {/* Images Grid */}
            {dealImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {dealImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_url}
                      alt={`Deal image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dealImages.length === 0 && !uploadingImage && (
              <p className="text-center text-gray-500 py-8">No images uploaded yet</p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setShowImageDialog(false);
              setSelectedDeal(null);
              setDealImages([]);
            }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedDeal?.title}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDeal(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Deal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </div>
  );
}