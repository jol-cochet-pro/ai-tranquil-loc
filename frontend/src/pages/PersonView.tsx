import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import QRCode from "qrcode";
import { invitationsApi, type Invitation } from "../api/invitations";
import type { DocumentType } from "../api/configuration";
import type { Document } from "../api/documents";
import { formatTaille, downloadBlob } from "./utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

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
      const url = invitationsApi.getDocumentDownloadUrl(token, doc.id);
      const response = await fetch(url);
      const blob = await response.blob();
      downloadBlob(blob, doc.nomFichier);
    } catch {
      setError("Erreur lors du téléchargement");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Dossier Locatif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  const invUrl = `${window.location.origin}/invitation/${token}`;
  const selectedType = documentTypes.find((t) => t.id === uploadType);
  const showCustomName = selectedType?.nom === "Autre";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <header className="text-center mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">Dossier Locatif</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complétez vos informations et documents
        </p>
      </header>

      <main className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mes informations</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
                {saveSuccess && (
                  <span className="text-sm text-green-600">Informations enregistrées</span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mes documents</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de document</Label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <option value="">Sélectionner un type</option>
                    {documentTypes.map((dt) => (
                      <option key={dt.id} value={dt.id}>
                        {dt.nom}
                      </option>
                    ))}
                  </select>
                </div>
                {showCustomName && (
                  <div className="space-y-2">
                    <Label>Nom du document</Label>
                    <Input
                      value={uploadCustomName}
                      onChange={(e) => setUploadCustomName(e.target.value)}
                      placeholder="Ex: Attestation employeur"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Fichier</Label>
                <Input id="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" />
              </div>
              <Button type="submit" disabled={uploading || !uploadType}>
                {uploading ? "Upload..." : "Uploader"}
              </Button>
            </form>

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
                    <span className="flex-1 text-foreground">{doc.nomFichier}</span>
                    <span className="text-xs text-muted-foreground">{formatTaille(doc.taille)}</span>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4 border border-dashed border-border rounded-lg">
                Aucun document uploadé
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Partager ce lien</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              readOnly
              value={invUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="mb-4"
            />
            <div className="flex justify-center">
              <canvas ref={qrCanvasRef} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
