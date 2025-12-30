import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Upload, X, DollarSign, Package, MapPin, Star, Eye, ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { projectId } from "../utils/supabase/info";
import { toast } from "sonner";
import { StatePersistence } from "../utils/statePersistence";
import { VisuallyHidden } from "./ui/visually-hidden";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateListing: (listing: any) => void;
}

const categories = [
  "Car Keys & Remotes",
  "Key Programming Tools", 
  "Locksmith Supplies",
  "Transponder Chips",
  "Security Systems",
  "Cutting Maschines",
  "Business for sale",
  "Other Automotive"
];

const conditions = [
  { value: "new", label: "New" },
  { value: "used", label: "Used - Like New" },
  { value: "refurbished", label: "Refurbished" }
];

export function CreateListingModal({ isOpen, onClose, onCreateListing }: CreateListingModalProps) {
  // Initialize form data from localStorage
  const savedForm = StatePersistence.getFormState('createListing');
  const [formData, setFormData] = useState(savedForm || {
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    zipCode: "",
    images: [] as string[]
  });
  
  const [imageUpload, setImageUpload] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [zipCodeError, setZipCodeError] = useState("");
  const [showImageManager, setShowImageManager] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Persist form data on changes
  useEffect(() => {
    if (isOpen) {
      StatePersistence.saveFormState('createListing', formData);
    }
  }, [formData, isOpen]);

  // Character limit for description
  const DESCRIPTION_MAX_CHARS = 500;

  const handleAddImage = () => {
    if (imageUpload && formData.images.length < 10) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUpload]
      });
      setImageUpload("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
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
        setFormData({
          ...formData,
          images: [...formData.images, ...successfulUrls]
        });
        toast.success(`${successfulUrls.length} image${successfulUrls.length > 1 ? 's' : ''} uploaded successfully`);
      }
      
      if (failedCount > 0) {
        console.error('Some images failed to upload');
        toast.error(`${failedCount} image${failedCount > 1 ? 's' : ''} failed to upload`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error uploading files');
    } finally {
      setIsUploading(false);
      // Reset the file input so the same files can be selected again if needed
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const setAsHeroImage = (index: number) => {
    moveImage(index, 0);
    toast.success('Main image updated');
  };

  const openImagePreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewImage(formData.images[index]);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (previewIndex - 1 + formData.images.length) % formData.images.length
      : (previewIndex + 1) % formData.images.length;
    setPreviewIndex(newIndex);
    setPreviewImage(formData.images[newIndex]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.price || !formData.category || !formData.condition || !formData.location || !formData.zipCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate images
    if (formData.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    // Validate zip code format (5 digits)
    if (formData.zipCode.length !== 5) {
      setZipCodeError("Please enter a valid 5-digit zip code.");
      return;
    } else {
      setZipCodeError("");
    }
    
    const newListing = {
      id: Date.now().toString(),
      title: formData.title,
      price: parseFloat(formData.price),
      description: formData.description,
      images: formData.images,
      location: `${formData.location} ${formData.zipCode}`,
      postedDate: "Just now",
      condition: formData.condition as "new" | "used" | "refurbished",
      category: formData.category,
      views: 0,
      favorites: 0,
      messages: 0
    };
    
    onCreateListing(newListing);
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      condition: "",
      location: "",
      zipCode: "",
      images: []
    });
    
    // Clear saved form data
    StatePersistence.clearFormState('createListing');
    
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Listing</DialogTitle>
            <DialogDescription>
              List your automotive keys, tools, or locksmith supplies for sale in the marketplace.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Images */}
            <div>
              {formData.images.length > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {formData.images.length}/10 images
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageManager(!showImageManager)}
                    className="text-blue-600"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {showImageManager ? 'Hide' : 'Manage All'}
                  </Button>
                </div>
              )}
              
              {/* Expanded Image Manager */}
              {showImageManager && formData.images.length > 0 && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm">First image is main</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {index === 0 && (
                          <Badge className="absolute top-1 left-1 bg-blue-600 text-xs">
                            Main
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                            {index !== 0 && (
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAsHeroImage(index);
                                }}
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Main
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(index);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Upload skeleton placeholders */}
                    {isUploading && Array.from({ length: 3 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="relative aspect-square rounded-lg bg-gray-200 animate-pulse">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400 animate-bounce" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Collapsed View - First 3 Images */}
              {!showImageManager && formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {formData.images.slice(0, 3).map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg cursor-pointer"
                        onClick={() => setShowImageManager(true)}
                      />
                      {index === 0 && (
                        <Badge className="absolute top-1 left-1 bg-blue-600 text-xs">
                          Main
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        <X className="h-6 w-6" />
                      </Button>
                      {/* Show +N overlay on 3rd image if there are more */}
                      {index === 2 && formData.images.length > 3 && (
                        <div 
                          className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowImageManager(true);
                          }}
                        >
                          <span className="text-white text-2xl">
                            +{formData.images.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Upload skeleton placeholders in collapsed view */}
                  {isUploading && Array.from({ length: Math.min(3, 10 - formData.images.length) }).map((_, i) => (
                    <div key={`skeleton-collapsed-${i}`} className="relative aspect-square rounded-lg bg-gray-200 animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400 animate-bounce" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Show skeletons when no images yet but uploading */}
              {!showImageManager && formData.images.length === 0 && isUploading && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`skeleton-initial-${i}`} className="relative aspect-square rounded-lg bg-gray-200 animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400 animate-bounce" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.images.length < 10 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                        multiple
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        className="w-full"
                        disabled={isUploading}
                        onClick={() => document.querySelector('input[type="file"]')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload Photos'}
                      </Button>
                    </label>
                  </div>
                </div>
              )}
              
              {formData.images.length >= 10 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  You've reached the maximum of 10 photos
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <Input
                id="title"
                placeholder="What are you selling? *"
                value={formData.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 70) {
                    setFormData({...formData, title: value});
                  }
                }}
                maxLength={70}
                required
              />
            </div>

            {/* Price */}
            <div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Price *"
                  className="pl-10"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category *" />
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

            {/* Condition */}
            <div>
              <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition *" />
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

            {/* Location */}
            <div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="City, State *"
                  className="pl-10"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Zip Code */}
            <div>
              <Input
                id="zipCode"
                placeholder="Zip code *"
                value={formData.zipCode}
                onChange={(e) => {
                  // Only allow numeric input and limit to 5 digits
                  const numericValue = e.target.value.replace(/\\D/g, '').slice(0, 5);
                  setFormData({...formData, zipCode: numericValue});
                  // Clear error when user types
                  if (zipCodeError && numericValue.length === 5) {
                    setZipCodeError("");
                  }
                }}
                onBlur={() => {
                  // Validate on blur
                  if (formData.zipCode && formData.zipCode.length !== 5) {
                    setZipCodeError("Zip code must be exactly 5 digits");
                  } else {
                    setZipCodeError("");
                  }
                }}
                maxLength={5}
                minLength={5}
                pattern="[0-9]{5}"
                className={zipCodeError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                required
              />
              {zipCodeError && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {zipCodeError}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Textarea
                id="description"
                placeholder="Describe your item (condition, compatibility, etc.)"
                rows={4}
                value={formData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= DESCRIPTION_MAX_CHARS) {
                    setFormData({...formData, description: value});
                  }
                }}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/{DESCRIPTION_MAX_CHARS} characters
              </p>
            </div>

            {/* Submit */}
            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Listing
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={closeImagePreview}>
          <DialogContent className="max-w-full max-h-full h-screen w-screen p-0 bg-black/95">
            <DialogHeader>
              <VisuallyHidden>
                <DialogTitle>Image Preview</DialogTitle>
              </VisuallyHidden>
              <VisuallyHidden>
                <DialogDescription>
                  Preview and manage listing images. Use arrow buttons to navigate between images.
                </DialogDescription>
              </VisuallyHidden>
            </DialogHeader>
            <div className="relative w-full h-full flex flex-col">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="text-white">
                  <span className="text-sm">{previewIndex + 1} / {formData.images.length}</span>
                  {previewIndex === 0 && (
                    <Badge className="ml-2 bg-blue-600">Main</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeImagePreview}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Image */}
              <div className="flex-1 flex items-center justify-center p-4 pb-24">
                <img
                  src={previewImage}
                  alt={`Preview ${previewIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Navigation Arrows */}
              {formData.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigatePreview('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 bg-black/50"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigatePreview('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 bg-black/50"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Bottom Actions - Always Visible */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-black/90 border-t border-white/10">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {previewIndex !== 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAsHeroImage(previewIndex);
                        closeImagePreview();
                      }}
                      className="min-w-[140px]"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Set as Main
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRemoveImage(previewIndex);
                      if (formData.images.length === 1) {
                        closeImagePreview();
                      } else if (previewIndex >= formData.images.length - 1) {
                        navigatePreview('prev');
                      }
                    }}
                    className="min-w-[140px]"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete Image
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}