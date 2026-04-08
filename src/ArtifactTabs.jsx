import { useState } from 'react'
import { Tabs, Tab } from '@heroui/react'

export { Tab }

/**
 * Consistent tab wrapper for all artifacts.
 * - Uses HeroUI's default pill/cursor animation (no underline variant)
 * - Manages selected state internally — no need for useState in each artifact
 * - Accepts className to pass through to Tabs (default: "flex-1 px-6 py-4")
 */
export function ArtifactTabs({ children, className, defaultKey = 'Problem', ...props }) {
  const [selected, setSelected] = useState(defaultKey)
  return (
    <Tabs
      selectedKey={selected}
      onSelectionChange={key => setSelected(String(key))}
      className={className ?? 'flex-1 px-6 py-4'}
      {...props}
    >
      {children}
    </Tabs>
  )
}
