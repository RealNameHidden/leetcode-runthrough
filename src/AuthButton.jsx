import { Popover, PopoverTrigger, PopoverContent, Button, Switch } from '@heroui/react'
import { useAuth } from './AuthContext'

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  )
}

export function AuthButton({ isDark, onDarkChange, onRevStats }) {
  const { user, signIn, signOut } = useAuth()

  const trigger = user?.photoURL ? (
    <img
      src={user.photoURL}
      alt={user.displayName ?? 'Profile'}
      referrerPolicy="no-referrer"
      className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all flex-shrink-0"
    />
  ) : (
    <button
      type="button"
      className="w-8 h-8 rounded-full flex items-center justify-center bg-content2 hover:bg-content3 text-default-500 transition-colors flex-shrink-0 border border-divider"
      aria-label="Profile"
    >
      <UserIcon />
    </button>
  )

  return (
    <Popover placement="bottom-end" offset={8}>
      <PopoverTrigger>
        <span className="flex-shrink-0">{trigger}</span>
      </PopoverTrigger>
      <PopoverContent className="p-0 min-w-[200px]">
        <div className="flex flex-col py-1">
          {/* Auth section */}
          {user === undefined ? null : user ? (
            <div className="px-3 py-2.5 border-b border-divider">
              <p className="text-xs font-medium text-foreground truncate">{user.displayName}</p>
              <p className="text-[11px] text-default-400 truncate">{user.email}</p>
              <Button
                size="sm"
                variant="light"
                onPress={signOut}
                className="mt-2 h-7 px-0 text-[11px] text-default-500 min-w-0"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="px-3 py-2.5 border-b border-divider">
              <p className="text-xs text-default-500 mb-2">Not signed in</p>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={signIn}
                className="w-full h-7 text-[11px]"
              >
                Sign in with Google
              </Button>
            </div>
          )}

          {/* Revision Stats menu item */}
          <button
            type="button"
            onClick={() => onRevStats?.()}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-default-600 hover:bg-content2 hover:text-foreground transition-colors text-left border-b border-divider"
          >
            <ChartIcon />
            Revision Stats
          </button>

          {/* Dark mode toggle */}
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-default-500">
              <SunIcon />
              <span className="text-xs">Dark mode</span>
              <MoonIcon />
            </div>
            <Switch
              size="sm"
              isSelected={isDark}
              onValueChange={onDarkChange}
              aria-label="Toggle dark mode"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
