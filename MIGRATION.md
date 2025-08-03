# Migration to Astro Content Layer

This project has been migrated from runtime Supabase integration to Astro Content Layer for build-time data loading.

## What Changed

### ✅ Before (Runtime Supabase)
- Client-side Supabase calls using `@supabase/supabase-js`
- Public environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Runtime API calls in components and pages
- Potential security and performance issues

### ✅ After (Astro Content Layer)
- Build-time data loading using Content Layer
- Secure server-side access with `SUPABASE_SERVICE_ROLE_KEY`
- Static data generation for improved performance
- Zero client-side API keys in production

## Environment Variables

```bash
# Required for build-time data loading
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App configuration (optional)
VITE_APP_URL=http://localhost:4321
VITE_RESTAURANT_NAME=Osushi
VITE_RESTAURANT_PHONE=01 23 45 67 89
VITE_RESTAURANT_EMAIL=contact@osushi.fr
```

## Content Collections

The following collections are available:

- `users` - User profiles and loyalty data
- `categories` - Product categories  
- `products` - Menu items and products
- `product-variants` - Product variations (sizes, options)
- `orders` - Customer orders
- `order-items` - Individual items in orders
- `loyalty-transactions` - Loyalty points history
- `restaurant-settings` - Restaurant configuration

## Data Access

Use the content layer utility:

```typescript
import { getCategories, getProductsWithVariants } from '../lib/content-data';

// In Astro components (build time)
const categories = await getCategories();
const products = await getProductsWithVariants();
```

## Static Site Limitations

- **Authentication**: Converted to stub functions with informative warnings
- **Order Management**: Requires separate backend solution for dynamic functionality  
- **Admin Functions**: Display static mode messages
- **Cart**: Remains localStorage-based (fully functional)

## Development

With proper Supabase credentials, the Content Layer will load real data at build time. Without credentials, fallback demo data is used for development.

## Security Benefits

- No client-side API keys
- RLS can be safely enabled on Supabase
- All data access happens at build time on the server
- Zero runtime database connections from the client