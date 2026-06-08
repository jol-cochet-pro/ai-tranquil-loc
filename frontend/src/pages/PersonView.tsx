import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import QRCode from "qrcode";
import { invitationsApi, type Invitation } from "../api/invitations";
import type { DocumentType } from "../api/configuration";
import type { Document } from "../api/documents";
import { formatTaille } from "./utils";

export function PersonView() {
  const { token } = useParams<{ token: string }>();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [uploadCustomName, setUploadCustomName] = useState("");

  useEffect(() => {
    if (!token) return;
    invitationsApi
      .getByToken(token)
      .then((inv) => {
        setInvitation(inv);
        setNom(inv.personne.nom);
        setPrenom(inv.personne.prenom);
        setEmail(inv.personne.email ?? "");
        setTelephone(inv.personne.telephone ?? "");
        setDocumentTypes(inv.documentTypes);
      })
      .catch(() => setError("Lien d'invitation invalide ou expiré"))
      .finally(() => setLoading(false));
  }, [token]);

  const loadDocuments = useCallback(() => {
    if (!token) return;
    invitationsApi
      .listDocumentsByToken(token)
      .then(setDocuments)
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (token) loadDocuments();
  }, [token, loadDocuments]);

  useEffect(() => {
    if (token && qrCanvasRef.current) {
      const invUrl = `${window.location.origin}/invitation/${token}`;
      QRCode.toCanvas(qrCanvasRef.current, invUrl, { width: 200 });
    }
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await invitationsApi.updateByToken(token, { nom, prenom, email, telephone });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !uploadType) return;
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await invitationsApi.uploadDocumentByToken(
        token,
        file,
        uploadType,
        uploadCustomName || undefined,
      );
      setUploadType("");
      setUploadCustomName("");
      fileInput.value = "";
      loadDocuments();
    } catch {
      setError("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    if (!token) return;
    try {
      const presignedUrl = await invitationsApi.getDocumentDownloadUrl(token, doc.id);
      const a = document.createElement('a');
      a.href = presignedUrl;
      a.download = doc.nomFichier;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setError("Erreur lors du téléchargement");
    }
  };

  if (loading) return <div className="auth-page"><p>Chargement...</p></div>;

  if (error) {
    return (
      <div className="auth-page">
        <h1>Dossier Locatif</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!invitation) return null;

  const invUrl = `${window.location.origin}/invitation/${token}`;
  const selectedType = documentTypes.find((t) => t.id === uploadType);
  const showCustomName = selectedType?.nom === "Autre";

  return (
    <div className="person-view">
      <header>
        <h1>Dossier Locatif</h1>
        <p>Complétez vos informations et documents</p>
      </header>

      <main>
        <form onSubmit={handleSave} className="form-section">
          <h2>Mes informations</h2>
          <div className="form-row">
            <label>
              Prénom
              <input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </label>
            <label>
              Nom
              <input value={nom} onChange={(e) => setNom(e.target.value)} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Téléphone
              <input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            {saveSuccess && <span className="success-msg">Informations enregistrées</span>}
          </div>
        </form>

        <div className="form-section">
          <h2>Mes documents</h2>

          <form onSubmit={handleUpload} className="document-upload">
            <div className="form-row">
              <label>
                Type de document
                <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
                  <option value="">Sélectionner un type</option>
                  {documentTypes.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.nom}
                    </option>
                  ))}
                </select>
              </label>
              {showCustomName && (
                <label>
                  Nom du document
                  <input
                    value={uploadCustomName}
                    onChange={(e) => setUploadCustomName(e.target.value)}
                    placeholder="Ex: Attestation employeur"
                  />
                </label>
              )}
            </div>
            <div className="form-row">
              <label>
                Fichier
                <input id="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" />
              </label>
            </div>
            <button type="submit" className="btn-primary" disabled={uploading || !uploadType}>
              {uploading ? "Upload..." : "Uploader"}
            </button>
          </form>

          {documents.length > 0 ? (
            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-row">
                  <span>{doc.nomFichier}</span>
                  <span className="document-size">{formatTaille(doc.taille)}</span>
                  <button onClick={() => handleDownload(doc)} className="btn-download">
                    Télécharger
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Aucun document uploadé</p>
          )}
        </div>

        <div className="form-section">
          <h2>Partager ce lien</h2>
          <div className="invite-link">
            <input type="text" readOnly value={invUrl} onClick={(e) => (e.target as HTMLInputElement).select()} />
          </div>
          <div className="qr-container">
            <canvas ref={qrCanvasRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
