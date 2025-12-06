import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  MapPin
} from "lucide-react";

interface Banner {
  id: string;
  name: string;
  link: string;
  pc_image_url: string;
  mobile_image_url: string;
  order: number;
}

interface RetailerPosition {
  id: string;
  positionNumber: number;
  retailerName: string;
  isActive: boolean;
  banners: Banner[];
  createdAt?: string;
  updatedAt?: string;
}

export function RetailerBannersAdmin() {
  const [positions, setPositions] = useState<RetailerPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<RetailerPosition | null>(null);

  // Form state for new retailer
  const [newRetailerName, setNewRetailerName] = useState("");
  const [newPositionNumber, setNewPositionNumber] = useState<number>(1);

  // Form state for editing/adding banners
  const [editingBanners, setEditingBanners] = useState<Banner[]>([]);
  const [editingRetailerName, setEditingRetailerName] = useState("");
  const [uploadingPcImage, setUploadingPcImage] = useState<number | null>(null);
  const [uploadingMobileImage, setUploadingMobileImage] = useState<number | null>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setIsLoading(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      setIsLoading(false);
      return;
    }

    const result = await AdminService.getRetailerBanners(accessToken);
    if (result.success && result.positions) {
      setPositions(result.positions);
    } else {
      toast.error(result.error || 'Failed to fetch retailer banners');
    }
    setIsLoading(false);
  };

  const getOccupiedPositions = () => {
    return positions.map(p => p.positionNumber);
  };

  const getAvailablePositions = () => {
    const occupied = getOccupiedPositions();
    return Array.from({ length: 20 }, (_, i) => i + 1).filter(n => !occupied.includes(n));
  };

  const handleCreateRetailer = async () => {
    if (!newRetailerName.trim()) {
      toast.error('Please enter a retailer name');
      return;
    }

    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    setIsLoading(true);

    const result = await AdminService.createRetailerBanner(accessToken, {
      positionNumber: newPositionNumber,
      retailerName: newRetailerName,
      banners: []
    });

    if (result.success) {
      toast.success('Retailer position created successfully');
      setShowAddDialog(false);
      setNewRetailerName("");
      setNewPositionNumber(1);
      fetchPositions();
    } else {
      toast.error(result.error || 'Failed to create retailer position');
    }

    setIsLoading(false);
  };

  const handleEditPosition = (position: RetailerPosition) => {
    setSelectedPosition(position);
    setEditingBanners([...position.banners]);
    setEditingRetailerName(position.retailerName);
    setShowEditDialog(true);
  };

  const handleAddBanner = () => {
    if (editingBanners.length >= 5) {
      toast.error('Maximum 5 banners per retailer');
      return;
    }

    const newBanner: Banner = {
      id: `temp-${Date.now()}`,
      name: "",
      link: "",
      pc_image_url: "",
      mobile_image_url: "",
      order: editingBanners.length + 1
    };

    setEditingBanners([...editingBanners, newBanner]);
  };

  const handleRemoveBanner = (index: number) => {
    const updated = editingBanners.filter((_, i) => i !== index);
    // Reorder remaining banners
    updated.forEach((banner, i) => {
      banner.order = i + 1;
    });
    setEditingBanners(updated);
  };

  const handleBannerChange = (index: number, field: keyof Banner, value: string) => {
    const updated = [...editingBanners];
    updated[index] = { ...updated[index], [field]: value };
    setEditingBanners(updated);
  };

  const handleImageUpload = async (index: number, file: File, imageType: 'pc' | 'mobile') => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    if (imageType === 'pc') {
      setUploadingPcImage(index);
    } else {
      setUploadingMobileImage(index);
    }

    const result = await AdminService.uploadBannerImage(accessToken, file, imageType);

    if (result.success && result.imageUrl) {
      const field = imageType === 'pc' ? 'pc_image_url' : 'mobile_image_url';
      handleBannerChange(index, field, result.imageUrl);
      toast.success(`${imageType.toUpperCase()} image uploaded successfully`);
    } else {
      toast.error(result.error || 'Failed to upload image');
    }

    if (imageType === 'pc') {
      setUploadingPcImage(null);
    } else {
      setUploadingMobileImage(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedPosition) return;

    // Validate retailer name
    if (!editingRetailerName.trim()) {
      toast.error('Retailer name is required');
      return;
    }

    // Validate banners
    for (const banner of editingBanners) {
      if (!banner.name.trim()) {
        toast.error('All banners must have a name');
        return;
      }
      if (!banner.link.trim()) {
        toast.error('All banners must have a link');
        return;
      }
      if (!banner.pc_image_url) {
        toast.error('All banners must have a PC image');
        return;
      }
      if (!banner.mobile_image_url) {
        toast.error('All banners must have a mobile image');
        return;
      }
    }

    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    setIsLoading(true);

    const result = await AdminService.updateRetailerBanner(accessToken, selectedPosition.id, {
      banners: editingBanners,
      retailerName: editingRetailerName
    });

    if (result.success) {
      toast.success('Retailer updated successfully');
      setShowEditDialog(false);
      setSelectedPosition(null);
      setEditingBanners([]);
      setEditingRetailerName("");
      fetchPositions();
    } else {
      toast.error(result.error || 'Failed to update retailer');
    }

    setIsLoading(false);
  };

  const handleToggleActive = async (position: RetailerPosition) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    setIsLoading(true);

    const result = await AdminService.updateRetailerBanner(accessToken, position.id, {
      isActive: !position.isActive
    });

    if (result.success) {
      toast.success(`Retailer ${!position.isActive ? 'shown' : 'hidden'}`);
      fetchPositions();
    } else {
      toast.error(result.error || 'Failed to update retailer');
    }

    setIsLoading(false);
  };

  const handleDeleteRetailer = async (position: RetailerPosition) => {
    if (!confirm(`Delete \"${position.retailerName}\" and all its banners?`)) {
      return;
    }

    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please log in');
      return;
    }

    setIsLoading(true);

    const result = await AdminService.deleteRetailerBanner(accessToken, position.id);

    if (result.success) {
      toast.success('Retailer deleted successfully');
      fetchPositions();
    } else {
      toast.error(result.error || 'Failed to delete retailer');
    }

    setIsLoading(false);
  };

  const filledCount = positions.filter(p => p.banners.length > 0).length;
  const availablePositions = getAvailablePositions();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Retailer Banners Management</CardTitle>
              <CardDescription>
                Manage 20 positions. Each retailer can have up to 5 banners with PC and mobile images.
              </CardDescription>
            </div>
            <Button onClick={() => {
              if (availablePositions.length === 0) {
                toast.error('All 20 positions are occupied');
                return;
              }
              setNewPositionNumber(availablePositions[0]);
              setShowAddDialog(true);
            }} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-1" />
              Add Retailer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div>
              <div className="text-2xl font-bold text-blue-600">{positions.length}</div>
              <div className="text-sm text-gray-600">Total Positions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{filledCount}</div>
              <div className="text-sm text-gray-600">Visible on Page</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{20 - positions.length}</div>
              <div className="text-sm text-gray-600">Available Positions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions List */}
      <div className="grid gap-4">
        {positions.map((position) => (
          <Card key={position.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      <MapPin className="h-3 w-3 mr-1" />
                      Position {position.positionNumber}
                    </Badge>
                    <CardTitle className="text-lg">{position.retailerName}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">
                    {position.banners.length} banner{position.banners.length !== 1 ? 's' : ''} / 5 maximum
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {position.isActive ? (
                    <Badge className="bg-green-600">
                      <Eye className="h-3 w-3 mr-1" />
                      Visible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(position)}
                    disabled={isLoading}
                  >
                    {position.isActive ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEditPosition(position)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Banners
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRetailer(position)}
                    disabled={isLoading}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            {position.banners.length > 0 && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {position.banners.map((banner, index) => (
                    <div key={banner.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">#{banner.order}. {banner.name}</div>
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </div>
                      <div className="text-xs text-gray-600 truncate">{banner.link}</div>
                      <div className="flex gap-2">
                        {banner.pc_image_url && (
                          <div className="flex-1">
                            <img 
                              src={banner.pc_image_url} 
                              alt={`${banner.name} PC`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <div className="text-xs text-center text-gray-500 mt-1">
                              <Monitor className="h-3 w-3 inline mr-1" />PC
                            </div>
                          </div>
                        )}
                        {banner.mobile_image_url && (
                          <div className="flex-1">
                            <img 
                              src={banner.mobile_image_url} 
                              alt={`${banner.name} Mobile`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <div className="text-xs text-center text-gray-500 mt-1">
                              <Smartphone className="h-3 w-3 inline mr-1" />Mobile
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {positions.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No retailers added yet. Click "Add Retailer" to create one.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Retailer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Retailer</DialogTitle>
            <DialogDescription>
              Create a new retailer position. You can add banners after creating it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Retailer Name *</Label>
              <Input
                placeholder="e.g. Key4.com"
                value={newRetailerName}
                onChange={(e) => setNewRetailerName(e.target.value)}
              />
            </div>

            <div>
              <Label>Position on Page *</Label>
              <Select 
                value={newPositionNumber.toString()} 
                onValueChange={(val) => setNewPositionNumber(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePositions.map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      Position {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {availablePositions.length} position{availablePositions.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRetailer} disabled={isLoading}>
              Create Retailer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banners Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Banners - {selectedPosition?.retailerName}</DialogTitle>
            <DialogDescription>
              Add up to 5 banners. Each banner needs a name, link, PC image, and mobile image.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Retailer Name Field */}
            <div>
              <Label>Retailer Name *</Label>
              <Input
                placeholder="e.g. Key4.com"
                value={editingRetailerName}
                onChange={(e) => setEditingRetailerName(e.target.value)}
              />
            </div>

            {/* Banners */}
            {editingBanners.map((banner, index) => (
              <Card key={banner.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Banner #{index + 1}</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveBanner(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Banner Name *</Label>
                      <Input
                        placeholder="e.g. Summer Sale"
                        value={banner.name}
                        onChange={(e) => handleBannerChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Redirect Link *</Label>
                      <Input
                        placeholder="https://..."
                        value={banner.link}
                        onChange={(e) => handleBannerChange(index, 'link', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>PC/Desktop Image *</Label>
                      {banner.pc_image_url ? (
                        <div className="relative">
                          <img 
                            src={banner.pc_image_url} 
                            alt="PC preview" 
                            className="w-full h-32 object-cover rounded border"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="mt-2"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleImageUpload(index, file, 'pc');
                              };
                              input.click();
                            }}
                            disabled={uploadingPcImage === index}
                          >
                            {uploadingPcImage === index ? 'Uploading...' : 'Replace'}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-32"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(index, file, 'pc');
                            };
                            input.click();
                          }}
                          disabled={uploadingPcImage === index}
                        >
                          {uploadingPcImage === index ? (
                            'Uploading...'
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload PC Image
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label>Mobile Image *</Label>
                      {banner.mobile_image_url ? (
                        <div className="relative">
                          <img 
                            src={banner.mobile_image_url} 
                            alt="Mobile preview" 
                            className="w-full h-32 object-cover rounded border"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="mt-2"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleImageUpload(index, file, 'mobile');
                              };
                              input.click();
                            }}
                            disabled={uploadingMobileImage === index}
                          >
                            {uploadingMobileImage === index ? 'Uploading...' : 'Replace'}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-32"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(index, file, 'mobile');
                            };
                            input.click();
                          }}
                          disabled={uploadingMobileImage === index}
                        >
                          {uploadingMobileImage === index ? (
                            'Uploading...'
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Mobile Image
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {editingBanners.length < 5 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddBanner}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Banner ({editingBanners.length} / 5)
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}