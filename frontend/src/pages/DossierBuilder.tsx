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
      } else {
        const created = await personnesApi.create(formData);
        setPersonnes((prev) => [...prev, created]);
      }
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
      const presignedUrl = await documentsApi.getDownloadUrl(doc.id);
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

  const requiredDocTypesForPersonne = (personne: Personne) =>
    documentsByStatut[personne.statutId] || [];

  const missingDocTypes = (personne: Personne) => {
    const required = requiredDocTypesForPersonne(personne);
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
      <form className="upload-form" onSubmit={onSubmit}>
        <div className="upload-row">
          <label>
            Fichier
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <label>
            Type
            <select
              value={typeDocumentId}
              onChange={(e) => setTypeDocumentId(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {allDocumentTypes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nom}
                </option>
              ))}
            </select>
          </label>
          {isAutre && (
            <label>
              Nom personnalisé
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ex: Attestation stage"
              />
            </label>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={!canSubmit || uploadingPersonneId === personne.id}
          >
            {uploadingPersonneId === personne.id ? "Envoi..." : "Uploader"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="dossier-builder">
      <header>
        <h1>Mon Dossier Locatif</h1>
        <div>
          <span>{account?.email}</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate("/dashboard")}>Tableau de bord</button>
        <button className="active">Gestion des personnes</button>
      </nav>

      <main>
        {error && <div className="error">{error}</div>}

        <section className="personnes-section">
          <div className="section-header">
            <h2>Personnes du dossier</h2>
            <button onClick={handleAdd} className="btn-primary">
              + Ajouter
            </button>
          </div>

          {personnes.length === 0 && !showForm && (
            <p className="empty-state">
              Aucune personne pour le moment. Ajoutez le candidat locataire, les
              garants ou les co-candidats.
            </p>
          )}

          <div className="personnes-list">
            {personnes.map((personne) => {
              const missing = missingDocTypes(personne);
              return (
                <div key={personne.id} className="personne-card">
                  <div className="personne-info">
                    <strong>
                      {personne.prenom} {personne.nom}
                    </strong>
                    <span className="statut-badge">
                      {statutLabel(personne.statutId)}
                    </span>
                    <span className="type-logement">
                      {typeLogementLabel(personne.typeLogement)}
                    </span>
                    {personne.email && (
                      <span className="email">{personne.email}</span>
                    )}
                    {personne.revenus != null && (
                      <span className="revenus">
                        {personne.revenus.toLocaleString("fr-FR")} €/mois
                      </span>
                    )}
                  </div>
                  <div className="personne-actions">
                    <button onClick={() => handleEdit(personne)}>
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(personne.id)}
                      className="btn-danger"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="documents-section">
                    <h4>
                      Documents{" "}
                      {missing.length > 0 && (
                        <span className="missing-count">
                          ({missing.length} requis manquants)
                        </span>
                      )}
                    </h4>

                    {(documentsByPersonne[personne.id]?.length || 0) > 0 && (
                      <ul className="document-list">
                        {documentsByPersonne[personne.id]?.map((doc) => (
                          <li key={doc.id} className="document-item">
                            <span className="doc-name">
                              {doc.nomFichier}
                            </span>
                            <span className="doc-type">
                              {docTypeLabel(doc.typeDocumentId)}
                            </span>
                            <span className="doc-size">
                              {formatTaille(doc.taille)}
                            </span>
                            <div className="doc-actions">
                              <button
                                onClick={() => handleDownload(doc)}
                                className="btn-download"
                              >
                                Télécharger
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteDocument(personne.id, doc.id)
                                }
                                className="btn-danger btn-sm"
                              >
                                Supprimer
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {missing.length > 0 && (
                      <div className="missing-docs">
                        <p className="missing-title">Documents requis manquants :</p>
                        <ul>
                          {missing.map((d) => (
                            <li key={d.id}>{d.nom}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <UploadForm personne={personne} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {showForm && (
          <section className="form-section">
            <h2>{editingPersonne ? "Modifier" : "Ajouter"} une personne</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Prénom
                  <input
                    value={form.prenom}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, prenom: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Nom
                  <input
                    value={form.nom}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nom: e.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Téléphone
                  <input
                    value={form.telephone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, telephone: e.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Revenus (net mensuel €)
                  <input
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
                </label>
                <label>
                  Type de logement
                  <select
                    value={form.typeLogement}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        typeLogement: e.target.value as CreatePersonneDto["typeLogement"],
                      }))
                    }
                  >
                    <option value="locataire">Locataire</option>
                    <option value="proprietaire">Propriétaire</option>
                    <option value="heberge">Hébergé</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Statut
                  <select
                    value={form.statutId}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, statutId: e.target.value }));
                      loadDocumentsForStatut(e.target.value);
                    }}
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {statuts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {form.statutId && documentsByStatut[form.statutId] && (
                <div className="documents-requis">
                  <h3>Documents requis</h3>
                  <ul>
                    {documentsByStatut[form.statutId].map((doc) => (
                      <li key={doc.id}>{doc.nom}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingPersonne ? "Enregistrer" : "Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPersonne(null);
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
