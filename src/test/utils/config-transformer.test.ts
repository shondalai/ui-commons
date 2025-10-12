import { describe, it, expect } from 'vitest'
import {
  transformBlockConfig,
  toCamelCase,
  transformKeysToCamelCase,
  transformCompleteConfig,
} from '../../utils/config-transformer'

describe('config-transformer', () => {
  describe('transformBlockConfig', () => {
    it('should convert string booleans to actual booleans', () => {
      const config = {
        is_active: 'true',
        is_disabled: 'false',
      }
      const result = transformBlockConfig(config)
      // Note: 'enabled' key is specifically skipped in transformBlockConfig
      expect(result.is_active).toBe(true)
      expect(result.is_disabled).toBe(false)
    })

    it('should convert numeric strings to numbers', () => {
      const config = {
        count: '42',
        limit: '100',
      }
      const result = transformBlockConfig(config)
      expect(result.count).toBe(42)
      expect(result.limit).toBe(100)
    })

    it('should handle null and undefined values', () => {
      const config = {
        nullValue: 'null',
        undefinedValue: 'undefined',
        actualNull: null,
      }
      const result = transformBlockConfig(config)
      expect(result.nullValue).toBe(null)
      expect(result.undefinedValue).toBe(undefined)
      expect(result.actualNull).toBe(null)
    })

    it('should skip grid-related properties', () => {
      const config = {
        grid_span: '6',
        grid_offset: '2',
        enabled: 'true',
        title: 'Test',
      }
      const result = transformBlockConfig(config)
      expect(result.grid_span).toBeUndefined()
      expect(result.grid_offset).toBeUndefined()
      expect(result.enabled).toBeUndefined()
      expect(result.title).toBe('Test')
    })

    it('should keep string values as strings', () => {
      const config = {
        title: 'Hello World',
        description: 'Test description',
      }
      const result = transformBlockConfig(config)
      expect(result.title).toBe('Hello World')
      expect(result.description).toBe('Test description')
    })

    it('should handle empty object', () => {
      const result = transformBlockConfig({})
      expect(result).toEqual({})
    })

    it('should handle invalid input gracefully', () => {
      expect(transformBlockConfig(null as any)).toEqual({})
      expect(transformBlockConfig(undefined as any)).toEqual({})
    })

    it('should not convert empty strings to numbers', () => {
      const config = {
        empty: '',
        whitespace: '   ',
      }
      const result = transformBlockConfig(config)
      expect(result.empty).toBe('')
      expect(result.whitespace).toBe('   ')
    })
  })

  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('hello_world')).toBe('helloWorld')
      expect(toCamelCase('user_name')).toBe('userName')
      expect(toCamelCase('first_last_name')).toBe('firstLastName')
    })

    it('should handle single word', () => {
      expect(toCamelCase('hello')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(toCamelCase('')).toBe('')
    })

    it('should preserve uppercase letters after conversion', () => {
      expect(toCamelCase('api_key')).toBe('apiKey')
    })
  })

  describe('transformKeysToCamelCase', () => {
    it('should transform all keys to camelCase', () => {
      const config = {
        user_name: 'John',
        first_name: 'John',
        last_name: 'Doe',
      }
      const result = transformKeysToCamelCase(config)
      expect(result.userName).toBe('John')
      expect(result.firstName).toBe('John')
      expect(result.lastName).toBe('Doe')
    })

    it('should keep original snake_case keys for backward compatibility', () => {
      const config = {
        user_name: 'John',
      }
      const result = transformKeysToCamelCase(config)
      expect(result.user_name).toBe('John')
      expect(result.userName).toBe('John')
    })

    it('should handle keys that are already camelCase', () => {
      const config = {
        userName: 'John',
        firstName: 'John',
      }
      const result = transformKeysToCamelCase(config)
      expect(result.userName).toBe('John')
      expect(result.firstName).toBe('John')
    })
  })

  describe('transformCompleteConfig', () => {
    it('should apply both boolean conversion and key transformation', () => {
      const config = {
        is_enabled: 'true',
        max_items: '10',
        user_name: 'John',
      }
      const result = transformCompleteConfig(config)
      expect(result.isEnabled).toBe(true)
      expect(result.maxItems).toBe(10)
      expect(result.userName).toBe('John')
    })

    it('should maintain backward compatibility with original keys', () => {
      const config = {
        is_enabled: 'true',
      }
      const result = transformCompleteConfig(config)
      expect(result.is_enabled).toBe(true)
      expect(result.isEnabled).toBe(true)
    })

    it('should handle complex nested configuration', () => {
      const config = {
        show_title: 'true',
        item_count: '25',
        css_class: 'custom-class',
      }
      const result = transformCompleteConfig(config)
      expect(result.showTitle).toBe(true)
      expect(result.itemCount).toBe(25)
      expect(result.cssClass).toBe('custom-class')
    })
  })
})
