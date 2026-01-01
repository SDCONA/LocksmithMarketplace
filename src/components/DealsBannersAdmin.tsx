import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner";
import { AuthService } from "../utils/auth";
import { AdminService } from "../utils/services";
import { projectId, publicAnonKey } from "../utils/supabase/info";
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

interface DealsBanner {
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

export function DealsBannersAdmin() {
  const [banners, setBanners] = useState<DealsBanner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<DealsBanner | null>(null);

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

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/deals-banners`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success && result.banners) {
        setBanners(result.banners);
        if (result.warning) {
          toast.warning(result.warning);
        }
      } else {
        toast.error(result.error || 'Failed to fetch deals banners');
      }
    } catch (error) {
      toast.error('Failed to fetch deals banners');
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

  const handleEditBanner = (banner: DealsBanner) => {
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

  const handleDeleteBanner = (banner: DealsBanner) => {
    setSelectedBanner(banner);
    setShowDeleteDialog(true);
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

  const handleSaveNewBanner = async () => {
    if (!formData.name) {
      toast.error('Banner name is required');
      return;
    }

    if (!formData.pc_image_url && !formData.mobile_image_url) {
      toast.error('At least one image (PC or mobile) is required');
      return;
    }

    setIsLoading(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/deals-banners`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Deals banner created successfully');
        setShowAddDialog(false);
        fetchBanners();
      } else {
        toast.error(result.error || 'Failed to create deals banner');
      }
    } catch (error) {
      toast.error('Failed to create deals banner');
    }
    setIsLoading(false);
  };

  const handleSaveEditBanner = async () => {
    if (!selectedBanner || !formData.name) {
      toast.error('Banner name is required');
      return;
    }

    setIsLoading(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/deals-banners/${selectedBanner.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Deals banner updated successfully');
        setShowEditDialog(false);
        fetchBanners();
      } else {
        toast.error(result.error || 'Failed to update deals banner');
      }
    } catch (error) {
      toast.error('Failed to update deals banner');
    }
    setIsLoading(false);
  };

  const confirmDelete = async () => {
    if (!selectedBanner) return;

    setIsLoading(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/deals-banners/${selectedBanner.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Deals banner deleted successfully');
        setShowDeleteDialog(false);
        fetchBanners();
      } else {
        toast.error(result.error || 'Failed to delete deals banner');
      }
    } catch (error) {
      toast.error('Failed to delete deals banner');
    }
    setIsLoading(false);
  };

  const toggleBannerStatus = async (banner: DealsBanner) => {
    setIsLoading(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/deals-banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !banner.is_active })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Banner ${!banner.is_active ? 'activated' : 'deactivated'}`);
        fetchBanners();
      } else {
        toast.error(result.error || 'Failed to update banner status');
      }
    } catch (error) {
      toast.error('Failed to update banner status');
    }
    setIsLoading(false);
  };

  const moveBanner = async (banner: DealsBanner, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === banners.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const otherBanner = banners[newIndex];

    setIsLoading(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      setIsLoading(false);
      return;
    }

    try {
      // Swap display_order values
      await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/deals-banners/${banner.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ display_order: otherBanner.display_order })
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/deals-banners/${otherBanner.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ display_order: banner.display_order })
        })
      ]);

      toast.success('Banner order updated');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to update banner order');
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deals Banner Management</CardTitle>
            <CardDescription>
              Manage promotional banners displayed at the top of the Deals page
            </CardDescription>
          </div>
          <Button onClick={handleAddBanner} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No banners yet. Click "Add Banner" to create your first banner.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>PC Image</TableHead>
                <TableHead>Mobile Image</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner, index) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono">{banner.display_order}</span>
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => moveBanner(banner, 'up')}
                          disabled={index === 0 || isLoading}
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => moveBanner(banner, 'down')}
                          disabled={index === banners.length - 1 || isLoading}
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{banner.name}</TableCell>
                  <TableCell>
                    {banner.pc_image_url ? (
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-blue-600" />
                        <a
                          href={banner.pc_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {banner.mobile_image_url ? (
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-green-600" />
                        <a
                          href={banner.mobile_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No link</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBannerStatus(banner)}
                      disabled={isLoading}
                    >
                      {banner.is_active ? (
                        <>
                          <Eye className="h-4 w-4 mr-1 text-green-600" />
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-1 text-gray-400" />
                          <Badge variant="outline" className="bg-gray-50 text-gray-500">
                            Inactive
                          </Badge>
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBanner(banner)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBanner(banner)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Banner Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Deals Banner</DialogTitle>
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
                  PC Image (1440x392) - Optional
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
                  Mobile Image (767x500) - Optional
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewBanner} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Deals Banner</DialogTitle>
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
                  PC Image (1440x392) - Optional
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
                  Mobile Image (767x500) - Optional
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
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditBanner} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Banner Dialog */}
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
    </Card>
  );
}