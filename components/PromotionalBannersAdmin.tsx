import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner";
import { AdminService } from "../utils/services";
import { AuthService } from "../utils/auth";
import {
  Plus,
  Trash2,
  Edit,
  Upload,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  ExternalLink,
  MoveUp,
  MoveDown
} from "lucide-react";

interface PromotionalBanner {
  id: string;
  name: string;
  link: string;
  pc_image_url: string;
  mobile_image_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function PromotionalBannersAdmin() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<PromotionalBanner | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    pc_image_url: "",
    mobile_image_url: "",
    is_active: true
  });
  const [uploadingPc, setUploadingPc] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      setIsLoading(false);
      return;
    }

    const result = await AdminService.getPromotionalBanners(accessToken);
    if (result.success && result.banners) {
      setBanners(result.banners);
      // Show warning if table doesn't exist
      if ((result as any).warning) {
        toast.warning((result as any).warning);
      }
    } else {
      toast.error(result.error || 'Failed to fetch promotional banners');
    }
    setIsLoading(false);
  };

  const handleAddBanner = () => {
    setFormData({
      name: "",
      link: "",
      pc_image_url: "",
      mobile_image_url: "",
      is_active: true
    });
    setShowAddDialog(true);
  };

  const handleEditBanner = (banner: PromotionalBanner) => {
    setSelectedBanner(banner);
    setFormData({
      name: banner.name,
      link: banner.link,
      pc_image_url: banner.pc_image_url,
      mobile_image_url: banner.mobile_image_url,
      is_active: banner.is_active
    });
    setShowEditDialog(true);
  };

  const handleDeleteBanner = (banner: PromotionalBanner) => {
    setSelectedBanner(banner);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedBanner) return;

    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    setIsLoading(true);
    const result = await AdminService.deletePromotionalBanner(accessToken, selectedBanner.id);

    if (result.success) {
      toast.success('Banner deleted successfully');
      setShowDeleteDialog(false);
      setSelectedBanner(null);
      fetchBanners();
    } else {
      toast.error(result.error || 'Failed to delete banner');
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (file: File, type: 'pc' | 'mobile') => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    if (type === 'pc') setUploadingPc(true);
    else setUploadingMobile(true);

    try {
      const result = await AdminService.uploadBannerImage(accessToken, file, type);

      if (result.success && result.imageUrl) {
        setFormData(prev => ({
          ...prev,
          [type === 'pc' ? 'pc_image_url' : 'mobile_image_url']: result.imageUrl
        }));
        toast.success(`${type === 'pc' ? 'PC' : 'Mobile'} image uploaded successfully`);
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      if (type === 'pc') setUploadingPc(false);
      else setUploadingMobile(false);
    }
  };

  const handleSaveBanner = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    setIsLoading(true);

    let result;
    if (showEditDialog && selectedBanner) {
      result = await AdminService.updatePromotionalBanner(accessToken, selectedBanner.id, formData);
    } else {
      result = await AdminService.createPromotionalBanner(accessToken, formData);
    }

    if (result.success) {
      toast.success(`Banner ${showEditDialog ? 'updated' : 'created'} successfully`);
      setShowAddDialog(false);
      setShowEditDialog(false);
      setSelectedBanner(null);
      fetchBanners();
    } else {
      toast.error(result.error || `Failed to ${showEditDialog ? 'update' : 'create'} banner`);
    }
    setIsLoading(false);
  };

  const handleToggleActive = async (banner: PromotionalBanner) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    setIsLoading(true);
    const result = await AdminService.updatePromotionalBanner(accessToken, banner.id, {
      is_active: !banner.is_active
    });

    if (result.success) {
      toast.success(`Banner ${!banner.is_active ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } else {
      toast.error(result.error || 'Failed to update banner status');
    }
    setIsLoading(false);
  };

  const handleReorder = async (banner: PromotionalBanner, direction: 'up' | 'down') => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    const currentIndex = banners.findIndex(b => b.id === banner.id);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === banners.length - 1) return;

    const newOrder = direction === 'up' ? banner.display_order - 1 : banner.display_order + 1;

    setIsLoading(true);
    const result = await AdminService.updatePromotionalBanner(accessToken, banner.id, {
      display_order: newOrder
    });

    if (result.success) {
      fetchBanners();
    } else {
      toast.error(result.error || 'Failed to reorder banner');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Promotional Banners</CardTitle>
              <CardDescription>
                Manage promotional banners for the marketplace section. These banners appear in the PromotionalBlock.
              </CardDescription>
            </div>
            <Button onClick={handleAddBanner}>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && banners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : banners.length === 0 ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-amber-600">⚠️</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">Database Setup Required</h3>
                    <p className="text-sm text-amber-800 mb-3">
                      The promotional_banners table doesn't exist yet. Please run the migration to set up the database:
                    </p>
                    <ol className="text-sm text-amber-800 space-y-1 ml-4 list-decimal">
                      <li>Go to your Supabase dashboard → SQL Editor</li>
                      <li>Open the file: <code className="bg-amber-100 px-1 rounded">/migrations/005_promotional_banners.sql</code></li>
                      <li>Copy and paste the SQL into the editor</li>
                      <li>Click "Run" to execute the migration</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="text-center py-8 text-gray-500">
                No promotional banners yet. Click "Add Banner" to create one after running the migration.
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>PC Preview</TableHead>
                  <TableHead>Mobile Preview</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner, index) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{banner.display_order}</span>
                        <div className="flex flex-col gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleReorder(banner, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleReorder(banner, 'down')}
                            disabled={index === banners.length - 1}
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{banner.name}</TableCell>
                    <TableCell>
                      {banner.pc_image_url ? (
                        <img
                          src={banner.pc_image_url}
                          alt={`${banner.name} PC`}
                          className="h-12 w-32 object-cover rounded border"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {banner.mobile_image_url ? (
                        <img
                          src={banner.mobile_image_url}
                          alt={`${banner.name} Mobile`}
                          className="h-12 w-20 object-cover rounded border"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {banner.link ? (
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      ) : (
                        <span className="text-gray-400">No link</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(banner)}
                        >
                          {banner.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBanner(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBanner(banner)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setSelectedBanner(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit' : 'Add'} Promotional Banner</DialogTitle>
            <DialogDescription>
              Upload at least one banner image (PC or mobile). Both images are optional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Banner Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Black Friday Sale"
              />
            </div>

            <div>
              <Label>Link URL</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com/promotion"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  PC Image (970x250) - Optional
                </Label>
                <div className="mt-2 space-y-2">
                  {formData.pc_image_url && (
                    <img
                      src={formData.pc_image_url}
                      alt="PC preview"
                      className="w-full h-24 object-cover rounded border"
                    />
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'pc');
                      }}
                      disabled={uploadingPc}
                    />
                  </div>
                  {uploadingPc && <p className="text-sm text-gray-500">Uploading...</p>}
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Image (3:2 ratio) - Optional
                </Label>
                <div className="mt-2 space-y-2">
                  {formData.mobile_image_url && (
                    <img
                      src={formData.mobile_image_url}
                      alt="Mobile preview"
                      className="w-full h-24 object-cover rounded border"
                    />
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'mobile');
                      }}
                      disabled={uploadingMobile}
                    />
                  </div>
                  {uploadingMobile && <p className="text-sm text-gray-500">Uploading...</p>}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setShowEditDialog(false);
              setSelectedBanner(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveBanner} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBanner?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}