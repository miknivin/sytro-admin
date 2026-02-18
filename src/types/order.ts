import { Types } from "mongoose";

/* ---------- Sub-types ---------- */

export interface ShippingInfo {
  fullName?: string;
  address: string;
  email?: string;
  state?: string;
  city: string;
  phoneNo: string;
  zipCode: string;
  country: string; // default: "India"
}

export interface OrderItem {
  name: string;
  uploadedImage: string[];
  quantity: number;
  image: string;
  price: string;
  product: Types.ObjectId;
  customNameToPrint?: string;
}

export interface PaymentInfo {
  id?: string;
  status?: string;
}

export interface OrderTracking {
  Status?: string;
  StatusDateTime?: Date;
  StatusType?: string;
  StatusLocation?: string;
  Instructions?: string;
}

/* ---------- Main Order Type ---------- */

export interface Order {
  _id: Types.ObjectId;

  shippingInfo: ShippingInfo;
  user: Types.ObjectId;

  orderItems: OrderItem[];

  paymentMethod: "COD" | "Online" | "Partial-COD";

  advancePaidAt?: Date | null;

  remainingAmount: number; // computed

  codAmount: number; // computed

  codChargeCollected: number; // default: 100

  advancePaid: number;

  paymentInfo?: PaymentInfo;

  itemsPrice: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;

  couponApplied?: string; // default: "No"
  discountAmount?: number;

  couponDiscountType?: string;
  couponDiscountValue?: number;

  orderStatus: "Processing" | "Shipped" | "Delivered";

  waybill?: string;
  invoiceURL?: string;

  delhiveryCurrentStatus?: string | null;

  orderTracking?: OrderTracking[];

  shiprocketOrderId?: string;

  orderNotes?: string;

  pickupScheduled?: boolean;
  pickupDate?: string;
  pickupTime?: string;
  pickupRequestId?: string;

  deliveredAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
