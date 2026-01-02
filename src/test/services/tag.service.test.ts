import {beforeEach, describe, expect, it, vi} from 'vitest'
import {TagService} from '../../services/tag.service'

describe('TagService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('getTags', () => {
    it('should fetch tags successfully', async () => {
      const mockResponse = {
          success: true,
          data: [
            { id: 1, title: 'Tag 1', alias: 'tag-1' },
            { id: 2, title: 'Tag 2', alias: 'tag-2' },
          ],
          total: 2,
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await TagService.getTags('/index.php?option=com_test')

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should include query parameters in request', async () => {
      const mockResponse = {
          success: true,
          data: [],
          total: 0,
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await TagService.getTags('/index.php?option=com_test', {
        published: 1,
        search: 'test',
        limit: 10,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('published=1'),
        expect.any(Object),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=test'),
        expect.any(Object),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object),
      )
    })

    it('should include CSRF token in request', async () => {
      const mockResponse = {
          success: true,
          data: [],
          total: 0,
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await TagService.getTags('/index.php?option=com_test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'test-token-123',
          }),
        }),
      )
    })

    it('should handle fetch error', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await expect(
        TagService.getTags('/index.php?option=com_test'),
      ).rejects.toThrow('Failed to fetch tags: Not Found')
    })

    it('should return empty array when response is not successful', async () => {
      const mockResponse = {
          success: false,
          data: null,
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await TagService.getTags('/index.php?option=com_test')

      expect(result.success).toBe(false)
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should set proper request headers', async () => {
      const mockResponse = {
          success: true,
          data: [],
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await TagService.getTags('/index.php?option=com_test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': 'test-token-123',
          }),
        }),
      )
    })
  })

  describe('createTag', () => {
    it('should create tag successfully', async () => {
      const mockResponse = {
          success: true,
          data: { id: 1, title: 'New Tag', alias: 'new-tag' },
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await TagService.createTag('/index.php?option=com_test', {
        title: 'New Tag',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.title).toBe('New Tag')
    })

    it('should include CSRF token in create request', async () => {
      const mockResponse = {
          success: true,
          data: { id: 1, title: 'New Tag' },
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await TagService.createTag('/index.php?option=com_test', {
        title: 'New Tag',
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'test-token-123',
          }),
        }),
      )
    })

    it('should send POST request with correct headers', async () => {
      const mockResponse = {
          success: true,
          data: { id: 1, title: 'New Tag' },
        }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await TagService.createTag('/index.php?option=com_test', {
        title: 'New Tag',
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': 'test-token-123',
          }),
        }),
      )
    })
  })
})
