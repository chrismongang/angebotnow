// Cloudinary upload temporarily disabled

export default function TestCloudinaryPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Cloudinary Test</h1>
      <p className="mb-4">
        Cloudinary ist konfiguriert mit:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Cloud Name: {process.env.CLOUDINARY_CLOUD_NAME || 'Nicht gesetzt'}</li>
        <li>API Key: {process.env.CLOUDINARY_API_KEY ? 'Gesetzt' : 'Nicht gesetzt'}</li>
        <li>API Secret: {process.env.CLOUDINARY_API_SECRET ? 'Gesetzt' : 'Nicht gesetzt'}</li>
      </ul>
      
      {process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET ? (
        <div className="text-green-600">
          ✅ Cloudinary ist bereit für Uploads!
        </div>
      ) : (
        <div className="text-red-600">
          ❌ Cloudinary-Konfiguration unvollständig
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Aktueller Status:</h2>
        <p>Cloudinary-Upload ist temporär deaktiviert, um das Problem zu isolieren.</p>
        <p>Die App verwendet Placeholder-Bilder für den Test.</p>
      </div>
    </div>
  )
}
