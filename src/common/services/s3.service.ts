import * as fs from "node:fs";
import {
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
  GetObjectCommand,
  type GetObjectCommandInput,
  PutObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { UploadedFile } from "express-fileupload";

import { env } from "@/common/utils/envConfig";
import { s3 } from "@/common/utils/s3";

const Bucket = env.AWS_S3_BUCKET;

class S3Service {
  async uploadFile(path: string, file: UploadedFile, fileName?: string) {
    const ext_name = file.name.split(".")[1];
    const name = fileName ?? "CRNA";
    const Key = `${name}.${ext_name}`;

    const bufferData = fs.readFileSync(file.tempFilePath);

    const params: PutObjectCommandInput = {
      Bucket,
      Key: `${path}/${Key}`,
      Body: bufferData,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    return Key;
  }

  async downloadFile(path: string, key: string) {
    const params: GetObjectCommandInput = {
      Bucket,
      Key: `${path}/${key}`,
    };

    return await getSignedUrl(s3, new GetObjectCommand(params));
  }

  async deleteFile(path: string, key: string) {
    let newKey: string = key;

    if (key.includes("https") && key.includes("school-images")) {
      newKey = key.split("school-images/")[1];
    } else if (key.includes("https") && key.includes("thumbnails")) {
      newKey = key.split("thumbnails/")[1];
    }

    const params: DeleteObjectCommandInput = {
      Bucket,
      Key: `${path}/${newKey}`,
    };

    await s3.send(new DeleteObjectCommand(params));

    return { message: "File deleted successfully!" };
  }
}

export const s3Service = new S3Service();
