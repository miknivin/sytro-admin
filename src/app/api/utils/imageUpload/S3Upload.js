import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFilesToS3(files) {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  const uploadedFiles = [];

  for (const file of files) {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit random number
    const timestamp = Date.now(); // Current timestamp
    const uniqueFileName = `${uniqueId}-${timestamp}${file.name}`; // 6-digit ID + timestamp +
    console.log(uniqueFileName, "unique file name");

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uniqueFileName}`,
      Body: fileBuffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${uniqueFileName}`;
    uploadedFiles.push({ name: file.name, url: fileUrl });
  }

  return uploadedFiles;
}
