"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface DolarHeaderContextType {
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
}

const DolarHeaderContext = createContext<DolarHeaderContextType | undefined>(undefined)

export function DolarHeaderProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true)

  return <DolarHeaderContext.Provider value={{ isVisible, setIsVisible }}>{children}</DolarHeaderContext.Provider>
}

export function useDolarHeader() {
  const context = useContext(DolarHeaderContext)
  if (context === undefined) {
    throw new Error("useDolarHeader must be used within a DolarHeaderProvider")
  }
  return context
}
