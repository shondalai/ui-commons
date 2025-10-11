import { Attachment, AttachmentUploadResponse } from '../types/common.types'

// Re-export types for convenience
export type { Attachment, AttachmentUploadResponse }

/**
 * Attachment Service - Handles all attachment-related operations
 * Supports both temporary uploads and final attachment processing
 */
export class AttachmentService {
  /**
   * Upload file to temporary location
   * Files are uploaded to temp directory until form is saved
   */
  static async uploadTemporary (
    file: File,
    uploadUrl: string,
    type: string = 'default',
  ): Promise<AttachmentUploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': (window as any).Joomla?.getOptions?.('csrf.token') || '',
        },
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Handle nested response structure from Joomla backend
      if (result.success && result.data && result.data.attachment) {
        const backendAttachment = result.data.attachment
        const attachment: Attachment = {
          filename: backendAttachment.filename,
          original_name: backendAttachment.title || backendAttachment.filename,
          filesize: backendAttachment.filesize,
          filetype: this.getFileType(backendAttachment.filename),
          id: backendAttachment.id,
          url: backendAttachment.url,
          temp_path: backendAttachment.temp_path,
          temp_id: backendAttachment.temp_id || backendAttachment.filename,
        }

        return {
          success: true,
          attachment: attachment,
          message: result.message || result.data.message,
        }
      } else if (!result.success) {
        throw new Error(result.message || result.data?.message || 'Upload failed')
      } else {
        throw new Error('Invalid response structure from server')
      }
    }
    catch (error) {
      console.error('Error uploading attachment:', error)
      throw error
    }
  }

  /**
   * Delete attachment by ID
   */
  static async deleteAttachment (deleteUrl: string, id: number): Promise<{ success: boolean }> {
    try {
      const queryString = this.buildQueryString({ id })
      const url = `${deleteUrl}&${queryString}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': (window as any).Joomla?.getOptions?.('csrf.token') || '',
        },
      })

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`)
      }

      const result = await response.json()
      return { success: result.success }
    }
    catch (error) {
      console.error('Error deleting attachment:', error)
      throw error
    }
  }

  /**
   * Delete temporary attachment file
   */
  static async deleteTempAttachment (deleteUrl: string, tempId: string): Promise<{ success: boolean }> {
    try {
      const queryString = this.buildQueryString({ temp_id: tempId })
      const url = `${deleteUrl}&${queryString}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': (window as any).Joomla?.getOptions?.('csrf.token') || '',
        },
      })

      if (!response.ok) {
        throw new Error(`Delete temp file failed: ${response.statusText}`)
      }

      const result = await response.json()
      return { success: result.success || true }
    }
    catch (error) {
      console.error('Error deleting temp attachment:', error)
      return { success: true }
    }
  }

  /**
   * Get file icon based on file extension
   */
  static getFileType (filename: string): 'image' | 'document' | 'file' {
    const extension = filename.split('.').pop()?.toLowerCase() || ''

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']

    if (imageExtensions.includes(extension)) {
      return 'image'
    } else if (documentExtensions.includes(extension)) {
      return 'document'
    }

    return 'file'
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize (bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes'
    }

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Validate file before upload
   */
  static validateFile (
    file: File,
    options: {
      maxSize?: number
      allowedTypes?: string[]
      maxFiles?: number
      currentFiles?: number
    } = {},
  ): { valid: boolean; error?: string } {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
      maxFiles = 5,
      currentFiles = 0,
    } = options

    // Check file count
    if (currentFiles >= maxFiles) {
      return { valid: false, error: `Maximum ${maxFiles} files allowed` }
    }

    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `File size must be less than ${this.formatFileSize(maxSize)}` }
    }

    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    if (!allowedTypes.includes(extension)) {
      return { valid: false, error: `File type .${extension} is not allowed` }
    }

    return { valid: true }
  }

  /**
   * Process attachments for form submission
   * Handles both new uploads and existing attachments
   */
  static async processAttachmentsForSubmission (attachments: Attachment[]): Promise<number[]> {
    const attachmentIds: number[] = []

    // Add existing attachment IDs (those that have an ID)
    for (const attachment of attachments) {
      if (attachment.id) {
        attachmentIds.push(attachment.id)
      }
    }

    return attachmentIds
  }

  /**
   * Build query string helper method
   */
  private static buildQueryString (params: Record<string, any>): string {
    const token = (window as any).Joomla?.getOptions?.('csrf.token') || ''
    const allParams = { ...params }

    if (token) {
      allParams[token] = '1'
    }

    return Object.entries(allParams).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')
  }
}