import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { MediaItem } from "../types";

export async function syncToS3(
  items: MediaItem[],
  config: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  }
) {
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true, // Often needed for S3-compatible storage
  });

  const data = JSON.stringify(items, null, 2);
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: "journal.json",
    Body: data,
    ContentType: "application/json",
  });

  try {
    await client.send(command);
    console.log("Successfully synced to S3");
  } catch (error) {
    console.error("Failed to sync to S3:", error);
    throw error;
  }
}

export async function fetchFromS3(
  config: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  }
): Promise<MediaItem[]> {
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: "journal.json",
  });

  try {
    const response = await client.send(command);
    const data = await response.Body?.transformToString();
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to fetch from S3:", error);
    throw error;
  }
}
