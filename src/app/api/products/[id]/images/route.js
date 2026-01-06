// app/api/products/[id]/images/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import { isAuthenticatedUser, authorizeRoles } from "@/middlewares/auth";

export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    await dbConnect();

    const user = await isAuthenticatedUser(request);
    console.log(user, "user");

    if (user) {
      console.log(user.role);

      authorizeRoles(user, "admin");
    }

    const { images, youtubeUrl } = await request.json();

    if ((!images || !Array.isArray(images) || images.length === 0) && youtubeUrl === undefined) {
      return NextResponse.json(
        { error: "No images or YouTube URL provided" },
        { status: 400 },
      );
    }

    const update = {};
    if (images && Array.isArray(images) && images.length > 0) {
      update.$push = { images: { $each: images } };
    }
    if (youtubeUrl !== undefined) {
      // Ensure it's an array for the database
      update.$set = { youtubeUrl: Array.isArray(youtubeUrl) ? youtubeUrl : [youtubeUrl].filter(Boolean) };
    }

    // Use findByIdAndUpdate but return the full product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error saving images:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
