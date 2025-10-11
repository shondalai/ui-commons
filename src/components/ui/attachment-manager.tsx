import React, { useCallback, useState } from 'react'
import { Alert, AlertDescription } from './alert'
import { Button } from './button'
import { cn } from '../../lib/utils'
import { type Attachment, AttachmentService } from '../../services/attachment.service'
import { AlertCircle, File, FileText, Image, Loader2, Paperclip, Upload, X } from 'lucide-react'

interface AttachmentManagerProps {
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
  config?: {
    maxFiles?: number
    maxFileSize?: number
    allowedTypes?: string[]
    acceptedFileTypes?: string
  }
  uploadUrl: string
  deleteUrl: string
  deleteTempUrl: string
  type?: string
  variant?: 'standard' | 'compact'
  disabled?: boolean
  className?: string
  labels?: {
    uploading?: string
    attachFiles?: string
    dropFilesHere?: string
    attachedFiles?: string
    uploaded?: string
    pending?: string
    deleteAttachment?: string
  }
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments = [],
  onAttachmentsChange,
  config = {},
  uploadUrl,
  deleteUrl,
  deleteTempUrl,
  type = 'default',
  variant = 'standard',
  disabled = false,
  className = '',
  labels = {},
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const {
    maxFiles = 5,
    maxFileSize = 5 * 1024 * 1024,
    allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
    acceptedFileTypes = allowedTypes.map(ext => `.${ext}`).join(','),
  } = config

  const defaultLabels = {
    uploading: 'Uploading...',
    attachFiles: 'Attach files',
    dropFilesHere: 'Drop files here or click to browse',
    attachedFiles: 'Attached Files',
    uploaded: 'Uploaded',
    pending: 'Pending',
    deleteAttachment: 'Delete attachment',
  }

  const finalLabels = { ...defaultLabels, ...labels }
  const isCompact = variant === 'compact'

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    if (disabled) {
      return
    }

    const fileArray = Array.from(files)
    setErrors([])
    setIsUploading(true)

    try {
      const newAttachments: Attachment[] = []
      const newErrors: string[] = []

      for (const file of fileArray) {
        if (attachments.length + newAttachments.length >= maxFiles) {
          newErrors.push(`Maximum ${maxFiles} files allowed`)
          break
        }

        const validation = AttachmentService.validateFile(file, {
          maxSize: maxFileSize,
          allowedTypes,
          maxFiles,
          currentFiles: attachments.length + newAttachments.length,
        })

        if (!validation.valid) {
          newErrors.push(`${file.name}: ${validation.error}`)
          continue
        }

        try {
          const uploadResponse = await AttachmentService.uploadTemporary(file, uploadUrl, type)

          if (uploadResponse.success && uploadResponse.attachment) {
            const attachment: Attachment = {
              ...uploadResponse.attachment,
              filetype: AttachmentService.getFileType(file.name),
            }
            newAttachments.push(attachment)
          } else {
            newErrors.push(`${file.name}: ${uploadResponse.message || 'Upload failed'}`)
          }
        }
        catch (error: any) {
          newErrors.push(`${file.name}: ${error.message || 'Upload failed'}`)
        }
      }

      if (newErrors.length > 0) {
        setErrors(newErrors)
      }

      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments])
      }
    }
    catch (error: any) {
      console.error('Error processing files:', error)
      setErrors([error.message || 'Failed to process files'])
    }
    finally {
      setIsUploading(false)
    }
  }, [attachments, onAttachmentsChange, disabled, maxFiles, maxFileSize, allowedTypes, type, uploadUrl])

  const handleRemoveAttachment = useCallback(async (index: number) => {
    if (disabled) {
      return
    }

    const attachment = attachments[index]
    const updatedAttachments = attachments.filter((_, i) => i !== index)

    try {
      if (attachment.id) {
        await AttachmentService.deleteAttachment(deleteUrl, attachment.id)
      } else if (attachment.temp_id || attachment.temp_path || attachment.filename) {
        await AttachmentService.deleteTempAttachment(deleteTempUrl, attachment.temp_id || attachment.filename)
      }

      onAttachmentsChange(updatedAttachments)
      setErrors([])
    }
    catch (error: any) {
      console.error('Error removing attachment:', error)
      setErrors([error.message || 'Failed to remove attachment'])
    }
  }, [attachments, onAttachmentsChange, disabled, deleteUrl, deleteTempUrl])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (!disabled && e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [disabled, handleFileSelect])

  const getFileIcon = (filetype: string) => {
    switch (filetype) {
      case 'image':
        return <Image className="h-4 w-4"/>
      case 'document':
        return <FileText className="h-4 w-4"/>
      default:
        return <File className="h-4 w-4"/>
    }
  }

  return (
    <div className={cn('space-y-3', isCompact && 'space-y-2', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative border border-dashed rounded-lg text-center transition-all duration-200 group cursor-pointer',
          !isCompact && 'p-4',
          isCompact && 'p-3',
          isDragging
            ? 'border-neutral-400 dark:border-neutral-500 bg-neutral-50 dark:bg-neutral-800/50'
            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30',
          isUploading && 'opacity-60 pointer-events-none',
          disabled && 'opacity-50 pointer-events-none',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isCompact ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
              {isUploading ? (
                <Loader2 className="h-4 w-4 text-neutral-500 dark:text-neutral-400 animate-spin"/>
              ) : (
                <Paperclip className="h-4 w-4 text-neutral-500 dark:text-neutral-400"/>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {isUploading ? finalLabels.uploading : finalLabels.attachFiles}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0">
                {maxFiles} files • {AttachmentService.formatFileSize(maxFileSize)} max
              </div>
            </div>
            {attachments.length > 0 && (
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                {attachments.length}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-10 h-10 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-neutral-500 dark:text-neutral-400 animate-spin"/>
              ) : (
                <Upload className="h-5 w-5 text-neutral-500 dark:text-neutral-400"/>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {isUploading ? finalLabels.uploading : finalLabels.dropFilesHere}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {allowedTypes.slice(0, 3).join(', ')}{allowedTypes.length > 3 && '...'} • Max {AttachmentService.formatFileSize(maxFileSize)} • {maxFiles} files max
              </p>
            </div>
          </div>
        )}
        <input
          type="file"
          multiple
          accept={acceptedFileTypes}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled || isUploading}
        />
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert className={cn(
          'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
          isCompact && 'py-2',
        )}>
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400"/>
          <AlertDescription>
            <div className={cn('space-y-1', isCompact && 'space-y-0.5')}>
              {errors.map((error, index) => (
                <div key={index} className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Attachment List */}
      {attachments.length > 0 && !isCompact && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-neutral-500 dark:text-neutral-400"/>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {finalLabels.attachedFiles}
              </h4>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
              {attachments.length}/{maxFiles}
            </span>
          </div>

          <div className="space-y-1">
            {attachments.map((attachment, index) => (
              <div key={`${attachment.filename}-${index}`}
                   className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 group hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-6 h-6 bg-white dark:bg-neutral-700 rounded-md flex items-center justify-center border border-neutral-200 dark:border-neutral-600">
                    {getFileIcon(attachment.filetype)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {attachment.original_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{AttachmentService.formatFileSize(attachment.filesize)}</span>
                      {attachment.id ? (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {finalLabels.uploaded}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400">
                            {finalLabels.pending}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttachment(index)}
                  disabled={disabled}
                  className="h-6 w-6 p-0 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title={finalLabels.deleteAttachment}
                >
                  <X className="h-3 w-3"/>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Attachment List */}
      {attachments.length > 0 && isCompact && (
        <div className="flex flex-wrap gap-1">
          {attachments.map((attachment, index) => (
            <div key={`${attachment.filename}-${index}`}
                 className="flex items-center gap-2 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700 group hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200">
              <div className="w-4 h-4 flex items-center justify-center">
                {getFileIcon(attachment.filetype)}
              </div>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-20">
                {attachment.original_name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAttachment(index)}
                disabled={disabled}
                className="h-4 w-4 p-0 text-neutral-400 hover:text-red-500 rounded-sm transition-all duration-200"
                title={finalLabels.deleteAttachment}
              >
                <X className="h-3 w-3"/>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

