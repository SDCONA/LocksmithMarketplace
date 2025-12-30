# eBay Rate Limit - Complete Guide

## Why You're Getting Rate Limited

### eBay Finding API Limits (Free Tier)
- **5,000 calls per day** across your ENTIRE application
- **~208 calls per hour** or **~3.5 calls per minute**
- **Each search query = 1 API call**
- **Limit is SHARED** - not per user, per application

### What Triggers Rate Limits
1. **Multiple unique searches** - Each different query uses a call
2. **Cache misses** - If query not cached, it makes fresh API call
3. **User testing** - Multiple searches during testing/development
4. **Low daily limit** - Very easy to hit with even light usage

## Current Protection Mechanisms

### ✅ What's Already Implemented
1. **Smart Caching** (24 hours)
   - Same query within 24 hours = returns cached results
   - No API call made for cached queries
   - Even empty results are cached

2. **Rate Limit Detection**
   - Detects Error ID 10001 (rate limit exceeded)
   - Automatically enters 2-hour cooldown
   - Stored persistently in KV database

3. **Automatic Cooldown**
   - 2 hours cooldown when rate limited
   - All eBay searches paused during cooldown
   - Returns empty results instead of making API calls

4. **Admin Tools**
   - Check eBay status in Admin Panel
   - Manual reset if needed
   - Shows time remaining until cooldown ends

## Recent Improvements (Just Applied)

### Extended Cache Duration
- **Before:** 1 hour cache
- **After:** 24 hours cache
- **Impact:** Dramatically reduces API calls for popular searches

### Extended Cooldown Period
- **Before:** 1 hour cooldown
- **After:** 2 hours cooldown
- **Impact:** Gives more time for eBay's daily limit to reset

## How to Minimize Rate Limits

### Best Practices
1. **Use specific searches** - "Honda Civic 2015 key fob" vs "honda"
2. **Don't spam searches** - Each unique query counts
3. **Let cache work** - Same searches within 24h are free
4. **Monitor usage** - Check Admin Panel → eBay Tools

### For Testing/Development
1. **Use Admin Panel** to check status before testing
2. **Test with same query** multiple times (uses cache)
3. **Reset rate limit** manually if needed (Admin Panel)
4. **Consider production credentials** if testing heavily

## Long-Term Solutions

### Option 1: Upgrade eBay Account (Recommended)
- **Production API credentials** have higher limits
- Contact eBay Developer Program
- Get approved for higher tier

### Option 2: Reduce eBay Dependency
- Make eBay optional/supplementary
- Focus on internal deals database
- Show "External results may be limited" message

### Option 3: Aggressive Caching Strategy
- Pre-cache popular searches (Honda, Toyota, Ford, etc.)
- Increase cache to 48-72 hours
- Cache by vehicle make/model combinations

### Option 4: Alternative APIs
- Consider other automotive parts APIs
- RockAuto, AutoZone, etc. (if they have APIs)
- May require separate agreements

## Current Settings

```javascript
cacheDuration: 86400000      // 24 hours
rateLimitDuration: 7200000   // 2 hours cooldown
dailyLimit: 5000             // eBay Finding API limit
perHourLimit: ~208           // Calculated from daily
```

## Monitoring

### Check eBay Status
1. Go to Admin Panel
2. Scroll to "eBay Tools" section
3. Click "Check eBay Status"
4. See if rate limited and time remaining

### Reset Rate Limit (Emergency Only)
1. Only use if you know limit has reset
2. Admin Panel → "Reset Rate Limit"
3. Clears the cooldown immediately
4. Note: Won't help if eBay still blocking you

## Error Messages

### When Rate Limited:
```
⏸️ [eBay API] Skipping search - rate limit active
```

### When Cache Hit:
```
✅ [eBay API] Returning X cached results
```

### When Making Fresh Call:
```
🔍 [eBay API] Starting fresh search for query: "..."
✅ [eBay API] Successfully found X products
```

## Bottom Line

The eBay Finding API is **extremely limited** on the free tier. With proper caching and cooldowns in place, the system will work but:

- **Expect rate limits** with moderate usage
- **Cache is your friend** - most queries should hit cache
- **Consider upgrading** to production API for real usage
- **eBay is supplementary** - your deals database is primary

The system is now optimized to minimize API calls while still providing eBay results when possible.
