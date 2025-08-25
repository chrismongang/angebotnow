'use client'

import { useState } from 'react'

interface ImageProps {
  src: string
  alt: string
  className?: string
}

export function Image({ src, alt, className }: ImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return null
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}
