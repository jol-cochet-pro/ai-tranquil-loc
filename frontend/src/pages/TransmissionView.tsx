import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { transmissionsApi, type TransmissionPublic } from '../api/transmissions';
import { formatTaille, downloadBlob } from './utils';

export function TransmissionView() {
  const { token } = useParams<{ token: string }>();
  const [transmission, setTransmission] = useState<TransmissionPublic | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    transmissionsApi
      .getByToken(token)
      .then(setTransmission)
      .catch((err) => {
        if (err?.response?.status === 410) {
          setError('Ce lien a expiré');
          setErrorCode(410);
        } else if (err?.response?.status === 403) {
          setError('Ce lien a été révoqué');
          setErrorCode(403);
        } else {
          setError('Lien de transmission invalide');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const url = transmissionsApi.getDocumentDownloadUrl(token!, docId);
      const response = await fetch(url);
      const blob = await response.blob();
      downloadBlob(blob, filename);
    } catch {
      setError('Erreur lors du téléchargement');
    }
  };

  if (loading) {
    return (
      <div className="public-page">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    let icon = '🔗';
    let title = 'Lien invalide';
    if (errorCode === 410) {
      icon = '⏰';
      title = 'Lien expiré';
    } else if (errorCode === 403) {
      icon = '🚫';
      title = 'Lien révoqué';
    }

    return (
      <div className="public-page">
        <div className="error-card">
          <div className="error-icon">{icon}</div>
          <h2>{title}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!transmission) return null;

  const documentsByPersonne: Record<
    string,
    {
      personne: { id: string; prenom: string; nom: string; statut: { nom: string } };
      documents: TransmissionPublic['documents'];
    }
  > = {};

  for (const personne of transmission.personnes) {
    const docs = transmission.documents.filter(
      (d) => d.personneId === personne.id,
    );
    if (docs.length > 0) {
      documentsByPersonne[personne.id] = { personne, documents: docs };
    }
  }

  return (
    <div className="public-page">
      <header>
        <h1>Dossier Locatif</h1>
        <p className="hint">
          Documents partagés via un lien sécurisé
        </p>
      </header>

      <main>
        <section className="section">
          <h2>Documents inclus</h2>
          <p className="hint">
            Types de documents :{' '}
            {transmission.transmissionDocumentTypes
              .map((tdt) => tdt.documentType.nom)
              .join(', ')}
          </p>
        </section>

        {Object.keys(documentsByPersonne).length === 0 ? (
          <p className="empty-state">
            Aucun document disponible pour cette transmission.
          </p>
        ) : (
          Object.values(documentsByPersonne).map(({ personne, documents }) => (
            <section key={personne.id} className="section">
              <h3>
                {personne.prenom} {personne.nom}
                <span className="statut-badge">{personne.statut.nom}</span>
              </h3>
              <div className="documents-list">
                {documents.map((doc) => (
                  <div key={doc.id} className="document-card">
                    <div className="document-info">
                      <strong>{doc.nomFichier}</strong>
                      <span className="document-meta">
                        {doc.typeDocument.nom} — {formatTaille(doc.taille)}
                      </span>
                    </div>
                    <button
                      className="btn-small"
                      onClick={() => handleDownload(doc.id, doc.nomFichier)}
                    >
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
