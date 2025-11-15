"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { ProcessingEvent } from '@/lib/refiner-client'

interface ProcessingContextType {
  processingEvents: ProcessingEvent[]
  addProcessingEvent: (event: ProcessingEvent) => void
  clearProcessingEvents: () => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
  currentJobId: string | null
  setCurrentJobId: (jobId: string | null) => void
}

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined)

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const [processingEvents, setProcessingEvents] = useState<ProcessingEvent[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  // Load processing state from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('refiner-processing-events')
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents)
        setProcessingEvents(parsedEvents)
      } catch (error) {
        
      }
    }
    try {
      const savedState = localStorage.getItem('refiner-processing-state')
      if (savedState) {
        const st = JSON.parse(savedState)
        if (typeof st.isProcessing === 'boolean') setIsProcessing(st.isProcessing)
        if (st.currentJobId) setCurrentJobId(st.currentJobId)
      }
    } catch {}
  }, [])

  // Save processing events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('refiner-processing-events', JSON.stringify(processingEvents))
  }, [processingEvents])

  // Persist processing state
  useEffect(() => {
    localStorage.setItem('refiner-processing-state', JSON.stringify({ isProcessing, currentJobId }))
  }, [isProcessing, currentJobId])

  const addProcessingEvent = (event: ProcessingEvent) => {
    setProcessingEvents(prev => [...prev, event])
  }

  const clearProcessingEvents = () => {
    setProcessingEvents([])
    localStorage.removeItem('refiner-processing-events')
  }

  const setIsProcessingWithLog = (processing: boolean) => {
    setIsProcessing(processing)
  }

  return (
    <ProcessingContext.Provider value={{
      processingEvents,
      addProcessingEvent,
      clearProcessingEvents,
      isProcessing,
      setIsProcessing: setIsProcessingWithLog,
      currentJobId,
      setCurrentJobId
    }}>
      {children}
    </ProcessingContext.Provider>
  )
}

export function useProcessing() {
  const context = useContext(ProcessingContext)
  if (context === undefined) {
    throw new Error('useProcessing must be used within a ProcessingProvider')
  }
  return context
}
