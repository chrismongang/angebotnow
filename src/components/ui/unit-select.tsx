'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const COMMON_UNITS = [
  'm²', 'Stück', 'Psch', 'lfm', 'Std', 'm', 'm³', 
  'kg', 'l', 'Tag', 'Stk.', 'Paar', 'Satz', 'Packung', 'Container'
]

interface UnitSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function UnitSelect({ value, onChange, placeholder = "Einheit", className }: UnitSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredUnits, setFilteredUnits] = useState(COMMON_UNITS)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value) {
      const filtered = COMMON_UNITS.filter(unit => 
        unit.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredUnits(filtered.length > 0 ? filtered : COMMON_UNITS)
    } else {
      setFilteredUnits(COMMON_UNITS)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelect = (unit: string) => {
    onChange(unit)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setIsOpen(true)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && filteredUnits.length > 0 && isOpen) {
      e.preventDefault()
      handleSelect(filteredUnits[0])
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("bg-white pr-8", className)}
        />
        <ChevronDown 
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-input rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredUnits.length > 0 ? (
            filteredUnits.map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => handleSelect(unit)}
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none text-sm transition-colors"
              >
                {unit}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Keine Vorschläge
            </div>
          )}
        </div>
      )}
    </div>
  )
}

