import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AttachmentService } from '../../services/attachment.service'

describe('AttachmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('uploadTemporary', () => {
    it('should upload file successfully', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const mockResponse = {
          success: true,
          data: {
            attachment: {
              id: 1,
              filename: 'test.pdf',
              title: 'test.pdf',
              filesize: 1024,
              url: '/uploads/test.pdf',
              temp_path: '/tmp/test.pdf',
              temp_id: 'temp123',
            },
          },
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await AttachmentService.uploadTemporary(
        mockFile,
        '/index.php?option=com_test&task=upload',
      )

      expect(result.success).toBe(true)
      expect(result.attachment).toBeDefined()
      expect(result.attachment?.filename).toBe('test.pdf')
    })

    it('should include file in FormData', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const mockResponse = {
          success: true,
          data: {
            attachment: {
              filename: 'test.pdf',
              filesize: 1024,
            },
          },
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await AttachmentService.uploadTemporary(mockFile, '/upload')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      )
    })

    it('should include CSRF token in headers', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const mockResponse = {
          success: true,
          data: {
            attachment: {
              filename: 'test.pdf',
              filesize: 1024,
            },
          },
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await AttachmentService.uploadTemporary(mockFile, '/upload')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'test-token-123',
          }),
        }),
      )
    })

    it('should handle upload error', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      })

      await expect(
        AttachmentService.uploadTemporary(mockFile, '/upload'),
      ).rejects.toThrow('Upload failed: Bad Request')
    })

    it('should handle unsuccessful response', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const mockResponse = {
          success: false,
          message: 'File too large',
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await expect(
        AttachmentService.uploadTemporary(mockFile, '/upload'),
      ).rejects.toThrow('File too large')
    })

    it('should support custom type parameter', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const mockResponse = {
          success: true,
          data: {
            attachment: {
              filename: 'test.pdf',
              filesize: 1024,
            },
          },
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await AttachmentService.uploadTemporary(mockFile, '/upload', 'image')

      const formData = (global.fetch as any).mock.calls[0][1].body
      expect(formData).toBeInstanceOf(FormData)
    })
  })

  describe('deleteAttachment', () => {
    it('should delete attachment successfully', async () => {
      const mockResponse = {
          success: true,
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await AttachmentService.deleteAttachment('/delete', 1)

      expect(result.success).toBe(true)
    })

    it('should send POST request with attachment ID', async () => {
      const mockResponse = {
          success: true,
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await AttachmentService.deleteAttachment('/delete', 123)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('id=123'),
        expect.any(Object),
      )
    })
  })
})
