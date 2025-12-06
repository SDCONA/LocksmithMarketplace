import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Upload, X, DollarSign, Package, MapPin } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { projectId } from "../utils/supabase/info";
import { toast } from "sonner";

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
  "Key Blanks",
  "Security Systems",
  "Other Automotive"
];

const conditions = [
  { value: "new", label: "New" },
  { value: "used", label: "Used - Like New" },
  { value: "refurbished", label: "Refurbished" }
];

export function CreateListingModal({ isOpen, onClose, onCreateListing }: CreateListingModalProps) {
  const [formData, setFormData] = useState({
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
    const file = e.target.files?.[0];
    if (!file || formData.images.length >= 10) return;

    setIsUploading(true);
    
    try {
      // Upload to server storage
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const supabase = createClient();
      const accessToken = await supabase.auth.getSession().then(res => res.data.session?.access_token);
      
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
      
      if (data.success) {
        setFormData({
          ...formData,
          images: [...formData.images, data.url]
        });
        toast.success('Image uploaded successfully');
      } else {
        console.error('Failed to upload image:', data.error);
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.price || !formData.category || !formData.condition || !formData.location || !formData.zipCode) {
      alert("Please fill in all required fields including zip code.");
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
      images: formData.images.length > 0 ? formData.images : [
        "https://images.unsplash.com/photo-1750558222639-3573a142508d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBrZXklMjByZW1vdGV8ZW58MXx8fHwxNzU5MDg5MzcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      ],
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
    
    onClose();
  };

  return (
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
                {formData.images.length >= 10 && (
                  <span className="text-sm text-amber-600">Maximum reached</span>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2 mb-2">
              {formData.images.slice(0, 3).map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  {/* Show +N overlay on 3rd image if there are more */}
                  {index === 2 && formData.images.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        +{formData.images.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
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
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full"
                      disabled={isUploading}
                      onClick={() => document.querySelector('input[type="file"]')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
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
              onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                const numericValue = e.target.value.replace(/\D/g, '').slice(0, 5);
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
  );
}