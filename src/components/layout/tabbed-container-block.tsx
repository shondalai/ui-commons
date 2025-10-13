import React from 'react'
import { TabbedContainer } from '../ui/tabbed-container'
import { renderBlock } from './block-registry'
import {
  Activity,
  Award,
  BarChart,
  Bell,
  BellRing,
  Bookmark,
  Calendar,
  Clock,
  File,
  FileText,
  Grid,
  Heart,
  Home,
  Layout,
  List,
  Mail,
  MessageCircle,
  MessageSquare,
  Reply,
  Search,
  Settings,
  Shield,
  Star,
  Tag,
  Target,
  ThumbsUp,
  TrendingUp,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react'

interface BlockConfig {
  id: string
  config?: Record<string, any>
}

interface TabbedContainerBlockProps {
  config?: {
    tab_areas?: Array<{
      id: string
      label: string
      icon: string
      enabled: boolean
      slug?: string
      blocks: Array<string | BlockConfig>
    }>
    container_mode?: 'tabs' | 'accordion'
    container_variant?: 'default' | 'minimal' | 'pills'
    container_orientation?: 'horizontal' | 'vertical'
    default_tab?: string
    url_param?: string
  }
  contextData?: Record<string, any>
  className?: string
}

const getIconComponent = (iconName: string) => {
  const iconMap = {
    'User': User,
    'Users': Users,
    'MessageCircle': MessageCircle,
    'Reply': Reply,
    'Activity': Activity,
    'Trophy': Trophy,
    'Heart': Heart,
    'Settings': Settings,
    'Star': Star,
    'Bookmark': Bookmark,
    'Home': Home,
    'Search': Search,
    'Layout': Layout,
    'Grid': Grid,
    'List': List,
    'FileText': FileText,
    'BarChart': BarChart,
    'Bell': Bell,
    'BellRing': BellRing,
    'Mail': Mail,
    'MessageSquare': MessageSquare,
    'Shield': Shield,
    'Tag': Tag,
    'ThumbsUp': ThumbsUp,
    'TrendingUp': TrendingUp,
    'Award': Award,
    'Target': Target,
    'Zap': Zap,
    'Clock': Clock,
    'Calendar': Calendar,
    'File': File,
  }
  return iconMap[iconName as keyof typeof iconMap] || Layout
}

export const TabbedContainerBlock: React.FC<TabbedContainerBlockProps> = ({
  config = {},
  contextData = {},
  className = '',
  ...otherProps
}) => {
  const mergedContextData: Record<string, any> = {
    ...contextData,
    ...otherProps,
    ...config,
  }

  const blockConfig = { ...config, ...mergedContextData }

  const {
    tab_areas = [],
    container_mode = 'tabs',
    container_variant = 'default',
    container_orientation = 'horizontal',
    default_tab,
    url_param = 'tab',
  } = blockConfig

  if (!tab_areas || tab_areas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="space-y-2">
          <Layout className="w-8 h-8 mx-auto text-muted-foreground/50"/>
          <p className="text-sm">No tabs configured for this container</p>
          <p className="text-xs text-muted-foreground/70">Configure tabs in the layout customizer</p>
        </div>
      </div>
    )
  }

  const normalizeBlock = (block: string | BlockConfig): BlockConfig => {
    if (typeof block === 'string') {
      return { id: block }
    }
    return block
  }

  const renderTabBlocks = (blocks: Array<string | BlockConfig>) => {
    if (!blocks || blocks.length === 0) {
      return <div className="text-sm text-muted-foreground">No content</div>
    }

    return (
      <div className="space-y-4">
        {blocks.map((block, index) => {
          const normalizedBlock = normalizeBlock(block)
          return renderBlock(
            normalizedBlock.id,
            { ...mergedContextData, ...normalizedBlock.config },
            `tab-block-${index}`,
          )
        })}
      </div>
    )
  }

  const tabs = tab_areas.filter(tab => tab.enabled !== false).map(tab => ({
    id: tab.slug || tab.id,
    label: tab.label,
    icon: getIconComponent(tab.icon),
    component: () => renderTabBlocks(tab.blocks),
  }))

  return (
    <TabbedContainer
      tabs={tabs}
      defaultTab={default_tab}
      urlParam={url_param}
      mode={container_mode}
      orientation={container_orientation}
      variant={container_variant}
      className={className}
    />
  )
}

export default TabbedContainerBlock
