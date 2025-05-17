import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "../utils/s3Client.js"

const signImage = async (image) => {
    let imageUrl = ''

    if (!image) {
        const defaultCommand = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: 'default.jpeg',
        })

        imageUrl = await getSignedUrl(s3Client, defaultCommand, { expiresIn: 60 * 60 * 24 })
    }
    else {
        const s3key = image.includes("amazonaws.com/") 
            ? image.split("amazonaws.com/")[1]
            : image

        const command = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: s3key,
        })

        imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 })
    }

    return imageUrl
}

export default signImage