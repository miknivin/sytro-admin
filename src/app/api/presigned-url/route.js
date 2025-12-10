// app/api/presigned-url/route.js

import { NextResponse } from "next/server";
import { getPresignedUrl } from "../../../utlis/s3-presigned-url";

export async function POST(request) {
  try {
    const { files } = await request.json();

    // files = [{ name: "photo.jpg", type: "image/jpeg" }, ...]
    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadData = [];

    for (const file of files) {
      const { name, type } = file;

      const key = `products/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${name}`;

      const presignedUrl = await getPresignedUrl({
        operation: "upload",
        bucket: process.env.AWS_BUCKET_NAME,
        key,
        contentType: type,
        expiresIn: 600, // 10 minutes
      });

      const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      uploadData.push({
        presignedUrl,
        publicUrl,
        key,
        filename: name,
      });
    }

    return NextResponse.json({ success: true, uploads: uploadData });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate URLs" },
      { status: 500 },
    );
  }
}
