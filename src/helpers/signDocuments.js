import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "../utils/s3Client.js"

const sigDocument = async (document) => {
    let documentUrl = ''

    if (!document) {
        documentUrl = null
    }
    else {
        documentUrl = await getSignedUrl(s3Client, new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: document.s3Key,
        }),
        { 
            expiresIn: 60 * 60 * 24 
        })
    }

    return documentUrl
} 

export default sigDocument