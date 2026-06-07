import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { personnesApi, type Personne, type CreatePersonneDto } from '../api/personnes';
import { configurationApi, type Statut, type DocumentType } from '../api/configuration';

function emptyForm(): CreatePersonneDto {
  return {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    revenus: undefined,
    typeLogement: 'locataire',
    statutId: '',
  };
}

export function DossierBuilder() {
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [documentsByStatut, setDocumentsByStatut] = useState<Record<string, DocumentType[]>>({});
  const [editingPersonne, setEditingPersonne] = useState<Personne | null>(null);
  const [form, setForm] = useState<CreatePersonneDto>(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [personnesData, statutsData] = await Promise.all([
        personnesApi.list(),
        configurationApi.statuts(),
      ]);
      setPersonnes(personnesData);
      setStatuts(statutsData);
    } catch {
      setError('Erreur lors du chargement des données');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

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
      email: personne.email || '',
      telephone: personne.telephone || '',
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
    if (!window.confirm('Supprimer cette personne ?')) return;
    try {
      await personnesApi.delete(id);
      setPersonnes((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formData: CreatePersonneDto = {
      ...form,
      email: form.email || undefined,
      telephone: form.telephone || undefined,
      revenus: form.revenus || undefined,
    };

    try {
      if (editingPersonne) {
        const updated = await personnesApi.update(editingPersonne.id, formData);
        setPersonnes((prev) => prev.map((p) => (p.id === editingPersonne.id ? updated : p)));
      } else {
        const created = await personnesApi.create(formData);
        setPersonnes((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingPersonne(null);
    } catch {
      setError('Erreur lors de l\'enregistrement');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statutLabel = (id: string) => statuts.find((s) => s.id === id)?.nom || id;

  const typeLogementLabel = (t: string) => {
    const labels: Record<string, string> = {
      locataire: 'Locataire',
      proprietaire: 'Propriétaire',
      heberge: 'Hébergé',
    };
    return labels[t] || t;
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
        <button onClick={() => navigate('/dashboard')}>Tableau de bord</button>
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
              Aucune personne pour le moment. Ajoutez le candidat locataire, les garants ou les co-candidats.
            </p>
          )}

          <div className="personnes-list">
            {personnes.map((personne) => (
              <div key={personne.id} className="personne-card">
                <div className="personne-info">
                  <strong>
                    {personne.prenom} {personne.nom}
                  </strong>
                  <span className="statut-badge">{statutLabel(personne.statutId)}</span>
                  <span className="type-logement">{typeLogementLabel(personne.typeLogement)}</span>
                  {personne.email && <span className="email">{personne.email}</span>}
                  {personne.revenus != null && (
                    <span className="revenus">{personne.revenus.toLocaleString('fr-FR')} €/mois</span>
                  )}
                </div>
                <div className="personne-actions">
                  <button onClick={() => handleEdit(personne)}>Modifier</button>
                  <button onClick={() => handleDelete(personne.id)} className="btn-danger">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {showForm && (
          <section className="form-section">
            <h2>{editingPersonne ? 'Modifier' : 'Ajouter'} une personne</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Prénom
                  <input
                    value={form.prenom}
                    onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Nom
                  <input
                    value={form.nom}
                    onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </label>
                <label>
                  Téléphone
                  <input
                    value={form.telephone}
                    onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Revenus (net mensuel €)
                  <input
                    type="number"
                    min="0"
                    value={form.revenus ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, revenus: e.target.value ? Number(e.target.value) : undefined }))
                    }
                  />
                </label>
                <label>
                  Type de logement
                  <select
                    value={form.typeLogement}
                    onChange={(e) => setForm((f) => ({ ...f, typeLogement: e.target.value as CreatePersonneDto['typeLogement'] }))}
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
                  {editingPersonne ? 'Enregistrer' : 'Ajouter'}
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
