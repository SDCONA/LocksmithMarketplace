import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Store, Edit, Trash2, Plus, UserPlus, Power, Crown, Upload, Mail, Phone, Globe, ShieldCheck, X } from "lucide-react";
import { DealsService, AdminService } from "../../utils/services";
import { AuthService } from "../../utils/auth";

interface RetailerProfile {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  owner_user_id: string | null;
  daily_deal_limit: number;
  has_csv_permission: boolean;
  is_always_on_top: boolean;
  is_active: boolean;
}

export function RetailerProfilesAdmin() {
  const [profiles, setProfiles] = useState<RetailerProfile[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<RetailerProfile | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    logo_url: "",
    website_url: "",
    contact_email: "",
    contact_phone: "",
    owner_user_id: "",
    daily_deal_limit: 10,
    has_csv_permission: false,
    is_always_on_top: false,
    is_active: true,
  });
  
  const [transferEmail, setTransferEmail] = useState("");

  useEffect(() => {
    loadProfiles();
    loadUsers();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await DealsService.getRetailerProfiles();
      setProfiles(data);
    } catch (error) {
      console.error("Error loading retailer profiles:", error);
      toast.error("Failed to load retailer profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = await AuthService.getFreshToken();
      if (!token) return;
      const result = await AdminService.getUsers(token);
      if (result.success && result.users) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleCreate = async () => {
    try {
      const dataToSend = {
        ...formData,
        owner_user_id: formData.owner_user_id || null,
      };
      await DealsService.createRetailerProfile(dataToSend);
      toast.success("Retailer profile created successfully");
      setShowCreateDialog(false);
      resetForm();
      loadProfiles();
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast.error(error.message || "Failed to create retailer profile");
    }
  };

  const handleEdit = async () => {
    if (!selectedProfile) return;
    
    try {
      const dataToSend = {
        ...formData,
        owner_user_id: formData.owner_user_id || null,
      };
      await DealsService.updateRetailerProfile(selectedProfile.id, dataToSend);
      toast.success("Retailer profile updated successfully");
      setShowEditDialog(false);
      resetForm();
      loadProfiles();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update retailer profile");
    }
  };

  const handleDelete = async () => {
    if (!selectedProfile) return;
    
    try {
      await DealsService.deleteRetailerProfile(selectedProfile.id);
      toast.success("Retailer profile deleted successfully");
      setShowDeleteDialog(false);
      setSelectedProfile(null);
      loadProfiles();
    } catch (error: any) {
      console.error("Error deleting profile:", error);
      toast.error(error.message || "Failed to delete retailer profile");
    }
  };

  const handleTransfer = async () => {
    if (!selectedProfile || !transferEmail) return;
    
    try {
      await DealsService.transferRetailerProfile(selectedProfile.id, transferEmail);
      toast.success(`Profile transferred to ${transferEmail}`);
      setShowTransferDialog(false);
      setTransferEmail("");
      setSelectedProfile(null);
      loadProfiles();
    } catch (error: any) {
      console.error("Error transferring profile:", error);
      toast.error(error.message || "Failed to transfer profile");
    }
  };

  const handleRevoke = async (profileId: string) => {
    try {
      await DealsService.revokeRetailerProfile(profileId);
      toast.success("Profile ownership revoked");
      loadProfiles();
    } catch (error: any) {
      console.error("Error revoking profile:", error);
      toast.error(error.message || "Failed to revoke profile");
    }
  };

  const handleToggleActive = async (profileId: string, currentStatus: boolean) => {
    try {
      await DealsService.updateRetailerProfile(profileId, { is_active: !currentStatus });
      toast.success(currentStatus ? "Profile deactivated" : "Profile activated");
      loadProfiles();
    } catch (error: any) {
      console.error("Error toggling profile status:", error);
      toast.error(error.message || "Failed to update profile status");
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const openEditDialog = (profile: RetailerProfile) => {
    setSelectedProfile(profile);
    setFormData({
      company_name: profile.company_name,
      description: profile.description || "",
      logo_url: profile.logo_url || "",
      website_url: profile.website_url || "",
      contact_email: profile.contact_email || "",
      contact_phone: profile.contact_phone || "",
      owner_user_id: profile.owner_user_id || "",
      daily_deal_limit: profile.daily_deal_limit,
      has_csv_permission: profile.has_csv_permission,
      is_always_on_top: profile.is_always_on_top,
      is_active: profile.is_active,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (profile: RetailerProfile) => {
    setSelectedProfile(profile);
    setShowDeleteDialog(true);
  };

  const openTransferDialog = (profile: RetailerProfile) => {
    setSelectedProfile(profile);
    setTransferEmail("");
    setShowTransferDialog(true);
  };

  const resetForm = () => {
    setFormData({
      company_name: "",
      description: "",
      logo_url: "",
      website_url: "",
      contact_email: "",
      contact_phone: "",
      owner_user_id: "",
      daily_deal_limit: 10,
      has_csv_permission: false,
      is_always_on_top: false,
      is_active: true,
    });
    setSelectedProfile(null);
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Retailer Profiles
              </CardTitle>
              <CardDescription>
                Manage retailer accounts, permissions, and ownership
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex-1 flex items-center justify-end gap-2">
              <Badge variant="outline">{profiles.length} Total Profiles</Badge>
              <Badge variant="outline" className="bg-green-50">
                {profiles.filter(p => p.is_active).length} Active
              </Badge>
            </div>
          </div>

          {/* Profiles Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading profiles...
                    </TableCell>
                  </TableRow>
                ) : filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No retailer profiles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {profile.logo_url ? (
                            <img
                              src={profile.logo_url}
                              alt={profile.company_name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <Store className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{profile.company_name}</span>
                              {profile.is_always_on_top && (
                                <Crown className="h-4 w-4 text-yellow-500" title="Always on Top" />
                              )}
                            </div>
                            {profile.website_url && (
                              <a
                                href={profile.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {profile.website_url}
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {profile.contact_email && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="h-3 w-3" />
                              {profile.contact_email}
                            </div>
                          )}
                          {profile.contact_phone && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="h-3 w-3" />
                              {profile.contact_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {profile.owner_user_id ? (
                          <div className="space-y-1">
                            <Badge variant="outline" className="bg-blue-50">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Assigned
                            </Badge>
                            {users.find(u => u.id === profile.owner_user_id) && (
                              <p className="text-xs text-gray-600">
                                {users.find(u => u.id === profile.owner_user_id)?.email}
                              </p>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevoke(profile.id)}
                              className="h-6 text-xs"
                            >
                              Revoke
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTransferDialog(profile)}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>
                            Daily: {profile.daily_deal_limit === 0 ? "Unlimited" : profile.daily_deal_limit}
                          </div>
                          {profile.has_csv_permission && (
                            <Badge variant="outline" className="bg-purple-50 text-xs">
                              <Upload className="h-3 w-3 mr-1" />
                              CSV
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={profile.is_active}
                            onCheckedChange={() => handleToggleActive(profile.id, profile.is_active)}
                          />
                          <Badge variant={profile.is_active ? "default" : "secondary"}>
                            {profile.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(profile)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(profile)}
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
              {showEditDialog ? "Edit Retailer Profile" : "Create Retailer Profile"}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog
                ? "Update retailer information and permissions"
                : "Create a new retailer profile with permissions and limits"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g., Auto Parts Plus"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the retailer"
                rows={3}
              />
            </div>

            {/* Owner User */}
            <div>
              <Label htmlFor="owner_user_id">Owner User (Optional)</Label>
              <select
                id="owner_user_id"
                value={formData.owner_user_id}
                onChange={(e) => setFormData({ ...formData, owner_user_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No owner assigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} {user.firstName && `(${user.firstName} ${user.lastName})`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Assign this retailer profile to a user account
              </p>
            </div>

            {/* Logo URL */}
            <div>
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@retailer.com"
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Website URL */}
            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://www.retailer.com"
              />
            </div>

            {/* Daily Deal Limit */}
            <div>
              <Label htmlFor="daily_deal_limit">Daily Deal Limit</Label>
              <Input
                id="daily_deal_limit"
                type="number"
                min="0"
                value={formData.daily_deal_limit}
                onChange={(e) => setFormData({ ...formData, daily_deal_limit: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Set to 0 for unlimited deals per day
              </p>
            </div>

            {/* Permissions */}
            <div className="space-y-3 pt-4 border-t">
              <Label>Permissions & Settings</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="has_csv_permission">CSV Upload Permission</Label>
                  <p className="text-xs text-gray-500">Allow bulk deal uploads via CSV</p>
                </div>
                <Switch
                  id="has_csv_permission"
                  checked={formData.has_csv_permission}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_csv_permission: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_always_on_top">Always on Top</Label>
                  <p className="text-xs text-gray-500">Pin deals to the top of the list</p>
                </div>
                <Switch
                  id="is_always_on_top"
                  checked={formData.is_always_on_top}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_always_on_top: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-xs text-gray-500">Show this retailer's deals publicly</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
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
              {showEditDialog ? "Update Profile" : "Create Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={(open) => {
        if (!open) {
          setShowTransferDialog(false);
          setTransferEmail("");
          setSelectedProfile(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Profile Ownership</DialogTitle>
            <DialogDescription>
              Assign this profile to a registered user by entering their email address
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="transfer_email">User Email Address</Label>
              <Input
                id="transfer_email"
                type="email"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                placeholder="user@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                User must already be registered in the system
              </p>
            </div>

            {selectedProfile && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Profile: {selectedProfile.company_name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  The user will be able to manage this profile and create deals within the set limits.
                  You will retain full admin control.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTransferDialog(false);
                setTransferEmail("");
                setSelectedProfile(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={!transferEmail}>
              Transfer Ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Retailer Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedProfile?.company_name}</strong> and all associated deals.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProfile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}