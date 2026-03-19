import { createContext, useContext } from 'react'
import { Button } from '@heroui/react'

const ArtifactRevisionContext = createContext(null)

export function ArtifactRevisionProvider({ artifactPath, revisionCount, canLogToday, onLog, children }) {
  const value = { artifactPath, revisionCount, canLogToday, onLog }
  return (
    <ArtifactRevisionContext.Provider value={value}>
      {children}
    </ArtifactRevisionContext.Provider>
  )
}

/** Small “Revised!” control for the Code tab only — must be under ArtifactRevisionProvider. */
export function ArtifactRevisedButton() {
  const ctx = useContext(ArtifactRevisionContext)
  if (!ctx?.artifactPath) return null
  const { revisionCount, canLogToday, onLog } = ctx
  return (
    <div className="flex items-center justify-end gap-2 w-full flex-wrap shrink-0">
      <Button
        type="button"
        size="sm"
        variant="flat"
        color="primary"
        isDisabled={!canLogToday}
        onPress={onLog}
        className="h-7 min-h-7 min-w-0 px-2.5 text-[11px] font-medium"
      >
        <span className="mr-0.5" aria-hidden>{canLogToday ? '📖' : '✅'}</span>
        Revised!
        {revisionCount > 0 ? (
          <span className="ml-1 rounded-full bg-primary/25 px-1.5 py-px text-[10px] font-bold tabular-nums leading-tight">
            {revisionCount}
          </span>
        ) : null}
      </Button>
      {!canLogToday ? (
        <span className="text-[10px] text-default-400 whitespace-nowrap">Already today</span>
      ) : null}
    </div>
  )
}
