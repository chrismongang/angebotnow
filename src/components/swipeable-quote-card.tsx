'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeableQuoteCardProps {
  children: React.ReactNode
  onDelete: () => void
  className?: string
}

export function SwipeableQuoteCard({
  children,
  onDelete,
  className
}: SwipeableQuoteCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const currentXRef = useRef<number>(0)
  const hasSwipedRef = useRef<boolean>(false)

  const DELETE_THRESHOLD = 80 // px to trigger delete action
  const SWIPE_THRESHOLD = 60 // px to show delete button

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleTouchStart = (e: TouchEvent) => {
      startXRef.current = e.touches[0].clientX
      currentXRef.current = startXRef.current
      hasSwipedRef.current = false
      setIsDragging(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      
      currentXRef.current = e.touches[0].clientX
      const diff = startXRef.current - currentXRef.current
      
      // Only allow swiping left (negative diff)
      if (diff > 10) {
        hasSwipedRef.current = true
        setDragOffset(Math.min(diff, 100))
        setIsOpen(diff > SWIPE_THRESHOLD)
      }
    }

    const handleTouchEnd = () => {
      if (dragOffset > DELETE_THRESHOLD) {
        onDelete()
      } else if (dragOffset > SWIPE_THRESHOLD) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
      
      // Reset after a short delay to allow click prevention
      setTimeout(() => {
        hasSwipedRef.current = false
      }, 100)
      
      setDragOffset(0)
      setIsDragging(false)
    }

    // Mouse events for desktop
    const handleMouseDown = (e: MouseEvent) => {
      startXRef.current = e.clientX
      currentXRef.current = startXRef.current
      hasSwipedRef.current = false
      setIsDragging(true)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      currentXRef.current = e.clientX
      const diff = startXRef.current - currentXRef.current
      
      if (diff > 10) {
        hasSwipedRef.current = true
        setDragOffset(Math.min(diff, 100))
        setIsOpen(diff > SWIPE_THRESHOLD)
      }
    }

    const handleMouseUp = () => {
      if (dragOffset > DELETE_THRESHOLD) {
        onDelete()
      } else if (dragOffset > SWIPE_THRESHOLD) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
      
      // Reset after a short delay to allow click prevention
      setTimeout(() => {
        hasSwipedRef.current = false
      }, 100)
      
      setDragOffset(0)
      setIsDragging(false)
    }

    card.addEventListener('touchstart', handleTouchStart, { passive: true })
    card.addEventListener('touchmove', handleTouchMove, { passive: true })
    card.addEventListener('touchend', handleTouchEnd)
    
    card.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      card.removeEventListener('touchstart', handleTouchStart)
      card.removeEventListener('touchmove', handleTouchMove)
      card.removeEventListener('touchend', handleTouchEnd)
      card.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, onDelete])

  // Reset on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setDragOffset(0)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative mb-3" ref={cardRef}>
      {/* Delete Action Background */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 bg-red-600 flex items-center justify-end pr-4 transition-opacity duration-200 z-10 rounded-r-lg",
          isOpen || dragOffset > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ width: '100px' }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-white hover:bg-red-700 rounded-full p-2"
        >
          <Trash2 size={20} />
        </Button>
      </div>

      {/* Card Content */}
      <div
        className={cn(
          "relative transition-transform duration-200 ease-out z-20",
          className
        )}
        style={{
          transform: `translateX(-${dragOffset}px)`,
          touchAction: 'pan-y'
        }}
        onClick={(e) => {
          // Prevent link navigation if user has swiped
          if (hasSwipedRef.current || dragOffset > 10) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}

