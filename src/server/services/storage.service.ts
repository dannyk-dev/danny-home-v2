import type { Base64FileInput, UploadedFileMeta } from "@/lib/schemas/storage";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import type { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";



const bucket  = process.env.AWS_S3_BUCKET!;
const region  = process.env.AWS_REGION!;
const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const putObject = (params: Omit<PutObjectCommandInput, "Bucket">) =>
  s3.send(new PutObjectCommand({ Bucket: bucket, ...params }));

const deleteObject = (key: string) =>
  s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

export const storageService = {
  async upload(
    db: PrismaClient,
    files: Base64FileInput[],
    uploaderId?: string,
  ): Promise<UploadedFileMeta[]> {
    const uploaded: UploadedFileMeta[] = [];

    // 1️⃣  Upload to S3
    for (const file of files) {
      const buffer = Buffer.from(file.data, "base64");
      const key = `${uuidv4()}-${file.name}`;

      await putObject({
        Key:          key,
        Body:         buffer,
        ContentType:  file.type,
        ContentLength: buffer.byteLength,
      });

      uploaded.push({
        key,
        url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
        mimeType: file.type,
        size: buffer.byteLength,
      });
    }

    // 2️⃣  Persist in DB
    await db.attachment.createMany({
      data: uploaded.map((f) => ({
        key:      f.key,
        url:      f.url,
        mimeType: f.mimeType,
        size:     f.size,
        uploaderId,
      })),
    });

    return uploaded;
  },

  /** Deletes both from S3 and DB. */
  async remove(prisma: PrismaClient, key: string) {
    await deleteObject(key);
    await prisma.attachment.deleteMany({ where: { key } });
    return { deleted: true, key };
  },
};
