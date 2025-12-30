import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, RefreshCw, Archive, Clock, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { MarketplaceCard } from "./MarketplaceCard";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { createClient } from "../utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ArchivedListingsPageProps {
  user: any;
  onBack: () => void;
  onViewListing: (listing: any) => void;
}

export function ArchivedListingsPage({ user, onBack, onViewListing }: ArchivedListingsPageProps) {
  const [archivedListings, setArchivedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [relistingId, setRelistingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadArchivedListings();
    // Also archive any expired listings when the page loads
    archiveExpiredListings();
  }, []);

  const archiveExpiredListings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/archive-expired`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.archived > 0) {
          console.log(`Archived ${data.archived} expired listings`);
        }
      }
    } catch (error) {
      // Silently fail - this is a background task that will retry on next page load
    }
  };

  const loadArchivedListings = async () => {
    try {
      setLoading(true);
      
      // Get fresh access token from Supabase session
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      console.log('🔍 Loading archived listings with token:', accessToken ? 'exists' : 'missing');
      
      if (!accessToken) {
        console.error('❌ No access token available');
        toast.error('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/archived`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      console.log('📦 Full error object:', JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log('✅ Successfully loaded', data.listings?.length || 0, 'archived listings');
        setArchivedListings(data.listings || []);
      } else {
        console.error('❌ Error response:', data);
        toast.error(data.error || 'Failed to load archived listings');
      }
    } catch (error) {
      console.error('Error loading archived listings:', error);
      toast.error('Failed to load archived listings');
    } finally {
      setLoading(false);
    }
  };

  const handleRelist = async (listingId: string) => {
    try {
      setRelistingId(listingId);
      
      // Get fresh access token from Supabase session
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        toast.error('Authentication required');
        setRelistingId(null);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/${listingId}/relist`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        toast.success('Listing relisted successfully! Active for 7 more days.');
        // Remove from archived list
        setArchivedListings(prev => prev.filter(l => l.id !== listingId));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to relist');
      }
    } catch (error) {
      console.error('Error relisting:', error);
      toast.error('Failed to relist listing');
    } finally {
      setRelistingId(null);
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      setDeletingId(listingId);
      
      // Get fresh access token from Supabase session
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        toast.error('Authentication required');
        setDeletingId(null);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/${listingId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        toast.success('Listing deleted permanently');
        // Remove from archived list
        setArchivedListings(prev => prev.filter(l => l.id !== listingId));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="flex items-center space-x-2">
                  <Archive className="h-5 w-5" />
                  <span>Archived Listings</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Listings that have expired after 7 days
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadArchivedListings}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Loading archived listings...</p>
          </div>
        ) : archivedListings.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="mb-2 text-gray-900">No archived listings</h3>
            <p className="text-gray-500">
              Your expired listings will appear here after 7 days
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {archivedListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Listing Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {listing.images && listing.images.length > 0 && (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-1 text-gray-900 break-words line-clamp-2">{listing.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                          {listing.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="font-semibold text-blue-600">${listing.price}</span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Archived: {getDaysAgo(listing.archived_at)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Created: {formatDate(listing.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewListing(listing)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRelist(listing.id)}
                      disabled={relistingId === listing.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {relistingId === listing.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Relisting...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Relist for 7 Days
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setDeleteConfirmOpen(true);
                        setListingToDelete(listing.id);
                      }}
                      disabled={deletingId === listing.id}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingId === listing.id ? (
                        <>
                          <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (listingToDelete) {
                  handleDelete(listingToDelete);
                }
                setDeleteConfirmOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}