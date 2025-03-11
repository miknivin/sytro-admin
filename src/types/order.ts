import { Types } from "mongoose";

export interface ShippingInfo {
  fullName?: string;
  address: string;
  city: string;
  phoneNo: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: string;
  product: Types.ObjectId;
  uploadedImage:string
}

export interface PaymentInfo {
  id?: string;
  status?: string;
}

export interface Order {
  _id: string;
  shippingInfo: ShippingInfo;
  user: Types.ObjectId;
  orderItems: OrderItem[];
  paymentMethod: "COD" | "Online";
  paymentInfo?: PaymentInfo;
  itemsPrice: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderStatus: "Processing" | "Shipped" | "Delivered";
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
