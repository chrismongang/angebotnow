'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface MicrosoftSignInButtonProps {
  className?: string
  children?: React.ReactNode
}

export function MicrosoftSignInButton({ className = '', children }: MicrosoftSignInButtonProps) {
  const handleMicrosoftSignIn = () => {
    signIn('azure-ad', { callbackUrl: '/dashboard' })
  }

  return (
    <Button
      onClick={handleMicrosoftSignIn}
      className={`w-full bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white border-0 shadow-sm rounded-[10px] h-12 text-base font-medium ${className}`}
      variant="outline"
    >
      <svg
        className="w-5 h-5 mr-3"
        viewBox="0 0 21 21"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" fillRule="evenodd">
          <path
            d="M0 0h10v10H0z"
            fill="#F25022"
          />
          <path
            d="M11 0h10v10H11z"
            fill="#7FBA00"
          />
          <path
            d="M0 11h10v10H0z"
            fill="#00A4EF"
          />
          <path
            d="M11 11h10v10H11z"
            fill="#FFB900"
          />
        </g>
      </svg>
      {children || 'Mit Microsoft anmelden'}
    </Button>
  )
}
