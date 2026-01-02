import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  ArrowLeft,
  TrendingUp,
  Eye,
  Star,
  Zap,
  Crown,
  Target,
  DollarSign,
  Calendar,
  Clock,
  Users,
  MessageCircle,
  Heart,
  Share2,
  BarChart3,
  CreditCard,
  Wallet,
  Settings,
  Play,
  Pause,
  StopCircle,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Filter,
  Search,
  RefreshCw,
  Download,
  Plus,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react";

interface PromotePageProps {
  user: any;
  onBack: () => void;
  userListings: any[];
  onViewListing: (listing: any) => void;
  onEditListing: (listing: any) => void;
}

interface ActivePromotion {
  id: string;
  listingId: string;
  startDate: string;
  endDate: string;
  duration: number;
  dailyAmount: number;
  totalBudget: number;
  spent: number;
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  performance: {
    views: number;
    clicks: number;
    messages: number;
    favorites: number;
    impressions: number;
    ctr: number;
  };
}

// Mock data for active promotions - RESET: Empty array
const mockActivePromotions: ActivePromotion[] = [];

export function PromotePage({ user, onBack, userListings, onViewListing, onEditListing }: PromotePageProps) {
  const [selectedTab, setSelectedTab] = useState('promote');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [promotionDuration, setPromotionDuration] = useState([7]);
  const [dailyAmount, setDailyAmount] = useState([10]);
  const [autoRenew, setAutoRenew] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activePromotions, setActivePromotions] = useState<ActivePromotion[]>(mockActivePromotions);
  const [totalBudget, setTotalBudget] = useState(0); // RESET
  const [usedBudget, setUsedBudget] = useState(0); // RESET

  // Filter user listings for promotion
  const availableListings = userListings.filter(listing => 
    !activePromotions.some(promo => promo.listingId === listing.id && promo.status === 'active')
  );

  // Filter active promotions
  const filteredPromotions = activePromotions.filter(promo => {
    const listing = userListings.find(l => l.id === promo.listingId);
    if (!listing) return false;
    
    const matchesSearch = searchTerm === '' || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalCost = dailyAmount[0] * promotionDuration[0];

  const handlePromoteListing = () => {
    if (selectedListings.length === 0) return;
    
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = () => {
    // Create new promotions for selected listings
    const newPromotions = selectedListings.map(listingId => ({
      id: `promo_${Date.now()}_${listingId}`,
      listingId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + promotionDuration[0] * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: promotionDuration[0],
      dailyAmount: dailyAmount[0],
      totalBudget: totalCost,
      spent: 0,
      status: 'active' as const,
      performance: {
        views: 0,
        clicks: 0,
        messages: 0,
        favorites: 0,
        impressions: 0,
        ctr: 0
      }
    }));

    setActivePromotions([...activePromotions, ...newPromotions]);
    setUsedBudget(prev => prev + (totalCost * selectedListings.length));
    setSelectedListings([]);
    setShowPaymentDialog(false);
    setSelectedTab('active');
  };

  const handlePausePromotion = (promotionId: string) => {
    setActivePromotions(prev =>
      prev.map(promo =>
        promo.id === promotionId ? { ...promo, status: 'paused' as const } : promo
      )
    );
  };

  const handleResumePromotion = (promotionId: string) => {
    setActivePromotions(prev =>
      prev.map(promo =>
        promo.id === promotionId ? { ...promo, status: 'active' as const } : promo
      )
    );
  };

  const handleStopPromotion = (promotionId: string) => {
    setActivePromotions(prev =>
      prev.map(promo =>
        promo.id === promotionId ? { ...promo, status: 'completed' as const } : promo
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {/* Budget Overview */}
            <Card className="w-64">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Budget</span>
                  <Wallet className="h-4 w-4 text-gray-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: ${usedBudget}</span>
                    <span>Total: ${totalBudget}</span>
                  </div>
                  <Progress value={(usedBudget / totalBudget) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="promote">Promote</TabsTrigger>
            <TabsTrigger value="active">
              Active
              {activePromotions.filter(p => p.status === 'active').length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {activePromotions.filter(p => p.status === 'active').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Payment</TabsTrigger>
          </TabsList>

          {/* Promote Tab */}
          <TabsContent value="promote" className="space-y-6">
            {/* Promotion Packages */}
            {/* Promotion Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Promotion Settings</CardTitle>
                <CardDescription>Configure your listing promotion duration and daily budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Duration Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Duration: {promotionDuration[0]} days
                    </label>
                    <Slider
                      value={promotionDuration}
                      onValueChange={setPromotionDuration}
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 day</span>
                      <span>30 days</span>
                    </div>
                  </div>

                  {/* Daily Amount Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Daily Amount: ${dailyAmount[0]}
                    </label>
                    <Slider
                      value={dailyAmount}
                      onValueChange={setDailyAmount}
                      max={1000}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>$1/day</span>
                      <span>$1000/day</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div>
                      <div className="font-medium text-blue-900">Total Cost</div>
                      <div className="text-sm text-blue-700">
                        ${dailyAmount[0]} × {promotionDuration[0]} days
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      ${totalCost}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-renew"
                      checked={autoRenew}
                      onCheckedChange={setAutoRenew}
                    />
                    <label htmlFor="auto-renew" className="text-sm">
                      Auto-renew this promotion when it expires
                    </label>
                  </div>

                  {/* Save Settings Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={() => {
                        // Save promotion settings for current listing
                        // Show success message
                        alert('Promotion settings saved successfully! You can now promote your selected listings with these settings.');
                      }}
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Promote Button */}
            {selectedListings.length > 0 && (
              <div className="flex justify-center">
                <Button 
                  onClick={handlePromoteListing}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Promote {selectedListings.length} Listing{selectedListings.length > 1 ? 's' : ''} for ${totalCost * selectedListings.length}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Active Campaigns Tab */}
          <TabsContent value="active" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search your promotions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Promotions List */}
            <div className="space-y-4">
              {filteredPromotions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No promotions found</h3>
                    <p className="text-gray-600 mb-4">
                      {activePromotions.length === 0 
                        ? "You don't have any active promotions yet."
                        : "No promotions match your current filters."
                      }
                    </p>
                    <Button 
                      onClick={() => setSelectedTab('promote')}
                      variant="outline"
                    >
                      Create Promotion
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredPromotions.map((promo) => {
                  const listing = userListings.find(l => l.id === promo.listingId);
                  if (!listing) return null;

                  const progressPercentage = (promo.spent / promo.totalBudget) * 100;
                  const isActive = promo.status === 'active';
                  const isPaused = promo.status === 'paused';
                  const isCompleted = promo.status === 'completed';

                  return (
                    <Card key={promo.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex space-x-4">
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge 
                                  variant={isActive ? 'default' : isPaused ? 'secondary' : 'outline'}
                                  className="text-xs bg-blue-100 text-blue-800"
                                >
                                  ${promo.dailyAmount}/day
                                </Badge>
                                <Badge 
                                  variant={
                                    isActive ? 'default' : 
                                    isPaused ? 'secondary' : 
                                    isCompleted ? 'outline' : 'default'
                                  }
                                  className={
                                    isActive ? 'bg-green-100 text-green-800' :
                                    isPaused ? 'bg-yellow-100 text-yellow-800' :
                                    isCompleted ? 'bg-gray-100 text-gray-800' : ''
                                  }
                                >
                                  {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                {promo.startDate} - {promo.endDate} ({promo.duration} days)
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePausePromotion(promo.id)}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                            )}
                            {isPaused && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResumePromotion(promo.id)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Resume
                              </Button>
                            )}
                            {(isActive || isPaused) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStopPromotion(promo.id)}
                              >
                                <StopCircle className="h-4 w-4 mr-1" />
                                Stop
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewListing(listing)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Budget Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Budget Spent</span>
                            <span>${promo.spent} / ${promo.totalBudget}</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold">{promo.performance.views.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Views</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold">{promo.performance.clicks}</div>
                            <div className="text-xs text-gray-600">Clicks</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold">{promo.performance.messages}</div>
                            <div className="text-xs text-gray-600">Messages</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold">{promo.performance.favorites}</div>
                            <div className="text-xs text-gray-600">Favorites</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold">{promo.performance.impressions.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Impressions</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold">{promo.performance.ctr.toFixed(2)}%</div>
                            <div className="text-xs text-gray-600">CTR</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overview Cards */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold">${usedBudget}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold">1,703</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Messages</p>
                      <p className="text-2xl font-bold">17</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg. CTR</p>
                      <p className="text-2xl font-bold">2.66%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Track your promotion performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Performance charts will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">


            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment information for promotions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Credit Card */}
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <CreditCard className="h-6 w-6 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-600">Expires 12/26</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  
                  {/* PayPal */}
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">PayPal Account</p>
                      <p className="text-sm text-gray-600">user@example.com</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  
                  {/* Add Payment Method */}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Promotion Purchase</DialogTitle>
            <DialogDescription>
              Review your promotion details before confirming
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Promotion Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Daily Amount:</span>
                  <span>${dailyAmount[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{promotionDuration[0]} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per listing:</span>
                  <span>${totalCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Listings:</span>
                  <span>{selectedListings.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Cost:</span>
                  <span>${totalCost * selectedListings.length}</span>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your promotion will start immediately and run for {promotionDuration[0]} days.
                {autoRenew && " Auto-renewal is enabled."}
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleConfirmPayment}
              >
                Confirm Purchase
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}