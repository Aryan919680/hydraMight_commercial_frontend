# HydraMight Commercial Ecom UI Changes

Implemented a commercial customer home page using the existing household UI style.

## Included

- Commercial home route at `/`
- Commercial navbar
- Commercial hero section
- Signup request dialog
- Commercial email/password login dialog
- Commercial product listing on the home page only
- Product API calls now use `ecom_channel=commercial`
- Build verified with `npm run build`

## New frontend files

- `src/pages/CommercialIndex.tsx`
- `src/components/CommercialNavbar.tsx`
- `src/components/CommercialHero.tsx`
- `src/components/CommercialAuthDialog.tsx`
- `src/components/CommercialProductGrid.tsx`

## Updated files

- `src/App.tsx`
- `src/lib/api.ts`
- `package.json`

## Expected backend endpoints

The UI expects these commercial auth APIs:

```http
POST /api/customer/auth/commercial/signup-request
POST /api/customer/auth/commercial/login
```

Product listing uses the existing products endpoint with commercial channel:

```http
GET /api/customer/products?service_location_id=<id>&ecom_channel=commercial&limit=40&offset=0
```

## Signup payload

```json
{
  "business_name": "ABC Enterprises",
  "contact_person": "Raj Sharma",
  "gst_number": "07ABCDE1234F1Z5",
  "email": "orders@business.com",
  "phone": "9876543210",
  "address_line1": "Shop/office, area, landmark",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "customer_type": "commercial"
}
```

## Login payload

```json
{
  "email": "orders@business.com",
  "password": "Raj@123",
  "customer_type": "commercial"
}
```
