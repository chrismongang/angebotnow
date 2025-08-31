'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Zap, Edit, Shield, FileText } from 'lucide-react';

interface UpgradeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeSuccessModal({ isOpen, onClose }: UpgradeSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Add delay for smooth exit animation
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const features = [
    {
      icon: Zap,
      title: 'Unbegrenzte Angebote',
      description: 'Erstelle so viele Angebote wie du möchtest'
    },
    {
      icon: Edit,
      title: 'Positionen bearbeiten',
      description: 'Bearbeite alle Positionen in deinen Angeboten'
    },
    {
      icon: Shield,
      title: 'Prioritäts-Support',
      description: 'Erhalte Support innerhalb von 4 Stunden'
    },
    {
      icon: FileText,
      title: 'Kein AngebotNow Branding',
      description: 'Professionelle PDFs ohne fremde Logos'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl p-8 max-w-2xl w-full transform transition-all duration-200 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Herzlichen Glückwunsch!</h2>
              <p className="text-gray-600">Du bist jetzt offiziell Pro User</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Features List */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Alle Pro-Features sind jetzt freigeschaltet:
          </h3>
          
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <div className="ml-auto">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white h-12 rounded-xl font-semibold"
          >
            Verstanden
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Du kannst dein Abo jederzeit in den Einstellungen verwalten
        </p>
      </div>
    </div>
  );
}
