/**
 * Hand-written types mirroring `db/migrations/0001_init.sql` and
 * `0002_rls.sql`. If the Supabase CLI is available, prefer regenerating
 * this file with:
 *   supabase gen types typescript --local > types/database.ts
 */

export type ProductStatus = "draft" | "published" | "archived";
export type ProductType = "STANDARD" | "PLATTER";
export type ProductAvailabilityStatus =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "PREORDER"
  | "ON_REQUEST";
export type ProductMediaKind = "COVER" | "GALLERY" | "LIFESTYLE" | "DETAIL" | "EDITORIAL";
export type PromotionStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "expired"
  | "paused";
export type OrderStatus =
  | "received"
  | "reviewing"
  | "accepted"
  | "preparing"
  | "ready"
  | "collected"
  | "submitted"
  | "confirmed"
  | "completed"
  | "cancelled";

/**
 * Legacy+extended lifecycle statuses unified in the DB by migration 0044.
 */
export type ExtendedOrderStatus = OrderStatus;

export type OrderType = "personal" | "business";
export type IntendedPaymentMethod = "cash" | "card" | "bit" | "other";
export type OrderPaymentStatus =
  | "unpaid"
  | "paid_in_store"
  | "refunded"
  | "cancelled";
export type PriceSource = "public" | "pro_price" | "quote";
export type PackType = "unit" | "pack" | "case";
export type AccountType = "personal" | "business";
export type BarStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "approved"
  | "inactive";
export type PickupPreference = "self" | "delegate" | "delivery_when_available";
export type ProductRequestKind = "in_catalog" | "out_of_catalog";
export type ProductRequestStatus =
  | "new"
  | "reviewing"
  | "quoted"
  | "accepted"
  | "declined"
  | "fulfilled"
  | "cancelled";
export type FulfillmentGroupType = "NON_RESTRICTED" | "AGE_RESTRICTED";
export type FoodFulfillmentStatus =
  | "SUBMITTED"
  | "CONFIRMED"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";
export type AlcoholFulfillmentStatus =
  | "SUBMITTED"
  | "PENDING_AGE_VERIFICATION"
  | "AGE_VERIFIED"
  | "READY"
  | "COMPLETED"
  | "AGE_VERIFICATION_FAILED"
  | "CANCELLED";
export type AgeVerificationStatus = "PENDING" | "VERIFIED" | "FAILED";
export type EntitlementStatus = "ISSUED" | "REDEEMED" | "EXPIRED" | "REVOKED";
export type ContentStatus = "draft" | "scheduled" | "published";
export type AdminRoleType =
  | "OWNER"
  | "MANAGER"
  | "CONTENT_EDITOR"
  | "STAFF"
  | "COURIER"
  | "ORDER_MANAGER"
  | "DELIVERY_MANAGER"
  | "CUSTOMER_SUPPORT";
export type OrderChannel = "web" | "phone" | "manual";
export type OrderFulfillmentType = "pickup" | "delivery";
export type CategoryTheme = "DEFAULT" | "CELLAR" | "PACKSHOT" | "GOURMET" | "PLATTER" | "EDITORIAL";
/** Wine colour/style — only meaningful for products in the wine category. */
export type WineType = "ROUGE" | "BLANC" | "ROSE" | "EFFERVESCENT" | "DOUX";
/** How a variant's price should be read — lets the UI always show an unambiguous unit ("29 ₪ / 100 g", "89 ₪ / kg", "45 ₪ le paquet", "À partir de 149 ₪"). */
export type PricingUnit = "FIXED" | "PACKAGE" | "PER_100G" | "PER_KG" | "FROM";

export type HeroSlide = {
  id: string;
  category: string;
  title: string;
  description: string;
  imageDesktop: string;
  imageMobile?: string;
  imageAlt: string;
  badge?: string;
  metadata?: string[];
  primaryButtonLabel: string;
  primaryButtonLink: string;
  secondaryButtonLabel?: string;
  secondaryButtonLink?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
};
export type HomepageSectionType =
  | "HERO"
  | "CELLAR_DESCENT"
  | "PROMOTIONS"
  | "NEW_PRODUCTS"
  | "FEATURED_CATEGORY"
  | "FEATURED_PRODUCTS"
  | "EDITORIAL_IMAGE_TEXT"
  | "PLATTERS"
  | "INSPIRATIONS"
  | "MEMBERSHIP"
  | "STORE_INFORMATION"
  | "GALLERY";
export type DeliveryStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "DELIVERED"
  | "FAILED";

export type CartStatus = "active" | "converted" | "abandoned" | "expired";
export type InventoryMovementType =
  | "purchase"
  | "sale"
  | "reservation"
  | "reservation_release"
  | "return"
  | "adjustment"
  | "loss"
  | "damaged";
export type StockReservationStatus = "active" | "converted" | "expired" | "cancelled";
export type NavigationItemTarget = "_self" | "_blank";
export type CarouselKind =
  | "bottles"
  | "promotions"
  | "brands"
  | "categories"
  | "products"
  | "covers"
  | "events"
  | "inspirations";
export type BannerPosition =
  | "homepage_top"
  | "homepage_middle"
  | "homepage_bottom"
  | "category_top"
  | "category_bottom"
  | "site_wide"
  | "checkout";

export type BranchRow = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
}

export type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  /** Business vs personal customer (0043_business_b2b.sql). */
  account_type: AccountType;
  preferred_contact_channel: "phone" | "whatsapp" | "email" | null;
}

export type ClubMembershipRow = {
  id: string;
  user_id: string;
  status: string;
  source: string | null;
  joined_at: string;
  tier_id: string | null;
  /** Signup details (0017_club_membership_details.sql). */
  date_of_birth: string | null;
  preferred_language: string | null;
  preferences: string[];
  marketing_consent: boolean;
  privacy_accepted: boolean;
}

export type CategoryRow = {
  id: string;
  slug: string;
  name_he: string;
  name_fr: string | null;
  name_en: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  cover_image: string | null;
  icon: string | null;
  short_description: string | null;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  theme: CategoryTheme | null;
  created_at: string;
  updated_at: string;
}

export type ProductRow = {
  id: string;
  slug: string;
  category_id: string | null;
  product_type: ProductType;
  brand: string | null;
  brand_id: string | null;
  name_he: string;
  name_fr: string | null;
  name_en: string | null;
  description_he: string | null;
  description_fr: string | null;
  description_en: string | null;
  origin: string | null;
  tasting_notes: string | null;
  pairing_notes: string | null;
  how_to_serve: string | null;
  storage_info: string | null;
  kosher_status: string | null;
  allergen_info: string | null;
  age_restricted: boolean;
  status: ProductStatus;
  is_featured: boolean;
  availability_status: ProductAvailabilityStatus;
  base_price_agorot: number | null;
  compare_at_price_agorot: number | null;
  meta_title: string | null;
  meta_description: string | null;
  serves_min: number | null;
  serves_max: number | null;
  composition_text: string | null;
  advance_order_hours: number;
  customizable: boolean;
  preparation_time_minutes: number | null;
  published_at: string | null;
  new_until: string | null;
  created_at: string;
  updated_at: string;
  /** Wine-catalog fields (0011_wine_catalog_fields.sql) — null for non-wine products. */
  wine_type: WineType | null;
  region: string | null;
  country: string | null;
  grape_varieties: string[] | null;
  rating: number | null;
  review_count: number;
  is_best_seller: boolean;
  /** Optional custom badge label overriding the automatic New/Promo/Best-seller badges. */
  badge: string | null;
  serving_temperature: string | null;
  aging_potential: string | null;
  vinification_method: string | null;
  /** Spirits-catalog fields (0013_spirits_catalog_fields.sql) — generic enough to be reused by future categories too. */
  subcategory: string | null;
  age_years: number | null;
  nose_notes: string | null;
  palate_notes: string | null;
  finish_notes: string | null;
  cask_type: string | null;
  edition: string | null;
  production_method: string | null;
  /** Charcuterie-catalog fields (0014_charcuterie_fields.sql) — null for other categories. */
  meat_type: string | null;
  is_available_for_platter: boolean;
  nutrition_info: string | null;
  expiration_info: string | null;
  /** Fish-catalog fields (0015_fish_catalog_fields.sql) — null for other categories. */
  fish_type: string | null;
  preparation_method: string | null;
  smoked: boolean;
}

export type ProductVariantRow = {
  id: string;
  product_id: string;
  sku: string | null;
  /** Scannable barcode (EAN/UPC) stored as text to preserve leading zeros. */
  barcode?: string | null;
  label: string;
  weight_g: number | null;
  volume_ml: number | null;
  abv: number | null;
  vintage: number | null;
  regular_price_agorot: number | null;
  is_default: boolean;
  limited_stock: boolean;
  availability_status: ProductAvailabilityStatus;
  display_order: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  /** How to read this variant's price — null/"FIXED" behaves exactly like before. */
  pricing_unit: PricingUnit | null;
  /** e.g. "GLASS", "CAN", "VACUUM", "BULK", "PLASTIC" — null for wine/spirits/charcuterie. */
  packaging: string | null;
  wolt_enabled?: boolean;
  wolt_url?: string | null;
}

export type ProductMediaRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt: string | null;
  kind: ProductMediaKind;
  display_order: number;
  created_at: string;
}

export type InventoryRow = {
  id: string;
  variant_id: string;
  branch_id: string;
  quantity: number;
  updated_at: string;
}

export type PromotionRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  product_id: string | null;
  variant_id: string | null;
  branch_id: string | null;
  image_url: string | null;
  og_image_url: string | null;
  regular_price_agorot: number;
  promo_price_agorot: number;
  start_at: string;
  end_at: string;
  quantity_limit: number | null;
  remaining_quantity: number | null;
  members_only: boolean;
  featured: boolean;
  status: PromotionStatus;
  created_at: string;
  updated_at: string;
}

export type PromotionProductRow = {
  id: string;
  promotion_id: string;
  product_id: string;
}

export type FavoriteRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export type OrderRow = {
  id: string;
  user_id: string | null;
  branch_id: string;
  channel: OrderChannel;
  status: OrderStatus;
  customer_name: string | null;
  customer_phone: string | null;
  total_agorot: number;
  created_by_staff_user_id: string | null;
  fulfillment_type: OrderFulfillmentType;
  delivery_address: string | null;
  customer_notes: string | null;
  age_self_declared: boolean;
  discount_agorot: number;
  discount_label: string | null;
  created_at: string;
  updated_at: string;
  /** Delivery/pickup scheduling details (0016_order_fulfillment_details.sql). */
  city: string | null;
  floor: string | null;
  entry_code: string | null;
  delivery_instructions: string | null;
  desired_date: string | null;
  time_slot: string | null;
  estimated_ready_at: string | null;
  estimated_delivery_at: string | null;
  delivered_at: string | null;
  ready_notified_at: string | null;
  staff_notes: string | null;
  idempotency_key: string | null;
  /** B2B / bar extensions (0043_business_b2b.sql). */
  order_type: OrderType;
  bar_profile_id: string | null;
  quote_total_agorot: number | null;
  quote_sent_at: string | null;
  quote_approved_at: string | null;
  quote_rejected_at: string | null;
  quote_notes: string | null;
  ready_estimate_at: string | null;
  ready_estimate_label: string | null;
  intended_payment_method: IntendedPaymentMethod | null;
  payment_method_actual: string | null;
  payment_status: OrderPaymentStatus;
  paid_at: string | null;
  paid_by: string | null;
  id_checked_at: string | null;
  id_checked_by: string | null;
  public_order_number: string | null;
}

export type OrderFulfillmentGroupRow = {
  id: string;
  order_id: string;
  group_type: FulfillmentGroupType;
  food_status: FoodFulfillmentStatus | null;
  alcohol_status: AlcoholFulfillmentStatus | null;
  created_at: string;
  updated_at: string;
}

export type OrderItemRow = {
  id: string;
  order_id: string;
  fulfillment_group_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name_snapshot: string;
  variant_label_snapshot: string | null;
  regular_price_agorot_snapshot: number;
  promo_price_agorot_snapshot: number | null;
  final_price_agorot_snapshot: number;
  quantity: number;
  tax_info: Record<string, unknown> | null;
  created_at: string;
  /** B2B pricing (0043_business_b2b.sql). */
  pro_price_agorot_snapshot: number | null;
  price_source: PriceSource;
  line_notes: string | null;
  pack_type: PackType | null;
}

export type BarProfileRow = {
  id: string;
  user_id: string;
  business_name: string;
  legal_name: string | null;
  registration_number: string | null;
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  whatsapp_number: string | null;
  contact_email: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  preferred_contact_window: string | null;
  pickup_preference: PickupPreference | null;
  notes: string | null;
  status: BarStatus;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductRequestRow = {
  id: string;
  public_reference: string | null;
  user_id: string;
  bar_profile_id: string | null;
  kind: ProductRequestKind;
  requested_type: string | null;
  requested_brand: string | null;
  requested_name: string | null;
  requested_volume_ml: number | null;
  requested_quantity: number;
  requested_budget_agorot: number | null;
  photo_url: string | null;
  comment: string | null;
  product_id: string | null;
  variant_id: string | null;
  status: ProductRequestStatus;
  quote_price_agorot: number | null;
  quote_note: string | null;
  admin_response: string | null;
  handled_by: string | null;
  handled_at: string | null;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ProPriceHistoryRow = {
  id: string;
  order_id: string;
  order_item_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  old_price_agorot: number | null;
  new_price_agorot: number;
  reason: string | null;
  changed_by: string | null;
  created_at: string;
}

export type AgeVerificationRow = {
  id: string;
  order_id: string;
  fulfillment_group_id: string;
  status: AgeVerificationStatus;
  verified_at: string | null;
  verified_by_staff_user_id: string | null;
  created_at: string;
}

export type DiscountEntitlementRow = {
  id: string;
  user_id: string;
  code: string;
  discount_percent: number;
  eligibility_rules: Record<string, unknown>;
  status: EntitlementStatus;
  issued_at: string;
  redeemed_at: string | null;
  order_id: string | null;
}

export type ContentPostRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  hero_image_url: string | null;
  category: string | null;
  body: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentSectionRow = {
  id: string;
  post_id: string;
  sort_order: number;
  heading: string | null;
  body: string | null;
  image_url: string | null;
}

export type ContentProductRow = {
  id: string;
  post_id: string;
  product_id: string;
  sort_order: number;
}

export type NotificationPreferenceRow = {
  user_id: string;
  promotions_opt_in: boolean;
  new_arrivals_opt_in: boolean;
  club_opt_in: boolean;
  updated_at: string;
}

export type AdminRoleRow = {
  id: string;
  user_id: string;
  role: AdminRoleType;
  branch_id: string | null;
  created_at: string;
}

export type AuditLogRow = {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type SiteSettingRow = {
  key: string;
  value: unknown;
  updated_at: string;
  updated_by: string | null;
}

type TableDef<Row, RequiredInsertKeys extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, RequiredInsertKeys>;
  Update: Partial<Row>;
  Relationships: [];
};

export type HomepageSectionRow = {
  id: string;
  section_type: HomepageSectionType;
  sort_order: number;
  is_enabled: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type DeliveryRow = {
  id: string;
  order_id: string;
  courier_user_id: string | null;
  delivery_driver_id: string | null;
  status: DeliveryStatus;
  assigned_at: string;
  accepted_at: string | null;
  picked_up_at: string | null;
  in_transit_at: string | null;
  arrived_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  payment_collected: boolean;
  payment_collected_amount_agorot: number;
  payment_collected_method: string | null;
  payment_method: string | null;
  customer_instructions: string | null;
  created_at: string;
  updated_at: string;
};

export type MembershipTierRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  discount_percent: number;
  is_enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductRelationRow = {
  id: string;
  product_id: string;
  related_product_id: string;
  sort_order: number;
  created_at: string;
};

export type ProductReviewRow = {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  comment: string;
  is_published: boolean;
  created_at: string;
};

export type BrandRow = {
  id: string;
  slug: string;
  name: string;
  name_he: string | null;
  name_en: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PageContentStatus = "draft" | "scheduled" | "published" | "archived";

export type PageContentRow = {
  id: string;
  slug: string;
  page_type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  blocks: unknown;
  status: PageContentStatus;
  draft_blocks: unknown | null;
  scheduled_at: string | null;
  published_at: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentRevisionRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  author_id: string | null;
  action: string;
  previous_value: unknown;
  new_value: unknown;
  is_published: boolean;
  created_at: string;
};

export type MediaKind = "image" | "video" | "model3d" | "document";

export type MediaRow = {
  id: string;
  filename: string;
  original_url: string;
  thumbnail_url: string | null;
  alt: string | null;
  kind: MediaKind;
  mime_type: string | null;
  file_size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  folder: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaUsageRow = {
  id: string;
  media_id: string;
  entity_type: string;
  entity_id: string;
  field_path: string;
  created_at: string;
};

export type PaymentMethod =
  | "cash_store"
  | "cash_delivery"
  | "card_store"
  | "card_delivery"
  | "wolt"
  | "refund"
  | "manual";

export type PaymentStatus =
  | "unpaid"
  | "cash_store_expected"
  | "card_store_expected"
  | "cash_delivery_expected"
  | "card_delivery_expected"
  | "partially_paid"
  | "paid"
  | "refunded"
  | "refused"
  | "cancelled";

export type PaymentRow = {
  id: string;
  order_id: string;
  amount_agorot: number;
  method: PaymentMethod | null;
  status: PaymentStatus;
  collected_by: string | null;
  collected_at: string | null;
  reference: string | null;
  notes: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentStatusHistoryRow = {
  id: string;
  payment_id: string;
  order_id: string;
  old_status: PaymentStatus | null;
  new_status: PaymentStatus;
  amount_agorot: number;
  changed_by: string | null;
  comment: string | null;
  created_at: string;
};

export type OrderNoteRow = {
  id: string;
  order_id: string;
  note: string;
  author_id: string | null;
  author_name: string | null;
  created_at: string;
};

export type OrderStatusHistoryRow = {
  id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  changed_by_name: string | null;
  comment: string | null;
  created_at: string;
};

export type DriverStatus = "active" | "inactive" | "on_duty" | "off_duty";

export type DeliveryDriverRow = {
  id: string;
  profile_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  status: DriverStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WoltConnectionStatus = "not_configured" | "configured" | "syncing" | "error" | "disconnected";

export type WoltConnectionRow = {
  id: string;
  merchant_id: string | null;
  venue_id: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  status: WoltConnectionStatus;
  last_synced_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

export type WoltProductMappingRow = {
  id: string;
  product_id: string;
  wolt_item_id: string;
  wolt_price_agorot: number | null;
  sync_enabled: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WoltSyncLogRow = {
  id: string;
  sync_type: string;
  status: string;
  items_count: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
};

export type NotificationType =
  | "new_order"
  | "urgent_order"
  | "payment_missing"
  | "low_stock"
  | "out_of_stock"
  | "delivery_failed"
  | "age_verification_issue"
  | "wolt_error"
  | "media_missing"
  | "publish_failed";

export type NotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type SectionTranslationRow = {
  id: string;
  key: string;
  lang: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  label: string | null;
  button_text: string | null;
  button_link: string | null;
  button_target: NavigationItemTarget | null;
  alt_text: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type NavigationMenuRow = {
  id: string;
  key: string;
  name_fr: string;
  name_he: string | null;
  created_at: string;
  updated_at: string;
};

export type NavigationItemRow = {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label_fr: string;
  label_he: string | null;
  href: string;
  target: NavigationItemTarget | null;
  icon_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ThemeSettingRow = {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
};

export type CarouselRow = {
  id: string;
  key: string;
  kind: CarouselKind;
  name_fr: string;
  name_he: string | null;
  is_active: boolean;
  autoplay: boolean;
  loop: boolean;
  pause_on_hover: boolean;
  interval_seconds: number;
  created_at: string;
  updated_at: string;
};

export type CarouselItemRow = {
  id: string;
  carousel_id: string;
  image_url: string | null;
  image_mobile_url: string | null;
  title_fr: string | null;
  title_he: string | null;
  subtitle_fr: string | null;
  subtitle_he: string | null;
  button_text_fr: string | null;
  button_text_he: string | null;
  button_link: string | null;
  display_order: number;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PromotionalBannerRow = {
  id: string;
  key: string;
  title_fr: string;
  title_he: string | null;
  description_fr: string | null;
  description_he: string | null;
  image_url: string | null;
  image_mobile_url: string | null;
  button_text_fr: string | null;
  button_text_he: string | null;
  button_link: string | null;
  discount_percent: number | null;
  position: BannerPosition;
  priority: number;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CartRow = {
  id: string;
  user_id: string | null;
  status: CartStatus;
  currency: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CartItemRow = {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type InventoryMovementRow = {
  id: string;
  variant_id: string;
  branch_id: string | null;
  movement_type: InventoryMovementType;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reason: string | null;
  order_id: string | null;
  reservation_id: string | null;
  created_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type StockReservationRow = {
  id: string;
  variant_id: string;
  branch_id: string | null;
  quantity: number;
  status: StockReservationStatus;
  order_id: string | null;
  cart_id: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type StockAlertRow = {
  id: string;
  variant_id: string;
  branch_id: string | null;
  threshold: number;
  is_triggered: boolean;
  triggered_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPresenceRow = {
  id: string;
  session_id: string;
  user_id: string | null;
  anonymous: boolean;
  last_seen_at: string;
  created_at: string;
};

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      branches: TableDef<BranchRow, "name" | "address">;
      profiles: TableDef<ProfileRow, "id">;
      club_memberships: TableDef<ClubMembershipRow, "user_id">;
      categories: TableDef<CategoryRow, "slug" | "name_he">;
      products: TableDef<ProductRow, "slug" | "name_he">;
      product_variants: TableDef<ProductVariantRow, "product_id" | "label">;
      product_media: TableDef<ProductMediaRow, "product_id" | "url">;
      inventory: TableDef<InventoryRow, "variant_id" | "branch_id">;
      promotions: TableDef<
        PromotionRow,
        | "slug"
        | "title"
        | "regular_price_agorot"
        | "promo_price_agorot"
        | "start_at"
        | "end_at"
      >;
      promotion_products: TableDef<
        PromotionProductRow,
        "promotion_id" | "product_id"
      >;
      favorites: TableDef<FavoriteRow, "user_id" | "product_id">;
      orders: TableDef<OrderRow, "branch_id">;
      order_fulfillment_groups: TableDef<
        OrderFulfillmentGroupRow,
        "order_id" | "group_type"
      >;
      order_items: TableDef<
        OrderItemRow,
        | "order_id"
        | "fulfillment_group_id"
        | "product_name_snapshot"
        | "regular_price_agorot_snapshot"
        | "final_price_agorot_snapshot"
      >;
      order_notes: TableDef<OrderNoteRow, "order_id">;
      order_status_history: TableDef<OrderStatusHistoryRow, "order_id">;
      age_verifications: TableDef<
        AgeVerificationRow,
        "order_id" | "fulfillment_group_id"
      >;
      discount_entitlements: TableDef<DiscountEntitlementRow, "user_id">;
      content_posts: TableDef<ContentPostRow, "slug" | "title">;
      content_sections: TableDef<ContentSectionRow, "post_id">;
      content_products: TableDef<
        ContentProductRow,
        "post_id" | "product_id"
      >;
      notification_preferences: TableDef<
        NotificationPreferenceRow,
        "user_id"
      >;
      admin_roles: TableDef<AdminRoleRow, "user_id" | "role">;
      audit_logs: TableDef<AuditLogRow, "action" | "entity_type">;
      site_settings: TableDef<SiteSettingRow, "key" | "value">;
      homepage_sections: TableDef<HomepageSectionRow, "section_type">;
      deliveries: TableDef<DeliveryRow, "order_id">;
      membership_tiers: TableDef<MembershipTierRow, "slug" | "name">;
      product_relations: TableDef<ProductRelationRow, "product_id" | "related_product_id">;
      product_reviews: TableDef<
        ProductReviewRow,
        "product_id" | "author_name" | "rating" | "comment"
      >;
      brands: TableDef<BrandRow, "slug" | "name">;
      page_contents: TableDef<PageContentRow, "slug" | "status">;
      content_revisions: TableDef<ContentRevisionRow, "entity_type" | "entity_id">;
      media: TableDef<MediaRow, "filename" | "kind" | "folder">;
      media_usage: TableDef<MediaUsageRow, "media_id" | "entity_type" | "entity_id">;
      payments: TableDef<PaymentRow, "order_id" | "status">;
      payment_status_history: TableDef<PaymentStatusHistoryRow, "payment_id">;
      delivery_drivers: TableDef<DeliveryDriverRow, "phone" | "status">;
      wolt_connections: TableDef<WoltConnectionRow, "status">;
      wolt_product_mappings: TableDef<WoltProductMappingRow, "product_id">;
      wolt_sync_logs: TableDef<WoltSyncLogRow, "sync_type" | "status" | "started_at">;
      notifications: TableDef<NotificationRow, "type" | "is_read" | "created_at">;
      carts: TableDef<CartRow, "user_id" | "status">;
      cart_items: TableDef<CartItemRow, "cart_id" | "product_id" | "variant_id">;
      inventory_movements: TableDef<InventoryMovementRow, "variant_id" | "movement_type">;
      stock_reservations: TableDef<StockReservationRow, "variant_id" | "status" | "expires_at">;
      stock_alerts: TableDef<StockAlertRow, "variant_id" | "is_triggered">;
      section_translations: TableDef<SectionTranslationRow, "key" | "lang">;
      navigation_menus: TableDef<NavigationMenuRow, "key" | "name_fr">;
      navigation_items: TableDef<NavigationItemRow, "menu_id" | "href" | "label_fr">;
      theme_settings: TableDef<ThemeSettingRow, "key" | "value">;
      carousels: TableDef<CarouselRow, "key" | "kind">;
      carousel_items: TableDef<CarouselItemRow, "carousel_id" | "display_order">;
      promotional_banners: TableDef<PromotionalBannerRow, "key" | "position">;
      /** B2B / bar (0043_business_b2b.sql). */
      bar_profiles: TableDef<
        BarProfileRow,
        "user_id" | "business_name" | "contact_first_name" | "contact_last_name" | "contact_phone"
      >;
      product_requests: TableDef<
        ProductRequestRow,
        "user_id" | "kind"
      >;
      pro_price_history: TableDef<
        ProPriceHistoryRow,
        "order_id" | "new_price_agorot"
      >;
      user_presence: TableDef<UserPresenceRow, "session_id">;
    };
  };
}
