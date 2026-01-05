# Hub Images Storage Guide

## Overview
All Hub page images (Lishi tools, transponder fitment, etc.) are stored in a dedicated Supabase storage bucket called `make-a7e285ba-hub-images`.

## Storage Bucket Details
- **Bucket Name**: `make-a7e285ba-hub-images`
- **Visibility**: Public (images are publicly accessible)
- **File Size Limit**: 10MB per file
- **Allowed File Types**: JPEG, PNG, GIF, WebP
- **Auto-created**: The bucket is automatically created when the server starts

## How to Upload Images

### Method 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Find the bucket: `make-a7e285ba-hub-images`
4. Click on the bucket to open it
5. Create folders to organize your images:
   - `lishi/acura/` - for Acura Lishi tool images
   - `lishi/bmw/` - for BMW Lishi tool images
   - etc.
6. Click **Upload File** and select your images
7. Your images will be accessible at:
   ```
   https://dpqbngyjehjjjohbxyhq.supabase.co/storage/v1/object/public/make-a7e285ba-hub-images/[path-to-file]
   ```

### Recommended Folder Structure
```
make-a7e285ba-hub-images/
├── lishi/
│   ├── acura/
│   │   ├── tool-1.jpg
│   │   ├── tool-2.jpg
│   │   └── tool-3.jpg
│   ├── bmw/
│   │   ├── tool-1.jpg
│   │   └── tool-2.jpg
│   ├── ford/
│   └── ... (other brands)
├── transponder/
│   ├── acura/
│   ├── bmw/
│   └── ... (other brands)
└── vag-parts/
    ├── audi/
    ├── seat/
    ├── skoda/
    └── volkswagen/
```

## How to Use Images in Your Code

### Using the HubImage Component (Recommended)

```tsx
import { HubImage } from "../HubImage";

// In your component:
<HubImage
  imagePath="lishi/acura/tool-1.jpg"
  alt="Acura Lishi Tool"
  className="w-full h-48"
  fallbackText="Image coming soon"
/>
```

**Props:**
- `imagePath` - Path to the image in the bucket (e.g., "lishi/acura/tool-1.jpg")
- `alt` - Alt text for accessibility
- `className` - Tailwind classes for styling
- `fallbackText` - Text to show if image fails to load (optional)

### Example: Full Lishi Page Implementation

See `/components/lishi/AcuraLishiPage.tsx` for a complete example showing:
- Grid layout of tools
- Image display with loading states
- Error handling with fallback UI
- Responsive design

### Hardcoded Data Structure Example

```tsx
const lishiTools = [
  {
    id: 1,
    title: "HU66 Lishi 2-in-1 Pick and Decoder",
    description: "For Acura MDX, RDX, TLX 2007-2020",
    imagePath: "lishi/acura/hu66.jpg",
  },
  {
    id: 2,
    title: "HON66 Lishi 2-in-1 Pick and Decoder",
    description: "For Acura ILX, NSX 2013-2020",
    imagePath: "lishi/acura/hon66.jpg",
  },
];
```

## Image Requirements

### File Naming
- Use lowercase letters and numbers
- Use hyphens instead of spaces: `tool-1.jpg` not `Tool 1.jpg`
- Be descriptive: `hu66-lishi-tool.jpg` is better than `image1.jpg`

### Image Optimization
- **Format**: Use JPG for photos, PNG for graphics with transparency
- **Size**: Keep under 1MB for fast loading (compress before uploading)
- **Dimensions**: Recommended 800x600px or 1200x800px
- **Quality**: 80-85% JPG quality is usually sufficient

### Tools for Image Optimization
- **TinyPNG** (https://tinypng.com/) - Free online compression
- **ImageOptim** (Mac) - Desktop app
- **Squoosh** (https://squoosh.app/) - Google's web-based tool

## Features

### Loading States
The `HubImage` component automatically shows a loading spinner while the image loads.

### Error Handling
If an image fails to load, it displays a fallback icon and optional text.

### Dark Mode
The component automatically adapts to dark mode with appropriate background colors.

## Updating Other Brand Pages

To add images to other Lishi brand pages:

1. Upload your images to the correct folder in Supabase Storage
2. Copy the data structure from `AcuraLishiPage.tsx`
3. Update the brand-specific page (e.g., `BMWLishiPage.tsx`)
4. Replace the imagePath values with your actual file paths

Example for BMW:
```tsx
const lishiTools = [
  {
    id: 1,
    title: "HU92 Lishi 2-in-1 Pick and Decoder",
    description: "For BMW 3, 5, 7 Series",
    imagePath: "lishi/bmw/hu92.jpg", // This file should exist in storage
  },
];
```

## Troubleshooting

### Image Not Showing
1. Check the file exists in Supabase Storage
2. Verify the path is correct (case-sensitive)
3. Check browser console for errors
4. Ensure bucket is public

### Slow Loading
1. Compress images before uploading
2. Use appropriate image dimensions
3. Consider using WebP format for better compression

### Storage Bucket Not Created
1. Check server logs for initialization errors
2. Verify Supabase credentials are correct
3. Restart the server to trigger bucket creation

## Security Notes

- The bucket is **public** - anyone with the URL can access images
- Don't store sensitive information in filenames
- Images are suitable for product photos, tool images, etc.
- Not suitable for user-uploaded content or private data

## Support

If you encounter issues:
1. Check the server logs in Supabase Dashboard → Edge Functions
2. Verify the bucket exists in Supabase Dashboard → Storage
3. Test image URLs directly in your browser
4. Check the browser console for JavaScript errors
