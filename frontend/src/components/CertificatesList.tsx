import { useCertificates } from '../hooks/useQuiz';

export function CertificatesList() {
  const { data: certificates = [], isLoading } = useCertificates();

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Cargando certificados...</div>;
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          No tienes certificados aún
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Completa los cuestionarios con 70% o más para obtener certificados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {certificates.map((cert) => (
        <div
          key={cert.id}
          className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-800 rounded-lg p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-primary-900 dark:text-primary-100 mb-2">
                🎓 Certificado
              </h3>
              <p className="text-gray-800 dark:text-gray-200 font-semibold mb-1">
                {cert.courseName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Emitido: {new Date(cert.issuedAt).toLocaleDateString('es-CO')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                ID: {cert.id.slice(0, 8)}...
              </p>
            </div>
            <button
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
              onClick={() => {
                // Future: Download certificate PDF
                alert('Descarga de certificado disponible próximamente');
              }}
            >
              Descargar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
