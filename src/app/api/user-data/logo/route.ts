import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prüfe ob User PRO ist
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true }
    })

    if (user?.subscriptionTier !== 'PRO') {
      return NextResponse.json({ 
        error: 'Logo-Upload ist nur für PRO-User verfügbar' 
      }, { status: 403 })
    }

    const formData = await request.formData()
    const logoFile = formData.get('logo') as File

    if (!logoFile) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    // Validierung
    if (logoFile.size > 5 * 1024 * 1024) { // 5MB Limit
      return NextResponse.json({ 
        error: 'Datei ist zu groß. Maximum: 5MB' 
      }, { status: 400 })
    }

    if (!logoFile.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Bitte wählen Sie eine Bilddatei aus' 
      }, { status: 400 })
    }

    // Upload zu Cloudinary mit Logo-spezifischen Transformationen
    const arrayBuffer = await logoFile.arrayBuffer()
    const uploadResult = await uploadImage(arrayBuffer, 'angebotnow/logos')

    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json({ 
        error: 'Upload fehlgeschlagen' 
      }, { status: 500 })
    }

    // Logo-URL in Datenbank speichern
    await prisma.user.update({
      where: { id: session.user.id },
      data: { companyLogo: uploadResult.url }
    })

    return NextResponse.json({ 
      success: true, 
      logoUrl: uploadResult.url 
    })

  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json({ 
      error: 'Interner Serverfehler' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prüfe ob User PRO ist
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true }
    })

    if (user?.subscriptionTier !== 'PRO') {
      return NextResponse.json({ 
        error: 'Logo-Verwaltung ist nur für PRO-User verfügbar' 
      }, { status: 403 })
    }

    // Logo aus Datenbank entfernen
    await prisma.user.update({
      where: { id: session.user.id },
      data: { companyLogo: null }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Logo erfolgreich entfernt' 
    })

  } catch (error) {
    console.error('Logo delete error:', error)
    return NextResponse.json({ 
      error: 'Interner Serverfehler' 
    }, { status: 500 })
  }
}
