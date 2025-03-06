import { Types } from "mongoose";

type Review = {
  user: Types.ObjectId;
  ratings: number;
  comment: string;
};

type Dimensions = {
  length?: number;
  width?: number;
  height?: number;
  unit?: "cm" | "inches";
};

type Specifications = {
  dimensions?: Dimensions;
  color?: string;
  weight?: number;
};

type Details = {
  description: string;
  features?: string[];
  materialUsed?: string[];
};

type Image = {
  url: string;
  _id: string;
};

export type Product = {
  _id: Types.ObjectId;
  name: string;
  actualPrice: number;
  offer?: number;
  details: Details;
  ratings: number;
  images: Image[];
  category: "Kids Bags" | "Professional Bags" | "Travel Bags";
  specifications?: Specifications;
  capacity: number;
  size: "Small" | "Medium" | "Large"; 
  stock: number;
  numOfReviews: number;
  reviews: Review[];
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  templateImages: any[];
};
