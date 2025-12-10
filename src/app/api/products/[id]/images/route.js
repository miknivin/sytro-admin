// app/api/products/[id]/images/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import { isAuthenticatedUser, authorizeRoles } from "@/middlewares/auth";

export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    await dbConnect();
    console.log(request.cookies, "cookies");

    const user = await isAuthenticatedUser(request);
    console.log(user, "user");

    if (user) {
      console.log(user.role);

      authorizeRoles(user, "admin");
    }

    const { images } = await request.json(); // array of { url: "https://...", name: "photo.jpg" }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 },
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $push: { images: { $each: images } } },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      images: updatedProduct.images,
    });
  } catch (error) {
    console.error("Error saving images:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
