import React, { createContext, useContext, useLayoutEffect, useState } from 'react'

const OverlayContainerContext = createContext<HTMLElement | undefined>(undefined)

export function OverlayProvider ({
  children,
  containerId,
}: {
  children: React.ReactNode
  containerId: string
}) {
  const [container, setContainer] = useState<HTMLElement | undefined>(undefined)

  useLayoutEffect(() => {
    setContainer(document.getElementById(containerId) || undefined)
  }, [containerId])

  return (
    <OverlayContainerContext.Provider value={container}>
      {children}
    </OverlayContainerContext.Provider>
  )
}

export function useOverlayContainer (): HTMLElement | undefined {
  return useContext(OverlayContainerContext)
}
