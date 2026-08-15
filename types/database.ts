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
  | "submitted"
  | "confirmed"
  | "ready"
  | "completed"
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
export type AdminRoleType = "OWNER" | "MANAGER" | "CONTENT_EDITOR" | "STAFF" | "COURIER";
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
    };
  };
}
