import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  personnesApi,
  type Personne,
  type CreatePersonneDto,
} from "../api/personnes";
import {
  configurationApi,
  type Statut,
  type DocumentType,
} from "../api/configuration";
import {
  documentsApi,
  type Document,
} from "../api/documents";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";


function emptyForm(): CreatePersonneDto {
  return {
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    revenus: undefined,
    typeLogement: "locataire",
    statutId: "",
  };
}

function formatTaille(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DossierBuilder() {
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [allDocumentTypes, setAllDocumentTypes] = useState<DocumentType[]>([]);
  const [documentsByStatut, setDocumentsByStatut] = useState<
    Record<string, DocumentType[]>
  >({});
  const [documentsByPersonne, setDocumentsByPersonne] = useState<
    Record<string, Document[]>
  >({});
  const [editingPersonne, setEditingPersonne] = useState<Personne | null>(null);
  const [form, setForm] = useState<CreatePersonneDto>(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingPersonneId, setUploadingPersonneId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [personnesData, statutsData, docTypesData] = await Promise.all([
        personnesApi.list(),
        configurationApi.statuts(),
        configurationApi.documentTypes(),
      ]);
      setPersonnes(personnesData);
      setStatuts(statutsData);
      setAllDocumentTypes(docTypesData);
    } catch {
      setError("Erreur lors du chargement des données");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadDocumentsForPersonne = useCallback(async (personneId: string) => {
    try {
      const docs = await documentsApi.listForPersonne(personneId);
      setDocumentsByPersonne((prev) => ({ ...prev, [personneId]: docs }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    for (const p of personnes) {
      loadDocumentsForPersonne(p.id);
    }
  }, [personnes, loadDocumentsForPersonne]);

  const loadDocumentsForStatut = async (statutId: string) => {
    if (documentsByStatut[statutId]) return;
    try {
      const docs = await configurationApi.documentsForStatut(statutId);
      setDocumentsByStatut((prev) => ({ ...prev, [statutId]: docs }));
    } catch {
      // ignore
    }
  };

  const handleEdit = (personne: Personne) => {
    setEditingPersonne(personne);
    setForm({
      nom: personne.nom,
      prenom: personne.prenom,
      email: personne.email || "",
      telephone: personne.telephone || "",
      revenus: personne.revenus ?? undefined,
      typeLogement: personne.typeLogement,
      statutId: personne.statutId,
    });
    loadDocumentsForStatut(personne.statutId);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingPersonne(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette personne ?")) return;
    try {
      await personnesApi.delete(id);
      setPersonnes((prev) => prev.filter((p) => p.id !== id));
      setDocumentsByPersonne((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setSuccess("Personne supprimée");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData: CreatePersonneDto = {
      ...form,
      email: form.email || undefined,
      telephone: form.telephone || undefined,
      revenus: form.revenus ?? undefined,
    };

    try {
      if (editingPersonne) {
        const updated = await personnesApi.update(
          editingPersonne.id,
          formData,
        );
        setPersonnes((prev) =>
          prev.map((p) => (p.id === editingPersonne.id ? updated : p)),
        );
        setSuccess("Personne mise à jour");
      } else {
        const created = await personnesApi.create(formData);
        setPersonnes((prev) => [...prev, created]);
        setSuccess("Personne ajoutée");
      }
      setTimeout(() => setSuccess(""), 3000);
      setShowForm(false);
      setEditingPersonne(null);
    } catch {
      setError("Erreur lors de l'enregistrement");
    }
  };

  const handleUpload = async (
    personneId: string,
    file: File | null,
    typeDocumentId: string,
    typeDocumentPersonnalise?: string,
  ) => {
    if (!file || !typeDocumentId) return;
    setUploadingPersonneId(personneId);
    try {
      const doc = await documentsApi.upload(
        personneId,
        file,
        typeDocumentId,
        typeDocumentPersonnalise,
      );
      setDocumentsByPersonne((prev) => ({
        ...prev,
        [personneId]: [doc, ...(prev[personneId] || [])],
      }));
    } catch {
      setError("Erreur lors de l'upload");
    } finally {
      setUploadingPersonneId(null);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await documentsApi.download(doc.id);
      const blob = new Blob([response.data], { type: doc.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nomFichier;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Erreur lors du téléchargement");
    }
  };

  const handleDeleteDocument = async (
    personneId: string,
    documentId: string,
  ) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      await documentsApi.delete(personneId, documentId);
      setDocumentsByPersonne((prev) => ({
        ...prev,
        [personneId]: (prev[personneId] || []).filter(
          (d) => d.id !== documentId,
        ),
      }));
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const statutLabel = (id: string) =>
    statuts.find((s) => s.id === id)?.nom || id;

  const typeLogementLabel = (t: string) => {
    const labels: Record<string, string> = {
      locataire: "Locataire",
      proprietaire: "Propriétaire",
      heberge: "Hébergé",
    };
    return labels[t] || t;
  };

  const docTypeLabel = (id: string) =>
    allDocumentTypes.find((d) => d.id === id)?.nom || id;

  const missingDocTypes = (personne: Personne) => {
    const required = documentsByStatut[personne.statutId] || [];
    const uploaded = documentsByPersonne[personne.id] || [];
    const uploadedTypeIds = new Set(uploaded.map((d) => d.typeDocumentId));
    return required.filter((d) => !uploadedTypeIds.has(d.id));
  };

  const UploadForm = ({ personne }: { personne: Personne }) => {
    const [file, setFile] = useState<File | null>(null);
    const [typeDocumentId, setTypeDocumentId] = useState("");
    const [customName, setCustomName] = useState("");

    const selectedType = allDocumentTypes.find(
      (d) => d.id === typeDocumentId,
    );

    const canSubmit = file && typeDocumentId;
    const isAutre = selectedType?.nom === "Autre";

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isAutre && !customName) return;
      handleUpload(personne.id, file, typeDocumentId, isAutre ? customName : undefined);
      setFile(null);
      setTypeDocumentId("");
      setCustomName("");
    };

    return (
      <form className="flex flex-wrap gap-3 items-end" onSubmit={onSubmit}>
        <div>
          <Label className="mb-1 block text-xs">Fichier</Label>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-40"
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs">Type</Label>
          <select
            value={typeDocumentId}
            onChange={(e) => setTypeDocumentId(e.target.value)}
            className="flex h-10 w-40 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="">Sélectionner...</option>
            {allDocumentTypes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nom}
              </option>
            ))}
          </select>
        </div>
        {isAutre && (
          <div>
            <Label className="mb-1 block text-xs">Nom personnalisé</Label>
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Ex: Attestation stage"
              className="w-44"
            />
          </div>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!canSubmit || uploadingPersonneId === personne.id}
        >
          {uploadingPersonneId === personne.id ? "Envoi..." : "Uploader"}
        </Button>
      </form>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">Mon Dossier Locatif</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{account?.email}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="flex gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
          Tableau de bord
        </Button>
        <Button variant="default" size="sm">
          Gestion des personnes
        </Button>
      </div>

      <main>
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-800 text-sm rounded-lg px-3 py-2 mb-4">
            {success}
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Personnes du dossier</h2>
            <Button size="sm" onClick={handleAdd}>
              + Ajouter
            </Button>
          </div>

          {personnes.length === 0 && !showForm && (
            <p className="text-muted-foreground text-sm text-center py-8 border border-dashed border-border rounded-lg">
              Aucune personne pour le moment. Ajoutez le candidat locataire, les
              garants ou les co-candidats.
            </p>
          )}

          <div className="space-y-4">
            {personnes.map((personne) => {
              const missing = missingDocTypes(personne);
              return (
                <Card key={personne.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {personne.prenom} {personne.nom}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="default">{statutLabel(personne.statutId)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {typeLogementLabel(personne.typeLogement)}
                          {personne.email && ` · ${personne.email}`}
                          {personne.revenus != null && ` · ${personne.revenus.toLocaleString("fr-FR")} €/mois`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(personne)}>
                          Modifier
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(personne.id)}>
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        Documents
                        {missing.length > 0 && (
                          <span className="text-destructive text-xs ml-2">
                            ({missing.length} requis manquants)
                          </span>
                        )}
                      </h4>

                      {(documentsByPersonne[personne.id]?.length || 0) > 0 && (
                        <div className="space-y-1 mb-3">
                          {documentsByPersonne[personne.id]?.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
                              <span className="flex-1 text-foreground">{doc.nomFichier}</span>
                              <span className="text-xs text-muted-foreground">{docTypeLabel(doc.typeDocumentId)}</span>
                              <span className="text-xs text-muted-foreground">{formatTaille(doc.taille)}</span>
                              <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                                Télécharger
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteDocument(personne.id, doc.id)}>
                                Supprimer
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {missing.length > 0 && (
                        <div className="mb-3 rounded-lg bg-primary-light/30 px-3 py-2 text-sm">
                          <p className="font-medium text-primary text-xs mb-1">Documents requis manquants :</p>
                          <ul className="list-disc list-inside text-xs text-foreground">
                            {missing.map((d) => (
                              <li key={d.id}>{d.nom}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <UploadForm personne={personne} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {showForm && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingPersonne ? "Modifier" : "Ajouter"} une personne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      value={form.prenom}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, prenom: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      value={form.nom}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nom: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={form.telephone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, telephone: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Revenus (net mensuel €)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.revenus ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          revenus: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type de logement</Label>
                    <select
                      value={form.typeLogement}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          typeLogement: e.target.value as CreatePersonneDto["typeLogement"],
                        }))
                      }
                      className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                      <option value="locataire">Locataire</option>
                      <option value="proprietaire">Propriétaire</option>
                      <option value="heberge">Hébergé</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <select
                    value={form.statutId}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, statutId: e.target.value }));
                      loadDocumentsForStatut(e.target.value);
                    }}
                    required
                    className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <option value="">Sélectionner...</option>
                    {statuts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {form.statutId && documentsByStatut[form.statutId] && (
                  <div className="rounded-lg bg-primary-light/30 px-4 py-3">
                    <h3 className="text-sm font-medium text-primary mb-1">Documents requis</h3>
                    <ul className="list-disc list-inside text-xs text-foreground">
                      {documentsByStatut[form.statutId].map((doc) => (
                        <li key={doc.id}>{doc.nom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="submit">
                    {editingPersonne ? "Enregistrer" : "Ajouter"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPersonne(null);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
