'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type SearchScope = 'public' | 'private' | 'all'

interface PrivateModeContextValue {
  isPrivate: boolean
  pin: string
  scope: SearchScope
  setScope: (s: SearchScope) => void
  unlock: (pin: string) => Promise<boolean>
  lock: () => void
}

const PrivateModeContext = createContext<PrivateModeContextValue | null>(null)

export function PrivateModeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [isPrivate, setIsPrivate] = useState(false)
  const [pin, setPin] = useState('')
  const [scope, setScope] = useState<SearchScope>('public')

  // Restore from sessionStorage on mount
  useEffect(() => {
    const savedPin = sessionStorage.getItem('private_pin')
    if (savedPin) {
      setIsPrivate(true)
      setPin(savedPin)
    }
  }, [])

  const unlock = useCallback(async (enteredPin: string): Promise<boolean> => {
    // Verify PIN against the server (scope=private search will return 401 if wrong)
    const res = await fetch(
      `/api/search?q=test&scope=private&pin=${encodeURIComponent(enteredPin)}&limit=1`
    )
    if (res.ok || res.status !== 401) {
      setIsPrivate(true)
      setPin(enteredPin)
      sessionStorage.setItem('private_pin', enteredPin)
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    setIsPrivate(false)
    setPin('')
    setScope('public')
    sessionStorage.removeItem('private_pin')
  }, [])

  return (
    <PrivateModeContext.Provider value={{ isPrivate, pin, scope, setScope, unlock, lock }}>
      {children}
    </PrivateModeContext.Provider>
  )
}

export function usePrivateMode(): PrivateModeContextValue {
  const ctx = useContext(PrivateModeContext)
  if (!ctx) throw new Error('usePrivateMode must be used within PrivateModeProvider')
  return ctx
}
