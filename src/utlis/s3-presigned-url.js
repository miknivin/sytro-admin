// lib/s3-presigned-url.js
"use server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create S3 client once – reused on every request (best practice)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate presigned URL for upload or download
 */
export async function getPresignedUrl({
  operation = "upload", // 'upload' or 'download'
  bucket,
  key,
  contentType, // required only for upload
  expiresIn = 3600, // seconds (default 1 hour)
} = {}) {
  // Validation
  if (!bucket || !key) {
    throw new Error("bucket and key are required");
  }
  if (operation === "upload" && !contentType) {
    throw new Error("contentType is required for upload");
  }

  let command;

  if (operation === "upload") {
    command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      // Uncomment next line if you want the file to be publicly readable
      // ACL: 'public-read',
    });
  } else {
    command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
  }

  // Generate and return the presigned URL
  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}
