import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { clearProductCache, getCachedSearches } from "../utils/api";
import { AdminService } from "../utils/services";
import { AuthService } from "../utils/auth";
import { projectId } from "../utils/supabase/info";
import { 
  Users, 
  UserCircle, 
  Store, 
  Image as ImageIcon,
  Search, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  XCircle,
  Upload,
  Eye,
  ShieldCheck,
  Activity,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  FileText,
  X,
  Plus,
  Car,
  Database,
  Download,
  Save,
  Bell,
  BookOpen
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { BannerPositionsAdmin } from "./BannerPositionsAdmin";
import { RetailerBannersAdmin } from "./RetailerBannersAdmin";
import { PromotionalBannersAdmin } from "./PromotionalBannersAdmin";
import { RetailerProfilesAdmin } from "./deals/RetailerProfilesAdmin";
import { DealsManagementAdmin } from "./deals/DealsManagementAdmin";
import { ReportService, Report, ReportDetails, ReportUser } from "../utils/services/reports";

interface AdminPageProps {
  onBack: () => void;
}

// Mock data - RESET: Empty array
const mockUsers = [];

const mockRetailers = [];

const mockBanners = [];

export function AdminPage({ onBack }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // User management state
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  
  // Retailer management state
  const [retailers, setRetailers] = useState(mockRetailers);
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null);
  const [showEditRetailerDialog, setShowEditRetailerDialog] = useState(false);
  const [showDeleteRetailerDialog, setShowDeleteRetailerDialog] = useState(false);
  const [showAddRetailerDialog, setShowAddRetailerDialog] = useState(false);
  
  // Banner management state
  const [banners, setBanners] = useState(mockBanners);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [showEditBannerDialog, setShowEditBannerDialog] = useState(false);
  const [showDeleteBannerDialog, setShowDeleteBannerDialog] = useState(false);
  const [showAddBannerDialog, setShowAddBannerDialog] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  // Vehicle database state
  const [vehicleFile, setVehicleFile] = useState<File | null>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Reports management state
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(null);
  const [showReportDetailsDialog, setShowReportDetailsDialog] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [loadingReportDetails, setLoadingReportDetails] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'warn' | 'dismiss'>('delete');
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [takingAction, setTakingAction] = useState(false);

  // Policy management state
  const [termsContent, setTermsContent] = useState<string>('');
  const [privacyContent, setPrivacyContent] = useState<string>('');
  const [notifyUsers, setNotifyUsers] = useState<boolean>(false);
  const [policyLastUpdated, setPolicyLastUpdated] = useState<string>('');
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadRetailers();
    loadBanners();
    loadReports();
    loadPolicies();
  }, []);

  const loadUsers = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;
    
    const result = await AdminService.getUsers(accessToken);
    if (result.success && result.users) {
      setUsers(result.users);
    }
  };

  const loadRetailers = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;
    
    const result = await AdminService.getRetailers(accessToken);
    console.log('Load retailers result:', result);
    if (result.success && result.retailers) {
      console.log('Setting retailers:', result.retailers);
      setRetailers(result.retailers);
    }
  };

  const loadBanners = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;
    
    const result = await AdminService.getBanners(accessToken);
    console.log('Load banners result:', result);
    if (result.success && result.banners) {
      console.log('Setting banners:', result.banners);
      setBanners(result.banners);
    }
  };

  const loadReports = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;
    
    const result = await ReportService.getAllReports(accessToken);
    if (result.success && result.reports) {
      setReports(result.reports);
    }
  };

  const loadPolicies = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;
    
    const result = await AdminService.getPolicies(accessToken);
    if (result.success && result.policies) {
      setTermsContent(result.policies.terms || '');
      setPrivacyContent(result.policies.privacy || '');
      setPolicyLastUpdated(result.policies.lastUpdated || '');
    }
  };

  // Policy actions
  const handleSavePolicies = async () => {
    setIsSavingPolicy(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      setIsSavingPolicy(false);
      return;
    }

    const result = await AdminService.savePolicies(accessToken, {
      terms: termsContent,
      privacy: privacyContent,
      notifyUsers
    });

    if (result.success) {
      setPolicyLastUpdated(new Date().toLocaleString());
      toast.success(notifyUsers 
        ? 'Policies saved and users will be notified!' 
        : 'Policies saved successfully!');
      setNotifyUsers(false);
    } else {
      toast.error(result.error || 'Failed to save policies');
    }
    setIsSavingPolicy(false);
  };

  // User actions
  const handleToggleUserStatus = async (userId: string) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const user = users.find(u => u.id === userId);
    const newStatus = user?.status === "active";
    
    const result = await AdminService.updateUserStatus(accessToken, userId, newStatus);
    if (result.success) {
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, status: newStatus ? "suspended" : "active" }
          : u
      ));
      toast.success(`User ${newStatus ? "suspended" : "activated"}`);
    } else {
      toast.error(result.error || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const result = await AdminService.updateUserStatus(accessToken, selectedUser.id, true, 'Deleted by admin');
    if (result.success) {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      toast.success("User deleted successfully");
    } else {
      toast.error(result.error || 'Failed to delete user');
    }
    setShowDeleteUserDialog(false);
    setSelectedUser(null);
  };

  const handleToggleAdminStatus = async (userId: string, currentAdminStatus: boolean) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const newAdminStatus = !currentAdminStatus;
    
    const result = await AdminService.toggleAdminStatus(accessToken, userId, newAdminStatus);
    
    if (result.success) {
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, isAdmin: newAdminStatus }
          : u
      ));
      toast.success(`User ${newAdminStatus ? 'promoted to admin' : 'demoted from admin'}`);
      await loadUsers(); // Reload to get fresh data
    } else {
      toast.error(result.error || 'Failed to update admin status');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const result = await AdminService.updateUserStatus(accessToken, selectedUser.id, selectedUser.status === 'suspended');
    if (result.success) {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
      toast.success("User updated successfully");
    } else {
      toast.error(result.error || 'Failed to update user');
    }
    setShowEditUserDialog(false);
    setSelectedUser(null);
  };

  // Retailer actions
  const handleAddRetailer = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const result = await AdminService.saveRetailer(accessToken, selectedRetailer);
    if (result.success && result.retailer) {
      setRetailers([...retailers, result.retailer]);
      toast.success("Retailer added successfully");
    } else {
      toast.error(result.error || 'Failed to add retailer');
    }
    setShowAddRetailerDialog(false);
    setSelectedRetailer(null);
  };

  const handleUpdateRetailer = async () => {
    if (!selectedRetailer) return;
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const result = await AdminService.saveRetailer(accessToken, selectedRetailer);
    if (result.success && result.retailer) {
      setRetailers(retailers.map(retailer => 
        retailer.id === selectedRetailer.id ? result.retailer : retailer
      ));
      toast.success("Retailer updated successfully");
    } else {
      toast.error(result.error || 'Failed to update retailer');
    }
    setShowEditRetailerDialog(false);
    setSelectedRetailer(null);
  };

  const handleDeleteRetailer = () => {
    if (selectedRetailer) {
      setRetailers(retailers.filter(retailer => retailer.id !== selectedRetailer.id));
      toast.success("Retailer deleted successfully");
      setShowDeleteRetailerDialog(false);
      setSelectedRetailer(null);
    }
  };

  const handleToggleRetailerStatus = async (retailerId: string) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const retailer = retailers.find(r => r.id === retailerId);
    if (!retailer) return;

    const updatedRetailer = {
      ...retailer,
      status: retailer.status === "active" ? "inactive" : "active"
    };

    const result = await AdminService.saveRetailer(accessToken, updatedRetailer);
    if (result.success) {
      setRetailers(retailers.map(r => 
        r.id === retailerId ? updatedRetailer : r
      ));
      toast.success(`Retailer ${retailer.status === "active" ? "deactivated" : "activated"}`);
    } else {
      toast.error(result.error || 'Failed to update retailer status');
    }
  };

  // Banner actions
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const handleAddBanner = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const bannerData = {
      name: selectedBanner.name,
      retailer: selectedBanner.retailer,
      imageUrl: bannerFile ? URL.createObjectURL(bannerFile) : "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=400&fit=crop",
      link: selectedBanner.link,
      status: "active"
    };

    const result = await AdminService.saveBanner(accessToken, bannerData);
    if (result.success && result.banner) {
      setBanners([...banners, result.banner]);
      toast.success("Banner uploaded successfully");
    } else {
      toast.error(result.error || 'Failed to add banner');
    }
    setShowAddBannerDialog(false);
    setSelectedBanner(null);
    setBannerFile(null);
  };

  const handleUpdateBanner = async () => {
    if (!selectedBanner) return;
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const updatedBanner = {
      ...selectedBanner,
      imageUrl: bannerFile ? URL.createObjectURL(bannerFile) : selectedBanner.imageUrl
    };

    const result = await AdminService.saveBanner(accessToken, updatedBanner);
    if (result.success && result.banner) {
      setBanners(banners.map(banner => 
        banner.id === selectedBanner.id ? result.banner : banner
      ));
      toast.success("Banner updated successfully");
    } else {
      toast.error(result.error || 'Failed to update banner');
    }
    setShowEditBannerDialog(false);
    setSelectedBanner(null);
    setBannerFile(null);
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    // Note: AdminService doesn't have deleteBanner, so just remove from local state
    setBanners(banners.filter(banner => banner.id !== selectedBanner.id));
    toast.success("Banner deleted successfully");
    setShowDeleteBannerDialog(false);
    setSelectedBanner(null);
  };

  const handleToggleBannerStatus = async (bannerId: string) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const banner = banners.find(b => b.id === bannerId);
    if (!banner) return;

    const updatedBanner = {
      ...banner,
      status: banner.status === "active" ? "inactive" : "active"
    };

    const result = await AdminService.saveBanner(accessToken, updatedBanner);
    if (result.success) {
      setBanners(banners.map(b => 
        b.id === bannerId ? updatedBanner : b
      ));
      toast.success(`Banner ${banner.status === "active" ? "deactivated" : "activated"}`);
    } else {
      toast.error(result.error || 'Failed to update banner status');
    }
  };

  // Vehicle database actions
  const handleVehicleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        toast.error("Please upload a valid JSON file");
        return;
      }
      setVehicleFile(file);
      
      // Read and parse the JSON file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          
          // Log the structure for debugging
          console.log("Uploaded JSON structure:", Object.keys(json));
          
          // Validate JSON structure
          if (!json.metadata || !json.yearRanges) {
            const missing = [];
            if (!json.metadata) missing.push("metadata");
            if (!json.yearRanges) missing.push("yearRanges");
            toast.error(`Invalid JSON structure. Missing: ${missing.join(", ")}. Your file needs vehicle data in 'yearRanges' key.`);
            setVehicleFile(null);
            setUploadStatus("");
            return;
          }
          
          // Validate metadata - yearRange can be string or object
          if (!json.metadata.version) {
            toast.error("Invalid metadata. Missing: version");
            setVehicleFile(null);
            setUploadStatus("");
            return;
          }
          
          // Normalize yearRange if it's a string format (e.g., "1950-2026")
          if (typeof json.metadata.yearRange === 'string') {
            const [min, max] = json.metadata.yearRange.split('-').map(Number);
            if (min && max) {
              json.metadata.yearRange = { min, max };
            }
          }
          
          // Validate yearRange exists in some form
          if (!json.metadata.yearRange) {
            toast.error("Invalid metadata. Missing: yearRange");
            setVehicleFile(null);
            setUploadStatus("");
            return;
          }
          
          // Validate at least one yearRange exists
          if (Object.keys(json.yearRanges).length === 0) {
            toast.error("No year ranges found in database");
            setVehicleFile(null);
            setUploadStatus("");
            return;
          }

          // Validate each year range structure
          for (const [range, data] of Object.entries(json.yearRanges)) {
            const rangeData = data as any;
            if (!rangeData.makes || !Array.isArray(rangeData.makes)) {
              toast.error(`Year range ${range} missing makes array`);
              setVehicleFile(null);
              setUploadStatus("");
              return;
            }
            if (!rangeData.models || typeof rangeData.models !== 'object') {
              toast.error(`Year range ${range} missing models object`);
              setVehicleFile(null);
              setUploadStatus("");
              return;
            }
          }
          
          setVehicleData(json);
          setUploadStatus(`File loaded successfully! Found ${Object.keys(json.yearRanges).length} year ranges. Click 'Upload Database' to save.`);
          toast.success("File validated successfully");
        } catch (error) {
          console.error("JSON parse error:", error);
          toast.error(`Invalid JSON file format: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setVehicleFile(null);
          setUploadStatus("");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadVehicleDatabase = async () => {
    if (vehicleData) {
      try {
        const token = await AuthService.getFreshToken();
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/vehicle-database`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ vehicleData })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to upload vehicle database');
        }

        toast.success("Vehicle database uploaded to server successfully!");
        setVehicleFile(null);
        setUploadStatus("Database uploaded successfully!");
        
        // Trigger a custom event to notify VehicleSelector to refresh
        window.dispatchEvent(new CustomEvent('vehicleDatabaseUpdated'));
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to upload vehicle database");
      }
    }
  };

  const handleDownloadCurrentDatabase = async () => {
    try {
      // Fetch from backend database first
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/vehicle-database`);
      let dataToDownload;
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.vehicleData) {
          dataToDownload = result.vehicleData;
        } else {
          // Fallback to default if no database uploaded yet
          const { getDefaultVehicleData } = await import('../utils/vehicle-data');
          dataToDownload = getDefaultVehicleData();
        }
      } else {
        // Fallback to embedded default
        const { getDefaultVehicleData } = await import('../utils/vehicle-data');
        dataToDownload = getDefaultVehicleData();
      }
      
      const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vehicle-database-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Database downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download database");
    }
  };

  const handleResetDatabase = async () => {
    try {
      const token = await AuthService.getFreshToken();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/vehicle-database`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset vehicle database');
      }

      setVehicleData(null);
      setVehicleFile(null);
      setUploadStatus("");
      toast.success("Database reset to default. The app will now use the embedded vehicle database.");
      
      // Trigger a custom event to notify VehicleSelector to refresh
      window.dispatchEvent(new CustomEvent('vehicleDatabaseUpdated'));
    } catch (error) {
      console.error("Reset error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reset vehicle database");
    }
  };

  const handleInitializeDefaultDatabase = async () => {
    try {
      // Load the default vehicle data
      const { getDefaultVehicleData } = await import('../utils/vehicle-data');
      const defaultData = getDefaultVehicleData();
      
      const token = await AuthService.getFreshToken();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/admin/vehicle-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vehicleData: defaultData })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize vehicle database');
      }

      toast.success("Default vehicle database (1950-2026) initialized successfully!");
      
      // Trigger a custom event to notify VehicleSelector to refresh
      window.dispatchEvent(new CustomEvent('vehicleDatabaseUpdated'));
    } catch (error) {
      console.error("Initialize error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to initialize vehicle database");
    }
  };

  const handleDownloadSampleTemplate = () => {
    const sampleTemplate = {
      metadata: {
        version: "1.0.0",
        lastUpdated: "2025-10-17",
        yearRange: {
          min: 2020,
          max: 2026
        },
        totalYears: 7,
        description: "Sample vehicle database template"
      },
      yearRanges: {
        "2020-2026": {
          description: "Modern vehicles",
          makes: ["Acura", "BMW", "Honda", "Toyota"],
          models: {
            "Acura": ["ILX", "MDX", "RDX", "TLX"],
            "BMW": ["3 Series", "5 Series", "X3", "X5"],
            "Honda": ["Accord", "Civic", "CR-V", "Pilot"],
            "Toyota": ["Camry", "Corolla", "RAV4", "Highlander"]
          }
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vehicle-database-sample-template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sample template downloaded");
  };

  // Report actions
  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setShowReportDetailsDialog(true);
    setLoadingReportDetails(true);
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      setLoadingReportDetails(false);
      return;
    }

    const result = await ReportService.getReportDetails(accessToken, report.id);
    if (result.success && result.data) {
      setReportDetails(result.data);
    } else {
      toast.error(result.error || 'Failed to load report details');
    }
    setLoadingReportDetails(false);
  };

  const handleUpdateReportStatus = async (reportId: string, status: 'pending' | 'reviewed' | 'resolved' | 'dismissed', resolutionNotes?: string) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const result = await ReportService.updateReportStatus(accessToken, reportId, status, resolutionNotes);
    if (result.success) {
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status, resolution_notes: resolutionNotes, reviewed_at: new Date().toISOString() } : r
      ));
      toast.success(`Report ${status}`);
      loadReports(); // Refresh to get updated data
    } else {
      toast.error(result.error || 'Failed to update report');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    const result = await ReportService.deleteReport(accessToken, reportId);
    if (result.success) {
      setReports(reports.filter(r => r.id !== reportId));
      toast.success('Report deleted successfully');
      setShowReportDetailsDialog(false);
      setSelectedReport(null);
    } else {
      toast.error(result.error || 'Failed to delete report');
    }
  };

  const handleTakeAction = async () => {
    if (!selectedReport || !actionReason.trim()) {
      toast.error('Please provide a reason for this action');
      return;
    }

    setTakingAction(true);
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      setTakingAction(false);
      return;
    }

    const result = await ReportService.takeAction(
      accessToken,
      selectedReport.id,
      actionType,
      actionReason,
      actionNotes || undefined
    );

    setTakingAction(false);

    if (result.success) {
      toast.success(result.message || 'Action completed successfully');
      setShowActionDialog(false);
      setShowReportDetailsDialog(false);
      setActionReason('');
      setActionNotes('');
      loadReports(); // Refresh reports list
    } else {
      toast.error(result.error || 'Failed to take action');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="flex items-center gap-2 text-gray-900">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                Admin Panel
              </h1>
            </div>
            <Button onClick={onBack} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Close Admin Panel
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('users')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-gray-900 mt-1">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">+12% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('retailer-profiles')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Retailers</p>
                    <p className="text-gray-900 mt-1">{retailers.filter(r => r.status === "active").length}</p>
                  </div>
                  <Store className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">All active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('retailer-banners')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Banners</p>
                    <p className="text-gray-900 mt-1">{banners.filter(b => b.status === "active").length}</p>
                  </div>
                  <ImageIcon className="h-8 w-8 text-pink-600" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Activity className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-blue-600">{banners.length} total</span>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('reports')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Reports</p>
                    <p className="text-gray-900 mt-1">{reports.filter(r => r.status === "pending").length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Activity className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600">{reports.length} total</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="retailer-profiles">Retailers</TabsTrigger>
            <TabsTrigger value="retailer-banners">Banners</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="policy">Policy</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest user and content activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">New user registered</p>
                        <p className="text-xs text-gray-600 mt-1">Jennifer Wong joined the platform</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-pink-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">New banner uploaded</p>
                        <p className="text-xs text-gray-600 mt-1">YCKG promotional banner added</p>
                        <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Store className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">New deal posted</p>
                        <p className="text-xs text-gray-600 mt-1">Retailer added new promotional offer</p>
                        <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Platform health and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-900">User Authentication</p>
                          <p className="text-xs text-gray-600 mt-1">All systems operational</p>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-900">Database</p>
                          <p className="text-xs text-gray-600 mt-1">Connection stable</p>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-900">Retailer Sync</p>
                          <p className="text-xs text-gray-600 mt-1">Last sync: 30 minutes ago</p>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Healthy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(user => 
                      searchQuery === "" || 
                      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 mt-1">
                              <Phone className="h-3 w-3" />
                              <span className="text-xs">{user.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">
                              {user.address?.city && user.address?.state 
                                ? `${user.address.city}, ${user.address.state}${user.address.zipCode ? ' ' + user.address.zipCode : ''}`
                                : 'No address'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">{user.joinedDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div className="text-gray-600">{user.listingsCount} listings</div>
                            <div className="text-gray-600">{user.messagesCount} messages</div>
                            <div className="text-gray-600">{user.postsCount} posts</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge className={user.status === "active" ? "bg-green-600" : "bg-red-600"}>
                              {user.status}
                            </Badge>
                            {user.isVerified && (
                              <Badge className="bg-blue-600">Verified</Badge>
                            )}
                            {user.isAdmin && (
                              <Badge className="bg-purple-600 flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(user);
                                setShowEditUserDialog(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleAdminStatus(user.id, user.isAdmin)}
                                className={user.isAdmin ? "text-orange-600" : "text-blue-600"}
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                {user.isAdmin ? "Remove Admin" : "Make Admin"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                                <Ban className="h-4 w-4 mr-2" />
                                {user.status === "active" ? "Suspend" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteUserDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retailers Tab */}
          <TabsContent value="retailers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Retailer Management</CardTitle>
                    <CardDescription>Manage retailer integrations and product sources</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setSelectedRetailer({ name: "", website: "", location: "" });
                    setShowAddRetailerDialog(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Retailer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retailers.map((retailer) => (
                      <TableRow key={retailer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{retailer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{retailer.website}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{retailer.location}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{retailer.productsCount ? retailer.productsCount.toLocaleString() : '0'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{retailer.lastSync}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={retailer.status === "active" ? "bg-green-600" : "bg-gray-600"}>
                            {retailer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedRetailer(retailer);
                                setShowEditRetailerDialog(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Retailer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleRetailerStatus(retailer.id)}>
                                <Activity className="h-4 w-4 mr-2" />
                                {retailer.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedRetailer(retailer);
                                  setShowDeleteRetailerDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Retailer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retailer Profiles Tab with Sub-tabs */}
          <TabsContent value="retailer-profiles">
            <Tabs defaultValue="profiles">
              <TabsList className="mb-4">
                <TabsTrigger value="profiles">Retailer Profiles</TabsTrigger>
                <TabsTrigger value="deals">Deals Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profiles">
                <RetailerProfilesAdmin />
              </TabsContent>
              
              <TabsContent value="deals">
                <DealsManagementAdmin />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Retailer Banners Tab with Sub-tabs */}
          <TabsContent value="retailer-banners">
            <Tabs defaultValue="retailer-positions">
              <TabsList className="mb-4">
                <TabsTrigger value="retailer-positions">Retailer Positions</TabsTrigger>
                <TabsTrigger value="promotional-banners">Promotional Banners</TabsTrigger>
              </TabsList>

              <TabsContent value="retailer-positions">
                <RetailerBannersAdmin />
              </TabsContent>

              <TabsContent value="promotional-banners">
                <PromotionalBannersAdmin />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Old Banners Tab (for reference - can be removed) */}
          <TabsContent value="banners-old">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Banner Management</CardTitle>
                    <CardDescription>Upload and manage promotional banners</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setSelectedBanner({ name: "", retailer: "", link: "" });
                    setShowAddBannerDialog(true);
                  }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Banner
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Retailer</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="w-24 h-12 bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={banner.imageUrl} 
                              alt={banner.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{banner.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{banner.retailer}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-blue-600 truncate max-w-xs block">{banner.link}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{banner.uploadedDate}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={banner.status === "active" ? "bg-green-600" : "bg-gray-600"}>
                            {banner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedBanner(banner);
                                setShowEditBannerDialog(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Banner
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleBannerStatus(banner.id)}>
                                <Activity className="h-4 w-4 mr-2" />
                                {banner.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedBanner(banner);
                                  setShowDeleteBannerDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Banner
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicle Database Tab */}
          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vehicle Database Management</CardTitle>
                    <CardDescription>Upload JSON file to update car selector database</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={handleInitializeDefaultDatabase} className="bg-green-600 hover:bg-green-700">
                      <Database className="h-4 w-4 mr-2" />
                      Initialize Default DB
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadSampleTemplate}>
                      <FileText className="h-4 w-4 mr-2" />
                      Download Sample
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadCurrentDatabase}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Current
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetDatabase} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset to Default
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-blue-100 p-4 rounded-full">
                        <Database className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-gray-900 mb-1">Upload Vehicle Database</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Upload a JSON file containing years, makes, and models
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleVehicleFileChange}
                        className="max-w-md"
                      />
                      {vehicleFile && (
                        <div className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {vehicleFile.name}
                        </div>
                      )}
                      {uploadStatus && (
                        <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                          {uploadStatus}
                        </div>
                      )}
                      {vehicleData && (
                        <Button onClick={handleUploadVehicleDatabase} className="mt-4">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Database
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expected Format */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Expected JSON Format
                    </h4>
                    <pre className="text-xs bg-white p-4 rounded border border-gray-200 overflow-x-auto">
{`{
  "metadata": {
    "version": "1.0.0",
    "description": "Comprehensive vehicle database for locksmith job tracking (1950-2026)",
    "yearRange": "1950-2026",
    "totalYears": 77,
    },
    "totalYears": 77,
    "description": "Comprehensive vehicle database"
  },
  "yearRanges": {
    "2020-2026": {
      "description": "Modern vehicles including EVs",
      "makes": ["Acura", "Audi", "BMW", "..."],
      "models": {
        "Acura": ["ILX", "Integra", "MDX", "RDX", "TLX"],
        "Audi": ["A3", "A4", "A5", "..."],
        "BMW": ["2 Series", "3 Series", "..."]
      }
    },
    "2010-2019": {
      "description": "Modern vehicles",
      "makes": ["Acura", "Audi", "..."],
      "models": { "Acura": ["ILX", "MDX", "..."] }
    }
  }
}`}
                    </pre>
                  </div>

                  {/* Current Database Preview */}
                  {vehicleData && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Loaded Database Preview
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-4 rounded border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Version</p>
                          <p className="text-gray-900">{vehicleData.metadata?.version || "N/A"}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Updated: {vehicleData.metadata?.lastUpdated || "N/A"}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Year Range</p>
                          <p className="text-gray-900">
                            {vehicleData.metadata?.yearRange?.min || "N/A"} - {vehicleData.metadata?.yearRange?.max || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Total: {vehicleData.metadata?.totalYears || 0} years
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Year Ranges</p>
                          <p className="text-gray-900">{Object.keys(vehicleData.yearRanges || {}).length} ranges</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {Object.keys(vehicleData.yearRanges || {}).slice(0, 2).join(", ")}...
                          </p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">Year Ranges Details</p>
                        <div className="space-y-2">
                          {Object.entries(vehicleData.yearRanges || {}).map(([range, data]: [string, any]) => (
                            <div key={range} className="flex items-center justify-between text-xs">
                              <span className="text-gray-900">{range}</span>
                              <span className="text-gray-600">
                                {data.makes?.length || 0} makes, {
                                  Object.values(data.models || {}).reduce((acc: number, models: any) => acc + models.length, 0)
                                } models
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm text-blue-900 mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Instructions
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li><strong>Initialize Default DB</strong> - Quick way to populate the database with the full 1950-2026 vehicle database</li>
                      <li><strong>Download Sample Template</strong> to get a minimal working example</li>
                      <li><strong>Download Current Database</strong> to see the full format with all vehicle data</li>
                      <li>Your JSON file must have both <code className="bg-blue-100 px-1 rounded">metadata</code> and <code className="bg-blue-100 px-1 rounded">yearRanges</code> keys</li>
                      <li>The yearRange in metadata can be a string "1950-2026" or object {"{ min: 1950, max: 2026 }"}</li>
                      <li>Each year range must have <code className="bg-blue-100 px-1 rounded">makes</code> array and <code className="bg-blue-100 px-1 rounded">models</code> object</li>
                      <li>After uploading, click "Upload Database" to save it to the server</li>
                      <li>Use "Reset to Default" to remove custom database and return to embedded fallback</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Content Reports Management</CardTitle>
                    <CardDescription>Review and manage user-submitted reports</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={reportStatusFilter} onValueChange={setReportStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reports</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading && reports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No reports yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports
                        .filter(report => reportStatusFilter === 'all' || report.status === reportStatusFilter)
                        .map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <Badge variant="outline">{report.content_type}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{report.reason}</TableCell>
                            <TableCell className="text-sm text-gray-600">{report.reporter_id.substring(0, 8)}...</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  report.status === 'resolved' ? 'default' : 
                                  report.status === 'reviewed' ? 'secondary' : 
                                  report.status === 'dismissed' ? 'outline' : 
                                  'destructive'
                                }
                              >
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(report.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewReport(report)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {report.status === 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateReportStatus(report.id, 'reviewing')}
                                  >
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                  </Button>
                                )}
                                {report.status === 'reviewing' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateReportStatus(report.id, 'resolved', 'Issue resolved by admin')}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateReportStatus(report.id, 'dismissed', 'Not actionable')}
                                    >
                                      <XCircle className="h-4 w-4 text-gray-600" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteReport(report.id)}
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
          </TabsContent>

          {/* Policy Tab */}
          <TabsContent value="policy">
            <div className="grid gap-6">
              {/* Policy Editor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Terms & Privacy Policy Management
                      </CardTitle>
                      <CardDescription>
                        Edit platform policies and notify users about updates
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={handleSavePolicies}
                      disabled={isSavingPolicy}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSavingPolicy ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {policyLastUpdated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          Last updated: {policyLastUpdated}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="terms" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Terms & Conditions
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Define the rules and guidelines for using the Locksmith Marketplace
                      </p>
                    </div>
                    <Textarea
                      id="terms"
                      value={termsContent}
                      onChange={(e) => setTermsContent(e.target.value)}
                      placeholder="Enter your Terms & Conditions here..."
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>

                  {/* Privacy Policy */}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="privacy" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Privacy Policy
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Explain how user data is collected, used, and protected
                      </p>
                    </div>
                    <Textarea
                      id="privacy"
                      value={privacyContent}
                      onChange={(e) => setPrivacyContent(e.target.value)}
                      placeholder="Enter your Privacy Policy here..."
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>

                  {/* Notification Settings */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Notify Users About Policy Changes
                        </Label>
                        <p className="text-xs text-gray-600">
                          When enabled, all users will see a simple popup modal when they login
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyUsers}
                          onChange={(e) => setNotifyUsers(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="border-t pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-sm mb-2">Terms Preview</h4>
                        <div className="text-xs text-gray-700 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                          {termsContent || 'No terms content yet...'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-sm mb-2">Privacy Preview</h4>
                        <div className="text-xs text-gray-700 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                          {privacyContent || 'No privacy content yet...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Policy Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Policy Statistics</CardTitle>
                  <CardDescription>Track policy acceptance and views</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Users Accepted</p>
                          <p className="text-2xl font-semibold mt-1">{users.length}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Views</p>
                          <p className="text-2xl font-semibold mt-1">-</p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Last Updated</p>
                          <p className="text-sm font-medium mt-1">
                            {policyLastUpdated || 'Never'}
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="grid gap-6">
              {/* Product Cache Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Product Cache Management</CardTitle>
                      <CardDescription>Manage cached product search results from Key4.com</CardDescription>
                    </div>
                    <Database className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm">Product search results are cached for 1 hour to improve performance</p>
                        <p className="text-sm text-muted-foreground mt-1">Clear cache to force fresh results from retailers</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          try {
                            const result = await clearProductCache();
                            toast.success(result.message || 'Cache cleared successfully');
                          } catch (error) {
                            console.error('Error clearing cache:', error);
                            toast.error('Failed to clear cache');
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cache
                      </Button>
                    </div>

                    {/* Cache Statistics */}
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm mb-3">Cache Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Cache Duration</span>
                          <Badge variant="secondary">1 hour</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Retailer</span>
                          <Badge variant="outline">Key4.com</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Storage Location</span>
                          <Badge variant="outline">Supabase KV Store</Badge>
                        </div>
                      </div>
                    </div>

                    {/* API Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm text-blue-900 mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Product Parser Information
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Automatically scrapes product data from Key4.com</li>
                        <li>Extracts title, price, images, availability, and seller info</li>
                        <li>Results are cached for 1 hour to reduce load on retailer websites</li>
                        <li>Fallback to sample results if parsing fails</li>
                        <li>Search queries are saved to user's search history</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>System Health</CardTitle>
                      <CardDescription>Backend server and API status</CardDescription>
                    </div>
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-900">Backend Server</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-900">Product Parser</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-900">KV Database</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input 
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input 
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input 
                  value={selectedUser.phone}
                  onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input 
                  value={selectedUser.location}
                  onChange={(e) => setSelectedUser({...selectedUser, location: e.target.value})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={selectedUser.status}
                  onValueChange={(value) => setSelectedUser({...selectedUser, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will remove all their listings, messages, and posts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Retailer Dialog */}
      <Dialog open={showAddRetailerDialog} onOpenChange={setShowAddRetailerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Retailer</DialogTitle>
            <DialogDescription>Add a new retailer integration</DialogDescription>
          </DialogHeader>
          {selectedRetailer && (
            <div className="space-y-4">
              <div>
                <Label>Retailer Name</Label>
                <Input 
                  placeholder="e.g., Locksmith Keyless"
                  value={selectedRetailer.name}
                  onChange={(e) => setSelectedRetailer({...selectedRetailer, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input 
                  placeholder="e.g., locksmithkeyless.com"
                  value={selectedRetailer.website}
                  onChange={(e) => setSelectedRetailer({...selectedRetailer, website: e.target.value})}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input 
                  placeholder="e.g., Nationwide"
                  value={selectedRetailer.location}
                  onChange={(e) => setSelectedRetailer({...selectedRetailer, location: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRetailerDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRetailer}>Add Retailer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Retailer Dialog */}
      <Dialog open={showEditRetailerDialog} onOpenChange={setShowEditRetailerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Retailer</DialogTitle>
            <DialogDescription>Update retailer information</DialogDescription>
          </DialogHeader>
          {selectedRetailer && (
            <div className="space-y-4">
              <div>
                <Label>Retailer Name</Label>
                <Input 
                  value={selectedRetailer.name}
                  onChange={(e) => setSelectedRetailer({...selectedRetailer, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input 
                  value={selectedRetailer.website}
                  onChange={(e) => setSelectedRetailer({...selectedRetailer, website: e.target.value})}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input 
                  value={selectedRetailer.location}
                  onChange={(e) => setSelectedRetailer({...selectedRetailer, location: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRetailerDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateRetailer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Retailer Confirmation */}
      <AlertDialog open={showDeleteRetailerDialog} onOpenChange={setShowDeleteRetailerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Retailer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this retailer? This will remove all associated products from search results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRetailer} className="bg-red-600 hover:bg-red-700">
              Delete Retailer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Banner Dialog */}
      <Dialog open={showAddBannerDialog} onOpenChange={setShowAddBannerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Banner</DialogTitle>
            <DialogDescription>Add a new promotional banner</DialogDescription>
          </DialogHeader>
          {selectedBanner && (
            <div className="space-y-4">
              <div>
                <Label>Banner Name</Label>
                <Input 
                  placeholder="e.g., XHORSE Holiday Sale"
                  value={selectedBanner.name}
                  onChange={(e) => setSelectedBanner({...selectedBanner, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Retailer</Label>
                <Input 
                  placeholder="e.g., KEY4"
                  value={selectedBanner.retailer}
                  onChange={(e) => setSelectedBanner({...selectedBanner, retailer: e.target.value})}
                />
              </div>
              <div>
                <Label>Link URL</Label>
                <Input 
                  placeholder="https://..."
                  value={selectedBanner.link}
                  onChange={(e) => setSelectedBanner({...selectedBanner, link: e.target.value})}
                />
              </div>
              <div>
                <Label>Banner Image</Label>
                <Input 
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                />
                <p className="text-xs text-gray-600 mt-1">Recommended: 1200x400px, JPG or PNG</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBannerDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBanner}>Upload Banner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={showEditBannerDialog} onOpenChange={setShowEditBannerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
            <DialogDescription>Update banner information</DialogDescription>
          </DialogHeader>
          {selectedBanner && (
            <div className="space-y-4">
              <div>
                <Label>Banner Name</Label>
                <Input 
                  value={selectedBanner.name}
                  onChange={(e) => setSelectedBanner({...selectedBanner, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Retailer</Label>
                <Input 
                  value={selectedBanner.retailer}
                  onChange={(e) => setSelectedBanner({...selectedBanner, retailer: e.target.value})}
                />
              </div>
              <div>
                <Label>Link URL</Label>
                <Input 
                  value={selectedBanner.link}
                  onChange={(e) => setSelectedBanner({...selectedBanner, link: e.target.value})}
                />
              </div>
              <div>
                <Label>Replace Image (optional)</Label>
                <Input 
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                />
              </div>
              {selectedBanner.imageUrl && (
                <div>
                  <Label>Current Image</Label>
                  <img 
                    src={selectedBanner.imageUrl} 
                    alt={selectedBanner.name}
                    className="w-full h-32 object-cover rounded-lg mt-2"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditBannerDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateBanner}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Banner Confirmation */}
      <AlertDialog open={showDeleteBannerDialog} onOpenChange={setShowDeleteBannerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBanner} className="bg-red-600 hover:bg-red-700">
              Delete Banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Details Dialog */}
      <Dialog open={showReportDetailsDialog} onOpenChange={setShowReportDetailsDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>Review and take action on this report</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Status & Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Report Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Content Type</Label>
                      <p className="text-sm mt-1">
                        <Badge variant="outline">{selectedReport.content_type}</Badge>
                      </p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <p className="text-sm mt-1">
                        <Badge 
                          variant={
                            selectedReport.status === 'resolved' ? 'default' : 
                            selectedReport.status === 'reviewed' ? 'secondary' : 
                            selectedReport.status === 'dismissed' ? 'outline' : 
                            'destructive'
                          }
                        >
                          {selectedReport.status}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <Label>Reason</Label>
                      <p className="text-sm mt-1 capitalize">{selectedReport.reason.replace(/-/g, ' ')}</p>
                    </div>
                  </div>

                  {selectedReport.description && (
                    <div className="mt-4">
                      <Label>Description</Label>
                      <p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{selectedReport.description}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <Label>Reported At</Label>
                    <p className="text-sm mt-1">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {loadingReportDetails ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">Loading full details...</p>
                  </CardContent>
                </Card>
              ) : reportDetails ? (
                <>
                  {/* Reporter Information */}
                  {reportDetails.reporter && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Reporter</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={reportDetails.reporter.avatar || undefined} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {reportDetails.reporter.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{reportDetails.reporter.name || reportDetails.reporter.email || 'Unknown User'}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              {reportDetails.reporter.email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-mono">ID: {reportDetails.reporter.id}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reported User Information */}
                  {reportDetails.reportedUser && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Reported User</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={reportDetails.reportedUser.avatar || undefined} />
                            <AvatarFallback className="bg-red-100 text-red-700">
                              {reportDetails.reportedUser.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{reportDetails.reportedUser.name}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              {reportDetails.reportedUser.email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-mono">ID: {reportDetails.reportedUser.id}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reported Content */}
                  {reportDetails.reportedContent && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Reported Content</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedReport.content_type === 'listing' && reportDetails.reportedContent && (
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex gap-4">
                              {reportDetails.reportedContent.images && reportDetails.reportedContent.images.length > 0 && (
                                <img
                                  src={reportDetails.reportedContent.images[0]}
                                  alt={reportDetails.reportedContent.title}
                                  className="w-32 h-32 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium">{reportDetails.reportedContent.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{reportDetails.reportedContent.description}</p>
                                <div className="flex gap-3 mt-3">
                                  <Badge variant="outline">{reportDetails.reportedContent.category}</Badge>
                                  <Badge variant="outline">{reportDetails.reportedContent.condition}</Badge>
                                  <span className="text-lg font-semibold text-blue-600">${reportDetails.reportedContent.price}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedReport.content_type === 'deal' && reportDetails.reportedContent && (
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex gap-4">
                              {reportDetails.reportedContent.image_url && (
                                <img
                                  src={reportDetails.reportedContent.image_url}
                                  alt={reportDetails.reportedContent.title}
                                  className="w-32 h-32 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium">{reportDetails.reportedContent.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{reportDetails.reportedContent.description}</p>
                                <div className="flex gap-3 mt-3 items-center">
                                  <span className="text-lg font-semibold text-green-600">${reportDetails.reportedContent.price}</span>
                                  {reportDetails.reportedContent.original_price && (
                                    <span className="text-sm text-gray-500 line-through">${reportDetails.reportedContent.original_price}</span>
                                  )}
                                  {reportDetails.reportedContent.retailer && (
                                    <Badge>{reportDetails.reportedContent.retailer.business_name}</Badge>
                                  )}
                                </div>
                                {reportDetails.reportedContent.expires_at && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Expires: {new Date(reportDetails.reportedContent.expires_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedReport.content_type === 'message' && reportDetails.reportedContent && (
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <p className="text-sm">{reportDetails.reportedContent.content}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Sent: {new Date(reportDetails.reportedContent.created_at).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {selectedReport.content_type === 'user' && reportDetails.reportedContent && (
                          <div className="border rounded-lg p-4 bg-gray-50 text-center">
                            <p className="text-sm text-gray-600">User account reported</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : null}

              {selectedReport.resolution_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resolution Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedReport.resolution_notes}</p>
                    {selectedReport.reviewed_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Reviewed: {new Date(selectedReport.reviewed_at).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {(selectedReport.content_type === 'listing' || selectedReport.content_type === 'deal') && selectedReport.status !== 'resolved' && (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setActionType('delete');
                        setShowActionDialog(true);
                      }}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Content
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActionType('warn');
                        setShowActionDialog(true);
                      }}
                      className="flex-1"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Warn User
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {selectedReport.status === 'pending' && (
                    <Button
                      onClick={() => {
                        handleUpdateReportStatus(selectedReport.id, 'reviewed');
                        setShowReportDetailsDialog(false);
                      }}
                      className="flex-1"
                    >
                      Mark as Reviewed
                    </Button>
                  )}
                  {selectedReport.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActionType('dismiss');
                        setShowActionDialog(true);
                      }}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Dismiss Report
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteReport(selectedReport.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Report
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Take Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'delete' && 'Delete Content'}
              {actionType === 'warn' && 'Warn User'}
              {actionType === 'dismiss' && 'Dismiss Report'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'delete' && 'This will permanently delete the reported content and notify the owner.'}
              {actionType === 'warn' && 'This will send a warning notification to the content owner.'}
              {actionType === 'dismiss' && 'This will dismiss the report without taking action on the content.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="action-reason">
                Reason for {actionType === 'delete' ? 'Deletion' : actionType === 'warn' ? 'Warning' : 'Dismissal'} *
              </Label>
              <Textarea
                id="action-reason"
                placeholder={`Explain why you are ${actionType === 'delete' ? 'deleting this content' : actionType === 'warn' ? 'warning the user' : 'dismissing this report'}...`}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be visible to the content owner in their notifications.
              </p>
            </div>

            <div>
              <Label htmlFor="action-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="action-notes"
                placeholder="Add any additional internal notes..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={2}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                These notes are for your records and will be saved with the report.
              </p>
            </div>

            {selectedReport && (
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs text-gray-600 mb-1">Report Reason:</p>
                <p className="text-sm font-medium">{selectedReport.reason}</p>
                {selectedReport.description && (
                  <>
                    <p className="text-xs text-gray-600 mt-2 mb-1">Description:</p>
                    <p className="text-sm">{selectedReport.description}</p>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowActionDialog(false);
                setActionReason('');
                setActionNotes('');
              }}
              disabled={takingAction}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'delete' ? 'destructive' : 'default'}
              onClick={handleTakeAction}
              disabled={takingAction || !actionReason.trim()}
            >
              {takingAction ? 'Processing...' : 
                actionType === 'delete' ? 'Delete & Notify' :
                actionType === 'warn' ? 'Send Warning' :
                'Dismiss Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
