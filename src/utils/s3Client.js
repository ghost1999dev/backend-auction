import { S3Client} from "@aws-sdk/client-s3"

export const s3Client = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_ACCESS_SECRET_KEY,
    }
})