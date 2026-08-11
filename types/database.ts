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
  payment_method: string | null;
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
    };
  };
}
