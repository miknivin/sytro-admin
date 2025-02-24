import { NextResponse } from "next/server";

import dbConnect from '@/lib/db/connection';
import Product from '@/models/Products';
import { uploadFilesToS3 } from "../../utils/imageUpload/S3Upload";


export async function PATCH(req) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const productId = formData.get("productId");
    const files = formData.getAll("files");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (productId !== "67a70ca93f464380b64b05a6") {
      return NextResponse.json({ message: "not kids bag" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedFiles = await uploadFilesToS3(files);
    const fileUrls = uploadedFiles.map((file) => file.url);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $addToSet: { choiceImages: { $each: fileUrls } } },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Choice images updated successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}