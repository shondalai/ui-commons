export interface LayoutBlock {
  id: number
  area_id: number
  block_type: string
  block_name: string
  grid_column_start: number
  grid_column_span: number
  ordering: number
  enabled: boolean
  block_config: Record<string, any>
  responsive_config: Record<string, any>
}

export interface LayoutArea {
  id: number
  template_id: number
  area_name: string
  grid_columns: number
  grid_row: number
  grid_order: number
  enabled: boolean
  responsive_config: Record<string, any>
  blocks: LayoutBlock[]
}

export interface LayoutTemplate {
  id: number
  name: string
  description: string
  page_type: string
  is_default: boolean
  created_by: number
  created_date: string
  modified_by: number
  modified_date: string
  published: boolean
  ordering: number
  areas: LayoutArea[]
}
