import { Types } from "mongoose";

export interface ShippingInfo {
  fullName?: string;
  address: string;
  city: string;
  phoneNo: string;
  zipCode: string;
  country: string;
  email?: string;
  state?: string;
}

export interface OrderTracking {
  Status: string;
  StatusDateTime: Date;
  StatusType: string;
  StatusLocation: string;
  Instructions: string;
}
export interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
  customNameToPrint?: string;
  product: string | Types.ObjectId;
  uploadedImage: string[];
}

export interface PaymentInfo {
  id?: string;
  status?: string;
}

export interface Order {
  _id: string;
  shippingInfo: ShippingInfo;
  user: Types.ObjectId | string;
  orderItems: OrderItem[];
  paymentMethod: "COD" | "Online";
  paymentInfo?: PaymentInfo;
  itemsPrice: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderNotes?: string;
  orderStatus: "Processing" | "Shipped" | "Delivered";
  deliveredAt?: Date;
  couponApplied?: string;
  createdAt: Date;
  updatedAt?: Date;
  waybill?: string;
  invoiceURL?: string;
  delhiveryCurrentStatus?: string | null;
  orderTracking?: OrderTracking[];
  shiprocketOrderId?: string;
  discountAmount?: number;
  couponDiscountType?: string;
  couponDiscountValue?: number;
}
