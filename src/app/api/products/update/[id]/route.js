import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const productId = params?.id;
    const body = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    // Fetch the current product (to preserve images)
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Exclude images from the update request
    delete body.images;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: body }, // Only update allowed fields
      { new: true, runValidators: true },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
