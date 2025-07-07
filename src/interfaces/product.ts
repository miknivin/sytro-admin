export interface Product {
  _id?: string;
  name: string;
  actualPrice: number;
  offer?: number;
  details: {
    description: string;
    features?: string[];
    materialUsed?: string[];
  };
  ratings?: number;
  images: {
    public_id?: string;
    url: string;
  }[];
  category: "Kids Bags" | "Casual Bags" | "Travel Bags";
  specifications?: {
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: "cm" | "inches";
    };
    color?: string;
    weight?: number;
  };
  offerEndTime?: any;
  capacity: number;
  size: "Small" | "Medium" | "Large";
  stock: number;
  numOfReviews?: number;
  reviews?: {
    user: string;
    ratings: number;
    comment: string;
  }[];
  user: string;
  createdAt?: string;
  updatedAt?: string;
}
