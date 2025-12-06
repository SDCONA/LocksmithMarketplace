import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { AdminService } from "../utils/services";
import { AuthService } from "../utils/auth";
import { 
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface Banner {
  id: string;
  name: string;
  retailer: string;
  link: string;
  imageUrl: string;
  status: string;
}

interface BannerPosition {
  id: string;
  positionNumber: number;
  positionName: string;
  banners: Banner[];
  updatedAt?: string;
}

export function BannerPositionsAdmin() {
  const [positions, setPositions] = useState<BannerPosition[]>([]);
  const [availableBanners, setAvailableBanners] = useState<Banner[]>([]);
  const [openPositions, setOpenPositions] = useState<Set<number>>(new Set());
  const [showAddBannerDialog, setShowAddBannerDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<BannerPosition | null>(null);
  const [selectedBannerId, setSelectedBannerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize 20 positions
  useEffect(() => {
    fetchBannerPositions();
    fetchAvailableBanners();
  }, []);

  const fetchBannerPositions = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;

    const result = await AdminService.getBannerPositions(accessToken);
    if (result.success && result.positions) {
      setPositions(result.positions);
    } else {
      // Initialize empty positions if none exist
      const emptyPositions: BannerPosition[] = Array.from({ length: 20 }, (_, i) => ({
        id: `position-${i + 1}`,
        positionNumber: i + 1,
        positionName: `Position ${i + 1}`,
        banners: []
      }));
      setPositions(emptyPositions);
    }
  };

  const fetchAvailableBanners = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;

    const result = await AdminService.getBanners(accessToken);
    if (result.success && result.banners) {
      setAvailableBanners(result.banners.filter((b: Banner) => b.status === 'active'));
    }
  };

  const togglePosition = (positionNumber: number) => {
    setOpenPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(positionNumber)) {
        newSet.delete(positionNumber);
      } else {
        newSet.add(positionNumber);
      }
      return newSet;
    });
  };

  const handleAddBanner = (position: BannerPosition) => {
    if (position.banners.length >= 5) {
      toast.error('Maximum 5 banners per position');
      return;
    }
    setSelectedPosition(position);
    setSelectedBannerId("");
    setShowAddBannerDialog(true);
  };

  const handleRemoveBanner = async (position: BannerPosition, bannerId: string) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;

    setIsLoading(true);
    
    const updatedBanners = position.banners.filter(b => b.id !== bannerId);
    
    const result = await AdminService.updateBannerPosition(accessToken, position.id, {
      positionNumber: position.positionNumber,
      positionName: position.positionName,
      banners: updatedBanners
    });

    if (result.success) {
      toast.success('Banner removed from position');
      fetchBannerPositions();
    } else {
      toast.error(result.error || 'Failed to remove banner');
    }
    
    setIsLoading(false);
  };

  const handleSaveAddBanner = async () => {
    if (!selectedPosition || !selectedBannerId) {
      toast.error('Please select a banner');
      return;
    }

    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;

    const bannerToAdd = availableBanners.find(b => b.id === selectedBannerId);
    if (!bannerToAdd) {
      toast.error('Banner not found');
      return;
    }

    // Check if banner already exists in this position
    if (selectedPosition.banners.some(b => b.id === selectedBannerId)) {
      toast.error('Banner already in this position');
      return;
    }

    setIsLoading(true);

    const updatedBanners = [...selectedPosition.banners, bannerToAdd];

    const result = await AdminService.updateBannerPosition(accessToken, selectedPosition.id, {
      positionNumber: selectedPosition.positionNumber,
      positionName: selectedPosition.positionName,
      banners: updatedBanners
    });

    if (result.success) {
      toast.success('Banner added to position');
      fetchBannerPositions();
      setShowAddBannerDialog(false);
      setSelectedPosition(null);
      setSelectedBannerId("");
    } else {
      toast.error(result.error || 'Failed to add banner');
    }

    setIsLoading(false);
  };

  const handleClearPosition = async (position: BannerPosition) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;

    if (!confirm(`Clear all banners from ${position.positionName}?`)) {
      return;
    }

    setIsLoading(true);

    const result = await AdminService.updateBannerPosition(accessToken, position.id, {
      positionNumber: position.positionNumber,
      positionName: position.positionName,
      banners: []
    });

    if (result.success) {
      toast.success('Position cleared');
      fetchBannerPositions();
    } else {
      toast.error(result.error || 'Failed to clear position');
    }

    setIsLoading(false);
  };

  const filledPositionsCount = positions.filter(p => p.banners.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Positions Management</CardTitle>
          <CardDescription>
            Manage 20 banner positions for the retailers page. Each position can hold up to 5 banners.
            Only positions with at least 1 banner will be visible on the retailers page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filledPositionsCount}</div>
              <div className="text-sm text-gray-600">Active Positions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{20 - filledPositionsCount}</div>
              <div className="text-sm text-gray-600">Empty Positions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{availableBanners.length}</div>
              <div className="text-sm text-gray-600">Available Banners</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions List */}
      <div className="space-y-3">
        {positions.map((position) => {
          const isOpen = openPositions.has(position.positionNumber);
          const isEmpty = position.banners.length === 0;
          
          return (
            <Card key={position.id} className={isEmpty ? "bg-gray-50" : ""}>
              <Collapsible open={isOpen} onOpenChange={() => togglePosition(position.positionNumber)}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <div>
                        <CardTitle className="text-base">
                          Position {position.positionNumber}
                        </CardTitle>
                        <CardDescription>
                          {position.banners.length} / 5 banners
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isEmpty && (
                        <Badge variant="outline" className="text-gray-500">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Visible
                        </Badge>
                      )}
                      {!isEmpty && (
                        <Badge className="bg-green-600">
                          ✓ Visible on Page
                        </Badge>
                      )}
                      {position.banners.length < 5 && (
                        <Button
                          size="sm"
                          onClick={() => handleAddBanner(position)}
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Banner
                        </Button>
                      )}
                      {position.banners.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleClearPosition(position)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent>
                    {position.banners.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No banners in this position</p>
                        <p className="text-sm">This position will not be visible on the retailers page</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {position.banners.map((banner, index) => (
                          <div key={banner.id} className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                            <div className="text-sm font-medium text-gray-500 w-8">#{index + 1}</div>
                            <div className="w-32 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={banner.imageUrl} 
                                alt={banner.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{banner.name}</div>
                              <div className="text-sm text-gray-600 truncate">{banner.retailer}</div>
                              <div className="text-xs text-blue-600 truncate">{banner.link}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveBanner(position, banner.id)}
                              disabled={isLoading}
                              className="flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Add Banner Dialog */}
      <Dialog open={showAddBannerDialog} onOpenChange={setShowAddBannerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Banner to {selectedPosition?.positionName}</DialogTitle>
            <DialogDescription>
              Select a banner to add to this position ({selectedPosition?.banners.length || 0} / 5 banners)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Banner</Label>
              <Select value={selectedBannerId} onValueChange={setSelectedBannerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a banner..." />
                </SelectTrigger>
                <SelectContent>
                  {availableBanners.map((banner) => (
                    <SelectItem key={banner.id} value={banner.id}>
                      {banner.name} - {banner.retailer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBannerId && (
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Preview:</div>
                {(() => {
                  const banner = availableBanners.find(b => b.id === selectedBannerId);
                  return banner ? (
                    <div>
                      <div className="w-full h-24 bg-gray-100 rounded overflow-hidden mb-2">
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-sm text-gray-600">{banner.name}</div>
                      <div className="text-xs text-gray-500">{banner.retailer}</div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBannerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddBanner} disabled={!selectedBannerId || isLoading}>
              Add Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}