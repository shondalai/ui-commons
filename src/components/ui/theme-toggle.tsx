import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/theme-context'

interface ThemeToggleProps {
  className?: string
  showLabels?: boolean
  variant?: 'icon' | 'dropdown'
  labels?: {
    light?: string
    dark?: string
    system?: string
    selector?: string
    tooltip?: string
  }
}

export function ThemeToggle ({
  className = '',
  showLabels = false,
  variant = 'icon',
  labels = {},
}: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme()

  const defaultLabels = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    selector: 'Theme selector',
    tooltip: `Current: ${theme}. Click to switch.`,
  }

  const finalLabels = { ...defaultLabels, ...labels }

  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className="theme-toggle pr-8 pl-3 py-2 text-sm font-medium appearance-none cursor-pointer"
          aria-label={finalLabels.selector}
        >
          <option value="light">{finalLabels.light}</option>
          <option value="dark">{finalLabels.dark}</option>
          <option value="system">{finalLabels.system}</option>
        </select>
      </div>
    )
  }

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4"/>
    }
    return actualTheme === 'dark' ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>
  }

  const getLabel = () => {
    if (theme === 'system') {
      return finalLabels.system
    }
    return actualTheme === 'dark' ? finalLabels.dark : finalLabels.light
  }

  return (
    <button
      onClick={handleToggle}
      className={`theme-toggle ${showLabels ? 'px-3 py-2' : ''} ${className}`}
      title={finalLabels.tooltip}
      aria-label={finalLabels.tooltip}
    >
      <div className="flex items-center gap-2">
        {getIcon()}
        {showLabels && (
          <span className="text-xs font-medium hidden sm:inline">
            {getLabel()}
          </span>
        )}
      </div>
    </button>
  )
}

export default ThemeToggle
