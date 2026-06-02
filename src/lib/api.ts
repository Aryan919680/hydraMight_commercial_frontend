export const API_BASE =
  "https://hydramight-backend.onrender.com/api/customer";


  export type CustomerType = "household" | "commercial";

export type CustomerUser = {
  id: string;
  full_name?: string | null;
  mobile: string;
  email?: string | null;
  user_type: "customer";
  customer_type: CustomerType;
  status: string;
  is_mobile_verified: boolean;
};


export type CommercialSignupPayload = {
  business_name: string;
  contact_person: string;
  gst_number: string;
  email: string;
  phone: string;
  address_line1: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type CommercialSignupResponse = {
  id?: string;
  status?: "pending" | "approved" | "rejected" | string;
  message?: string;
};

export type CommercialLoginPayload = {
  email: string;
  password: string;
};

export type SendOtpResponse = {
  request_id: string;
  mobile: string;
  customer_type: CustomerType;
  expires_at: string;
  dummy_otp?: string;
};

export type VerifyOtpResponse = {
  token: string;
  user: CustomerUser;
};

export type ApiLocation = {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  radius_km: string;
};

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
};

export type ApiProductImage = {
  id: string;
  image_url: string;
  storage_bucket?: string | null;
  storage_path?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  alt_text?: string | null;
  is_primary?: boolean;
  display_order?: number;
};

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;

  short_description: string | null;
  description: string | null;
  brand: string | null;

  ecom_channel: "household" | "commercial" | string;

  unit: string | null;
  weight: string | number | null;
  quantity_value: string | number | null;
  quantity_unit: string | null;

  is_featured: boolean;

  category_id: string;
  category_name: string;
  category_slug: string;

  mrp: string | number | null;
  selling_price: string | number | null;
  currency: string;

  service_location_id: string;
  service_location_name?: string;
  service_location_city?: string;
  service_location_state?: string;
  service_location_pincode?: string;

  // backward compatibility for old UI code
  location_id?: string;

  allocated_stock?: number;
  reserved_stock?: number;
  available_stock: number;
  is_out_of_stock?: boolean;
  is_low_stock?: boolean;

  primary_image: string | null;
  images?: ApiProductImage[];

  relevance_score?: number;
};

export type ApiPagination = {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
};

export type ProductSearchResponse = {
  success: boolean;
  query: string;
  filters: Record<string, unknown>;
  pagination: ApiPagination;
  data: ApiProduct[];
};


export type PlaceOrderItemPayload = {
  product_id: string;
  quantity: number;
};

export type DeliveryAddressPayload = {
  full_name?: string;
  mobile?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type PlaceOrderPayload = {
  service_location_id: string;
  ecom_channel: "household" | "commercial";
  items: PlaceOrderItemPayload[];
  delivery_address?: DeliveryAddressPayload;
  remarks?: string;
};

export type SalesOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  main_inventory_id?: string;
  allocation_id?: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: string | number;
  mrp: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  total_price: string | number;
  returned_quantity: number;
};

export type SalesOrder = {
  id: string;
  order_number: string;
  customer_id: string;
  customer_mobile: string;
  channel: string;
  sub_channel: string;
  service_location_id: string;
  order_status: string;
  payment_status: string;
  subtotal: string | number;
  discount_amount: string | number;
  delivery_charge: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  delivery_address?: DeliveryAddressPayload;
  remarks?: string | null;
  placed_at: string;
  updated_at: string;
};

export type PlaceOrderResponse = {
  order: SalesOrder;
  items: SalesOrderItem[];
};
export type ReturnOrderItemPayload = {
  order_item_id: string;
  quantity: number;
};

export type ReturnSalesOrderPayload = {
  reason?: string;
  items: ReturnOrderItemPayload[];
};

export type SalesReturnItem = {
  id: string;
  return_id: string;
  order_item_id: string;
  product_id: string;
  main_inventory_id?: string | null;
  allocation_id?: string | null;
  sku: string;
  quantity: number;
  refund_amount: string | number;
  created_at: string;
};

export type SalesReturn = {
  id: string;
  return_number: string;
  order_id: string;
  customer_id: string;
  return_status: string;
  reason?: string | null;
  total_refund_amount: string | number;
  created_at: string;
  updated_at: string;
};

export type ReturnSalesOrderResponse = {
  return_order: SalesReturn;
  items: SalesReturnItem[];
};

export const returnSalesOrder = async (
  orderId: string,
  payload: ReturnSalesOrderPayload
): Promise<ReturnSalesOrderResponse> => {
  const token = getCustomerToken();

  if (!token) {
    throw new Error("Please sign in to return order");
  }

  const res = await fetch(`${API_BASE}/orders/${orderId}/return`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Failed to return order");
  }

  return json.data as ReturnSalesOrderResponse;
};
export const placeSalesOrder = async (
  payload: PlaceOrderPayload
): Promise<PlaceOrderResponse> => {
  const token = getCustomerToken();

  if (!token) {
    throw new Error("Please sign in before placing order");
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Failed to place order");
  }

  return json.data as PlaceOrderResponse;
};

export const fetchCustomerOrders = async (): Promise<SalesOrder[]> => {
  const token = getCustomerToken();

  if (!token) {
    throw new Error("Please sign in to view orders");
  }

  const res = await fetch(`${API_BASE}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Failed to fetch orders");
  }

  return json.data as SalesOrder[];
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let json: any = null;

  try {
    json = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }

  return json.data as T;
}

async function getJsonWithAuth<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let json: any = null;

  try {
    json = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }

  return json.data as T;
}

function normalizeProduct(product: ApiProduct, fallbackLocationId?: string): ApiProduct {
  return {
    ...product,
    location_id:
      product.location_id ||
      product.service_location_id ||
      fallbackLocationId,
    images: product.images || [],
  };
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;

    try {
      const errorJson = await res.json();
      message = errorJson?.message || message;
    } catch {
      // ignore json parse error
    }

    throw new Error(message);
  }

  const json = await res.json();

  if (!json?.success) {
    throw new Error(json?.message || "API returned unsuccessful response");
  }

  return json.data as T;
}

async function getFullJson<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;

    try {
      const errorJson = await res.json();
      message = errorJson?.message || message;
    } catch {
      // ignore json parse error
    }

    throw new Error(message);
  }

  const json = await res.json();

  if (!json?.success) {
    throw new Error(json?.message || "API returned unsuccessful response");
  }

  return json as T;
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}



/**
 * Commercial customer - signup request
 * Expected backend route: POST /api/customer/auth/commercial/signup-request
 */
export const submitCommercialSignupRequest = async (
  payload: CommercialSignupPayload
): Promise<CommercialSignupResponse> => {
  return postJson<CommercialSignupResponse>(
    `${API_BASE}/commercial/signup-request`,
    {
      ...payload,
      customer_type: "commercial",
      phone: payload.phone.replace(/\s/g, ""),
    }
  );
};

/**
 * Commercial customer - email/password login after admin approval
 * Expected backend route: POST /api/customer/auth/commercial/login
 */
export const loginCommercialCustomer = async (
  payload: CommercialLoginPayload
): Promise<VerifyOtpResponse> => {
  return postJson<VerifyOtpResponse>(`${API_BASE}/commercial/login`, {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    customer_type: "commercial",
  });
};

/**
 * Customer Auth - Send Dummy OTP
 */
export const sendCustomerOtp = async (
  mobile: string,
  customer_type: CustomerType = "household"
): Promise<SendOtpResponse> => {
  return postJson<SendOtpResponse>(`${API_BASE}/auth/send-otp`, {
    mobile,
    customer_type,
  });
};

/**
 * Customer Auth - Verify Dummy OTP
 */
export const verifyCustomerOtp = async (payload: {
  mobile: string;
  otp: string;
  full_name?: string;
  email?: string;
  customer_type?: CustomerType;
}): Promise<VerifyOtpResponse> => {
  return postJson<VerifyOtpResponse>(`${API_BASE}/auth/verify-otp`, {
    mobile: payload.mobile,
    otp: payload.otp,
    full_name: payload.full_name,
    email: payload.email,
    customer_type: payload.customer_type || "household",
  });
};


export const updateCustomerProfile = async (payload: {
  full_name?: string;
  email?: string;
  customer_type?: CustomerType;
}): Promise<CustomerUser> => {
  const token = getCustomerToken();

  if (!token) {
    throw new Error("Customer is not logged in");
  }

  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Failed to update profile");
  }

  localStorage.setItem("customer_user", JSON.stringify(json.data));

  return json.data as CustomerUser;
};

/**
 * Customer Auth - Me
 */
export const fetchCustomerMe = async (
  token: string
): Promise<CustomerUser> => {
  return getJsonWithAuth<CustomerUser>(`${API_BASE}/auth/me`, token);
};

/**
 * Local customer auth storage helpers
 */
export const saveCustomerSession = (data: VerifyOtpResponse) => {
  localStorage.setItem("customer_token", data.token);
  localStorage.setItem("customer_user", JSON.stringify(data.user));
};

export const getCustomerToken = () => {
  return localStorage.getItem("customer_token");
};

export const getStoredCustomerUser = (): CustomerUser | null => {
  const raw = localStorage.getItem("customer_user");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as CustomerUser;
  } catch {
    return null;
  }
};

export const clearCustomerSession = () => {
  localStorage.removeItem("customer_token");
  localStorage.removeItem("customer_user");
};

/**
 * Locations
 */
export const fetchLocations = () =>
  getJson<ApiLocation[]>(`${API_BASE}/locations`);

/**
 * Categories
 */
export const fetchCategories = () =>
  getJson<ApiCategory[]>(`${API_BASE}/categories`);

/**
 * Product listing
 */
export const fetchProducts = async (
  locationId: string,
  ecom_channel: "household" | "commercial" = "household",
  options?: {
    category_slug?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<ApiProduct[]> => {
  const url =
    `${API_BASE}/products` +
    buildQuery({
      service_location_id: locationId,
      ecom_channel,
      category_slug: options?.category_slug,
      search: options?.search,
      featured: options?.featured ? "true" : undefined,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });

  const products = await getJson<ApiProduct[]>(url);
  return products.map((p) => normalizeProduct(p, locationId));
};

/**
 * Product detail by slug
 */
export const fetchProductBySlug = async (
  slug: string,
  locationId: string,
  ecom_channel: "household" | "commercial" = "household"
): Promise<ApiProduct | null> => {
  try {
    const url =
      `${API_BASE}/products/${encodeURIComponent(slug)}` +
      buildQuery({
        service_location_id: locationId,
        ecom_channel,
      });

    const product = await getJson<ApiProduct>(url);
    return normalizeProduct(product, locationId);
  } catch (error: any) {
    if (String(error?.message || "").includes("404")) return null;
    return null;
  }
};

/**
 * Product detail by id
 */
export const fetchProductById = async (
  id: string,
  locationId: string,
  ecom_channel: "household" | "commercial" = "household"
): Promise<ApiProduct | null> => {
  try {
    const url =
      `${API_BASE}/products/id/${encodeURIComponent(id)}` +
      buildQuery({
        service_location_id: locationId,
        ecom_channel,
      });

    const product = await getJson<ApiProduct>(url);
    return normalizeProduct(product, locationId);
  } catch (error: any) {
    if (String(error?.message || "").includes("404")) return null;
    return null;
  }
};

/**
 * Product detail by slug or id
 */
export const fetchProduct = async (
  slugOrId: string,
  locationId: string,
  ecom_channel: "household" | "commercial" = "household"
): Promise<ApiProduct | null> => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(slugOrId)) {
    return fetchProductById(slugOrId, locationId, ecom_channel);
  }

  return fetchProductBySlug(slugOrId, locationId, ecom_channel);
};

/**
 * Recommendations
 */
export const fetchRecommendations = async (
  slug: string,
  locationId: string,
  ecom_channel: "household" | "commercial" = "household",
  limit = 8
): Promise<ApiProduct[]> => {
  const url =
    `${API_BASE}/products/${encodeURIComponent(slug)}/recommendations` +
    buildQuery({
      service_location_id: locationId,
      ecom_channel,
      limit,
    });

  const json = await getFullJson<{
    success: boolean;
    selected_product: unknown;
    data: ApiProduct[];
  }>(url);

  const seen = new Set<string>();

  return (json.data || [])
    .filter((product) => {
      if (seen.has(product.id) || product.slug === slug) return false;
      seen.add(product.id);
      return true;
    })
    .map((p) => normalizeProduct(p, locationId));
};

/**
 * Product search
 */
export const searchProducts = async (
  query: string,
  locationId: string,
  ecom_channel: "household" | "commercial" = "household",
  options?: {
    category_slug?: string;
    min_price?: number;
    max_price?: number;
    featured?: boolean;
    in_stock?: boolean;
    sort?:
      | "relevance"
      | "price_low_to_high"
      | "price_high_to_low"
      | "newest"
      | "stock_high_to_low";
    limit?: number;
    offset?: number;
  }
): Promise<{
  products: ApiProduct[];
  pagination: ApiPagination;
}> => {
  const url =
    `${API_BASE}/products/search` +
    buildQuery({
      q: query,
      service_location_id: locationId,
      ecom_channel,
      category_slug: options?.category_slug,
      min_price: options?.min_price,
      max_price: options?.max_price,
      featured: options?.featured ? "true" : undefined,
      in_stock: options?.in_stock === false ? "false" : "true",
      sort: options?.sort || "relevance",
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });

  const json = await getFullJson<ProductSearchResponse>(url);

  return {
    products: (json.data || []).map((p) => normalizeProduct(p, locationId)),
    pagination: json.pagination,
  };
};