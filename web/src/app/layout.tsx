'use client'

import React from 'react'

import './globals.css'
import { useState } from 'react'
import TopBar from '@/components/TopBar'
import QueryPanel from '@/components/QueryPanel'
import { PrivateModeProvider } from '@/lib/private-mode-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [queryPanelOpen, setQueryPanelOpen] = useState(false)

  return (
    <html lang="en">
      <head>
        <title>Agentic Engineering KB</title>
        <meta name="description" content="Agentic Engineering Knowledge Base — Wikipedia-style wiki for agentic AI engineering" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <PrivateModeProvider>
          <TopBar onOpenQuery={() => setQueryPanelOpen(true)} />
          <QueryPanel isOpen={queryPanelOpen} onClose={() => setQueryPanelOpen(false)} />
          {children}
        </PrivateModeProvider>
      </body>
    </html>
  )
}
