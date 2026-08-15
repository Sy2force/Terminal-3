export type EventOrderStatus =
  | "received"
  | "in_review"
  | "missing_info"
  | "age_verification_required"
  | "stock_check"
  | "modification_proposed"
  | "awaiting_client"
  | "confirmed_by_store"
  | "accepted_by_client"
  | "deposit_pending"
  | "deposit_received"
  | "preparing"
  | "ready"
  | "in_delivery"
  | "delivered"
  | "completed"
  | "rejected"
  | "cancelled";

export type EventPaymentStatus =
  | "none"
  | "deposit_requested"
  | "deposit_partial"
  | "deposit_received"
  | "balance_remaining"
  | "paid"
  | "refund_partial"
  | "refunded";

export type EventFulfillmentType = "delivery" | "pickup";

export type EventOrderItem = {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_agorot: number;
  total_price_agorot: number;
};

export type EventOrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_whatsapp?: string;
  preferred_contact: "phone" | "email" | "whatsapp";
  event_type: string;
  event_date?: string;
  event_time?: string;
  guests_count?: number;
  budget_agorot?: number;
  fulfillment_type: EventFulfillmentType;
  city?: string;
  delivery_address?: string;
  delivery_instructions?: string;
  notes?: string;
  items: EventOrderItem[];
};

export type EventOrder = {
  id: string;
  reference: string;
  access_token: string;
  customer_name: string;
  customer_email: string;
  event_type: string;
  status: EventOrderStatus;
  payment_status: EventPaymentStatus;
  total_agorot: number;
  created_at: string;
  updated_at: string;
};
