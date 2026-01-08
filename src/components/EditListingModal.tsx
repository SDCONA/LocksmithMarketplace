import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MobileDragModal } from "./MobileDragModal";
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { createClient } from "../utils/supabase/client";
import { projectId } from "../utils/supabase/info";
import { toast } from "sonner";
import { StatePersistence } from "../utils/statePersistence";
import { 
  Upload, 
  X, 
  MapPin, 
  DollarSign, 
  Package, 
  FileText,
  Save,
  Trash2
} from "lucide-react";

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateListing: (listing: any) => void;
  onDeleteListing: (listingId: string) => void;
  listing: any;
}

export function EditListingModal({ 
  isOpen, 
  onClose, 
  onUpdateListing, 
  onDeleteListing,
  listing 
}: EditListingModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    images: [] as string[]
  });
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Character limit for description
  const DESCRIPTION_MAX_CHARS = 500;

  // Initialize form with listing data when modal opens
  useEffect(() => {
    if (listing && isOpen) {
      // Check for saved form data first
      const savedForm = StatePersistence.getFormState(`editListing-${listing.id}`);
      
      setFormData(savedForm || {
        title: listing.title || "",
        description: listing.description || "",
        price: listing.price?.toString() || "",
        category: listing.category || "",
        condition: listing.condition || "",
        location: listing.location || "",
        images: listing.images || []
      });
    }
  }, [listing, isOpen]);

  // Persist form data on changes
  useEffect(() => {
    if (isOpen && listing) {
      StatePersistence.saveFormState(`editListing-${listing.id}`, formData);
    }
  }, [formData, isOpen, listing]);

  const categories = [
    "Car Keys & Remotes",
    "Key Programming Tools", 
    "Locksmith Tools",
    "Transponder Keys",
    "Security Systems",
    "Cutting Maschines",
    "Business for sale",
    "Access Control",
    "Other"
  ];

  const conditions = [
    { value: "new", label: "New" },
    { value: "refurbished", label: "Refurbished" },
    { value: "used", label: "Used" }
  ];

  const handleInputChange = (field: string, value: string) => {
    // Enforce character limit for description
    if (field === 'description' && value.length > DESCRIPTION_MAX_CHARS) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Calculate how many images we can still add (max 10 total)
    const availableSlots = 10 - formData.images.length;
    if (availableSlots === 0) {
      toast.error('Maximum of 10 images reached');
      return;
    }

    // Get the files to upload (limited by available slots)
    const filesToUpload = Array.from(files).slice(0, availableSlots);
    
    if (filesToUpload.length < files.length) {
      toast.info(`Only uploading ${filesToUpload.length} images (maximum of 10 total)`);
    }

    setIsUploading(true);
    
    try {
      const supabase = createClient();
      const accessToken = await supabase.auth.getSession().then(res => res.data.session?.access_token);
      
      // Upload all files in parallel
      const uploadPromises = filesToUpload.map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/upload/listing-image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: uploadFormData,
          }
        );

        const data = await response.json();
        return data;
      });

      const results = await Promise.all(uploadPromises);
      
      // Filter successful uploads
      const successfulUrls = results
        .filter(result => result.success)
        .map(result => result.url);
      
      const failedCount = results.length - successfulUrls.length;

      if (successfulUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...successfulUrls]
        }));
        toast.success(`${successfulUrls.length} image${successfulUrls.length > 1 ? 's' : ''} uploaded successfully`);
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} image${failedCount > 1 ? 's' : ''} failed to upload`);
      }
    } catch (error) {
      toast.error('Error uploading images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.length) {
      handleImageUpload(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedListing = {
      ...listing,
      ...formData,
      price: parseFloat(formData.price),
      lastUpdated: "Just updated"
    };

    onUpdateListing(updatedListing);
    
    // Clear saved form data on successful save
    StatePersistence.clearFormState(`editListing-${listing.id}`);
    
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      onDeleteListing(listing.id);
      
      // Clear saved form data on delete
      StatePersistence.clearFormState(`editListing-${listing.id}`);
      
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      condition: "",
      location: "",
      images: []
    });
    onClose();
  };

  return (
    <MobileDragModal isOpen={isOpen} onClose={handleClose} className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Edit Listing</span>
        </DialogTitle>
        <DialogDescription>
          Update your listing details and manage your item.
        </DialogDescription>
      </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Title *</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., 2022 Honda Civic Key Fob - Perfect Condition"
              required
            />
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Price *</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Condition and Location Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Los Angeles, CA"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your item's condition, features, and any important details..."
              rows={4}
              required
              maxLength={DESCRIPTION_MAX_CHARS}
            />
            <p className={`text-sm ${formData.description.length >= DESCRIPTION_MAX_CHARS ? 'text-amber-600' : 'text-gray-500'}`}>
              {formData.description.length}/{DESCRIPTION_MAX_CHARS} characters
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Photos ({formData.images.length}/10)</span>
            </Label>
            
            {/* Existing Images */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <ImageWithFallback
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                    {index === 0 && (
                      <Badge className="absolute bottom-1 left-1 text-xs">
                        Main
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {formData.images.length < 10 && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop images here, or{" "}
                  <label className="text-blue-600 cursor-pointer hover:underline">
                    browse files
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      disabled={isUploading}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
                {isUploading && (
                  <div className="mt-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Listing</span>
            </Button>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </form>
    </MobileDragModal>
  );
}