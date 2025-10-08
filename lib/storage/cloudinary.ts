import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadOptions {
  folder?: string
  publicId?: string
  transformation?: any
  tags?: string[]
}

export class CloudinaryService {
  static async uploadFile(
    file: Buffer | string,
    options: UploadOptions = {}
  ) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: options.folder || 'esawitku',
        public_id: options.publicId,
        transformation: options.transformation,
        tags: options.tags,
        resource_type: 'auto',
      })

      return {
        success: true,
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async deleteFile(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      
      return {
        success: result.result === 'ok',
        result: result.result,
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static generateImageUrl(publicId: string, transformation?: any) {
    return cloudinary.url(publicId, {
      transformation,
      secure: true,
    })
  }

  static async uploadDocument(
    file: Buffer,
    fileName: string,
    category: string
  ) {
    return this.uploadFile(file, {
      folder: `esawitku/documents/${category}`,
      tags: [category, 'document'],
    })
  }

  static async uploadImage(
    file: Buffer,
    fileName: string,
    category: string
  ) {
    return this.uploadFile(file, {
      folder: `esawitku/images/${category}`,
      tags: [category, 'image'],
      transformation: {
        quality: 'auto',
        fetch_format: 'auto',
      },
    })
  }
}
