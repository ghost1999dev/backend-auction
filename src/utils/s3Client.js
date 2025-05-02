import { S3Client} from "@aws-sdk/client-s3"
import dotenv from "dotenv";

dotenv.config()

export const s3Client = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_ACCESS_SECRET_KEY,
    }
})