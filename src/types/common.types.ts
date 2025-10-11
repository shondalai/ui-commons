// Common types for UI components
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  limitStart: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface Attachment {
  id?: number
  filename: string
  original_name: string
  filesize: number
  filetype: 'image' | 'document' | 'file'
  url?: string
  temp_path?: string
  temp_id?: string
}

export interface AttachmentUploadResponse {
  success: boolean
  attachment: Attachment
  message?: string
}

export interface Tag {
  id: number
  title: string
  alias: string
  description?: string
  published: number
  level: number
  path: string
  parent_id: number
  language: string
}

export interface TagsResponse {
  data: Tag[]
  total: number
  success: boolean
}
