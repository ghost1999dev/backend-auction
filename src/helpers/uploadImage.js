import { PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import dotenv from "dotenv"
import { s3Client } from "../utils/s3Client.js"

dotenv.config()

/**
 * 
 * @param {string} extension - Extension of the file.
 * @param {string} typeMIME - MIME type of the file.
 */
const getContentType = (extension) => {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  }

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
}

/**
 * Upload image to AWS S3.
 * @param {object} options - Object containing the file path, bucket name, and file name.
 * @param {string} options.filePath - Path to the image file.
 * @param {string} options.bucketName - Name of the bucket.
 * @param {string} options.originalName - Name of the file.
 * @param {string} options.folderName - Name of the folder.
 * @returns {string} URL of the uploaded image.
 */
const uploadImage = async ({
  filePath,
  originalName,
  folderName = '',
}) => {
  try {
    if (!filePath || !originalName) {
      throw new Error('Missing required parameters')
    }

    const fileContent = fs.readFileSync(filePath)
    const fileExtension = path.extname(originalName)
    const fileName = `${uuidv4()}${fileExtension}`

    const s3Key = folderName
      ? `${folderName}/${fileName}`.replace(/\/+/g, '/')
      : fileName

    const contentType = getContentType(fileExtension)

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
    }

    const command = new PutObjectCommand(params)
    const data = await s3Client.send(command)

    const fileURL = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${s3Key}`

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    return {
      success: true,
      key: s3Key,
      url: fileURL,
      etag: data.ETag,
      originalName,
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Error uploading image to s3', error.message)
  }
}

export default uploadImage