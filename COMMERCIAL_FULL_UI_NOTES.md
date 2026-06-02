# HydraMight Commercial Ecom UI - Full Flow

This project is converted from the household ecom UI into a commercial customer portal.

## Implemented UI flows

- Commercial signup request
- Commercial email/password login
- Profile page
- Location / delivery hub selection
- Commercial product home listing
- Product detail page
- Search products
- Add to bag
- Place order
- My orders
- Return order / partial return

## Commercial channel wiring

All customer-facing product/order flows now use:

```ts
ecom_channel: "commercial"
```

Main routes:

- `/` - commercial home + product listing
- `/product/:slug` - commercial product detail
- `/search?q=...` - commercial product search
- `/bag` - cart and place order
- `/orders` - order history and return order
- `/account` - commercial profile

## Expected backend APIs

Base URL is currently configured in `src/lib/api.ts`:

```ts
https://hydramight-backend.onrender.com/api/customer
```

Expected APIs:

```http
POST /api/customer/auth/commercial/signup-request
POST /api/customer/auth/commercial/login
GET  /api/customer/auth/me
PUT  /api/customer/auth/profile
GET  /api/customer/locations
GET  /api/customer/products?service_location_id=&ecom_channel=commercial
GET  /api/customer/products/:slug?service_location_id=&ecom_channel=commercial
GET  /api/customer/products/search?q=&service_location_id=&ecom_channel=commercial
POST /api/customer/orders
GET  /api/customer/orders
POST /api/customer/orders/:id/return
```

## Place order payload

```json
{
  "service_location_id": "uuid",
  "ecom_channel": "commercial",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 5
    }
  ],
  "delivery_address": {
    "full_name": "Business contact",
    "mobile": "9999999999",
    "address_line1": "Selected hub / business address",
    "city": "Gurgaon",
    "state": "Haryana",
    "pincode": "122001"
  },
  "remarks": "Commercial order from website"
}
```

## Important backend requirement

The backend must validate commercial orders server-side:

- logged-in user has `customer_type = commercial`
- user profile is `active`
- related `commercial_customers.status = approved`
- product belongs to `ecom_channel = commercial`
- stock is available at selected service location
- price is calculated from DB, not from frontend

