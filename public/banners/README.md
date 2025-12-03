# Banner Images

## Required Images

Place your promotional banner images in this directory. The app expects these files:

- xhorse-mega-sale.png
- xhorse-tools.png
- uhs-smart-pro.png
- uhs-locktoberfest.png
- yckg-sonata.png
- yckg-hyundai-kia.png
- keydirect-xt57b.png
- keydirect-ford-madness.png
- transponder-island.png
- car-truck-remotes.png
- best-key-supply-prime.png
- best-key-supply-maverick.png
- noble-key-supply-refurbishing.png
- noble-key-supply-shipping.png
- key-innovations-halloween.png
- key-innovations-prime-deals.png
- locksmith-keyless-new-month.png
- locksmith-keyless-new-week.png

## Getting the Images

### From Figma Make:
1. Open your Figma Make project
2. Look for the banner images in the assets
3. Download each image
4. Rename to match the filenames above
5. Place in this directory

### Recommended Dimensions:
- Width: 800-1200px
- Height: 200-400px
- Format: PNG or JPG
- Optimize for web (compress to <200KB each)

## Temporary Placeholders

If you don't have the images yet, you can:

1. Create placeholder images (800x300px solid color)
2. Or remove the banner sections from App.tsx temporarily
3. Or use stock images from Unsplash matching your retailer brands

## Adding New Banners

To add a new banner:

1. Add the image to this directory
2. In `App.tsx`, add the import:
   ```tsx
   const newBanner = '/banners/new-banner.png';
   ```
3. Add to the appropriate retailer section

## Image Optimization Tips

- Use TinyPNG or similar to compress images
- WebP format for better compression (optional)
- Use lazy loading (already implemented in the app)
- Keep file sizes under 200KB for faster loading
