# 🗺️ SITEMAP REFERENCE

Complete list of all pages indexed in `/public/sitemap.xml` for SEO.

---

## 📊 **SITEMAP OVERVIEW**

**Total Pages:** 93  
**Last Updated:** January 2026  
**Format:** XML Sitemap Protocol  
**Location:** `/public/sitemap.xml`

---

## 🏠 **MAIN PAGES (Priority: 0.8-1.0)**

| URL | Priority | Change Frequency | Description |
|-----|----------|------------------|-------------|
| `/` | 1.0 | daily | Homepage - Key search |
| `/marketplace` | 0.9 | hourly | User marketplace listings |
| `/deals` | 0.9 | daily | Retailer deals & offers |
| `/hub` | 0.8 | weekly | Professional tools hub |
| `/retailers` | 0.8 | weekly | Retailer directory |

---

## 🔧 **HUB TOOLS (Priority: 0.7)**

### **Main Tool Pages**
| URL | Description |
|-----|-------------|
| `/hub/transponder-fitment` | Transponder to car fitment guide |
| `/hub/vag-part-numbers` | VAG part numbers database |
| `/hub/lishi-fitment` | Lishi tool compatibility |
| `/hub/immobiliser-location` | Immobilizer ECU locations |

---

## 🚗 **TRANSPONDER FITMENT PAGES (Priority: 0.6)**

**Base URL:** `/hub/transponder-fitment/[brand]`

**Total:** 40 brand pages

### **A-D Brands (10 pages)**
- acura
- alfa-romeo
- audi
- bmw
- buick
- cadillac
- chevrolet
- chrysler
- citroen
- dacia

### **D-H Brands (10 pages)**
- daewoo
- daf
- daihatsu
- dodge
- fiat
- ford
- gmc
- honda
- hummer
- hyundai

### **I-M Brands (10 pages)**
- isuzu
- iveco
- jaguar
- jeep
- kawasaki
- kia
- lancia
- land-rover
- lexus
- lincoln

### **M-R Brands (10 pages)**
- mazda
- mercedes
- mitsubishi
- nissan
- opel
- peugeot
- porsche
- renault
- rover
- seat

### **S-Y Brands (10 pages)**
- skoda
- subaru
- suzuki
- toyota
- volkswagen
- volvo
- yamaha

---

## 🔩 **VAG PART NUMBERS PAGES (Priority: 0.6)**

**Base URL:** `/hub/vag-part-numbers/[brand]`

**Total:** 4 brand pages

| URL | Brand |
|-----|-------|
| `/hub/vag-part-numbers/audi` | Audi |
| `/hub/vag-part-numbers/seat` | Seat |
| `/hub/vag-part-numbers/skoda` | Skoda |
| `/hub/vag-part-numbers/volkswagen` | Volkswagen |

---

## 📄 **LEGAL & INFO PAGES (Priority: 0.5-0.7)**

| URL | Priority | Description |
|-----|----------|-------------|
| `/contact` | 0.6 | Contact form & support |
| `/about` | 0.6 | About Locksmith Marketplace |
| `/faq` | 0.7 | Frequently asked questions |
| `/help` | 0.6 | Help & support center |
| `/privacy` | 0.5 | Privacy policy |
| `/terms` | 0.5 | Terms of service |

---

## 🚫 **PAGES NOT IN SITEMAP (Private/User)**

These pages exist but are excluded from search engines via `robots.txt`:

| URL | Reason |
|-----|--------|
| `/admin` | Admin panel - private |
| `/settings` | User settings - private |
| `/account` | User account - private |
| `/messages` | User messages - private |
| `/my-listings` | User listings - private |
| `/saved-items` | User saved items - private |
| `/promote` | Listing promotion - private |
| `/archived` | Archived listings - private |
| `/retailer-dashboard` | Retailer dashboard - private |
| `/my-retailer-deals` | Retailer deals management - private |

---

## 📈 **SEO STRATEGY BY PAGE TYPE**

### **High Priority Pages (1.0 - 0.9)**
**Target:** Fast indexing, weekly ranking checks

**Pages:**
- Homepage
- Marketplace
- Deals

**Keywords:**
- locksmith marketplace
- buy locksmith tools
- locksmith deals

**Strategy:**
- Update content weekly
- Monitor Search Console daily
- Build backlinks

---

### **Medium Priority Pages (0.8 - 0.7)**
**Target:** Steady indexing, monthly ranking checks

**Pages:**
- Hub main page
- Retailers directory
- FAQ

**Keywords:**
- locksmith resources
- locksmith hub
- locksmith suppliers

**Strategy:**
- Update content monthly
- Monitor Search Console weekly
- Encourage user reviews

---

### **Long-tail Pages (0.6)**
**Target:** Capture specific searches

**Pages:**
- All transponder fitment brand pages
- VAG part numbers pages
- Lishi fitment
- Immobilizer location

**Keywords (examples):**
- "Honda Accord transponder chip"
- "Audi key part number"
- "Lishi tool for Toyota"
- "BMW immobilizer location"

**Strategy:**
- Let Google index naturally
- Monitor which pages get traffic
- Expand popular pages with more content

---

## 🔄 **SITEMAP UPDATE SCHEDULE**

### **Update sitemap.xml when:**
- [ ] New hub tool added
- [ ] New brand added to transponder guide
- [ ] New major page created
- [ ] URL structure changes
- [ ] Domain changes

### **How to update:**
1. Edit `/public/sitemap.xml`
2. Add new `<url>` entry with:
   - `<loc>` - full URL
   - `<changefreq>` - how often it changes
   - `<priority>` - importance (0.0-1.0)
3. Deploy changes
4. Resubmit to Google Search Console

### **Auto-resubmit:**
Search Console automatically checks sitemap daily, but you can manually request:
1. Go to Search Console
2. Click "Sitemaps"
3. Click "View sitemap"
4. Google recrawls within 24-48 hours

---

## 📊 **EXPECTED INDEXING TIMELINE**

### **Week 1:**
- Homepage ✅
- Main pages (marketplace, deals, hub) ✅

### **Week 2:**
- Legal pages (privacy, terms, contact) ✅
- About & FAQ ✅

### **Month 1:**
- 20-30 hub tool pages ✅
- Most popular brand pages ✅

### **Month 2:**
- All 90+ pages indexed ✅
- Start ranking for long-tail keywords ✅

---

## 🎯 **TOP PAGES TO MONITOR**

**These will drive the most SEO traffic:**

1. **Homepage** `/`
   - Brand searches: "locksmith marketplace"
   
2. **Hub Main** `/hub`
   - "locksmith tools"
   - "locksmith resources"

3. **Transponder Fitment** `/hub/transponder-fitment/*`
   - "Honda Accord transponder chip"
   - "what transponder for [car]"

4. **Marketplace** `/marketplace`
   - "buy locksmith tools"
   - "used key machine for sale"

5. **Deals** `/deals`
   - "locksmith equipment deals"
   - "key machine discount"

**Monitor these in Search Console weekly!**

---

## 🔍 **HOW TO FIND MISSING PAGES**

### **Check indexed pages:**
```
site:locksmith-marketplace.vercel.app
```

### **Check specific section:**
```
site:locksmith-marketplace.vercel.app/hub/transponder-fitment
```

### **Find pages NOT indexed:**
1. Go to Google Search Console
2. Click "Coverage" report
3. Look at "Excluded" or "Discovered - not indexed"
4. If important pages missing, manually request indexing

---

## 📝 **SITEMAP MAINTENANCE CHECKLIST**

### **Monthly:**
- [ ] Check Google Search Console coverage report
- [ ] Verify all important pages indexed
- [ ] Look for 404 errors or redirect chains
- [ ] Check sitemap parse errors

### **Quarterly:**
- [ ] Review and update priorities
- [ ] Add any new pages created
- [ ] Remove deprecated pages
- [ ] Update change frequencies if needed

### **When launching new feature:**
- [ ] Add page to sitemap.xml
- [ ] Set appropriate priority
- [ ] Submit to Search Console
- [ ] Monitor indexing progress

---

## ✅ **QUICK REFERENCE**

**Sitemap URL:**  
`https://locksmith-marketplace.vercel.app/sitemap.xml`

**Robots.txt URL:**  
`https://locksmith-marketplace.vercel.app/robots.txt`

**Submit to Search Console:**
1. https://search.google.com/search-console
2. Sitemaps → Add new sitemap
3. Enter: `sitemap.xml`

**Test sitemap:**  
https://www.xml-sitemaps.com/validate-xml-sitemap.html

**All systems working!** ✅
