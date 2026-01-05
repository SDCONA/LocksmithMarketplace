import { useState } from "react";

interface HubImageProps {
  imagePath: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

/**
 * Component to display images from the Hub storage bucket
 * Images should be uploaded to: make-a7e285ba-hub-images bucket
 * Example path: "lishi/acura/tool-1.jpg"
 */
export function HubImage({ imagePath, alt, className = "", fallbackText }: HubImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Construct the public URL for the image
  const supabaseUrl = "https://dpqbngyjehjjjohbxyhq.supabase.co";
  const bucketName = "make-a7e285ba-hub-images";
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imagePath}`;

  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🖼️</div>
          {fallbackText && <p className="text-sm text-gray-500 dark:text-gray-400">{fallbackText}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImageError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}
