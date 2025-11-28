'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, X, AlertTriangle } from 'lucide-react'

interface DeleteQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  quoteNumber?: string
  clientName?: string
  isDeleting?: boolean
}

export function DeleteQuoteModal({
  isOpen,
  onClose,
  onConfirm,
  quoteNumber,
  clientName,
  isDeleting = false
}: DeleteQuoteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-[#404040]">
                Angebot löschen?
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isDeleting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#676767]">
            Möchten Sie dieses Angebot wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          
          {(quoteNumber || clientName) && (
            <div className="bg-[#EDEDED] rounded-lg p-3">
              <p className="text-sm text-[#404040] font-medium">
                {quoteNumber && `Angebot #${quoteNumber}`}
                {quoteNumber && clientName && ' • '}
                {clientName}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 rounded-[14px]"
            >
              Abbrechen
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-[14px] flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Löschen
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

