import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { transmissionsApi, type Transmission } from '../api/transmissions';
import { configurationApi, type DocumentType } from '../api/configuration';
import QRCode from 'qrcode';

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function TransmissionQR({ token, label }: { token: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [show, setShow] = useState(false);
  const url = `${window.location.origin}/transmission/${token}`;

  useEffect(() => {
    if (show && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 180 });
    }
  }, [show, url]);

  return (
    <div className="transmission-qr">
      <button className="btn-small" onClick={() => setShow(!show)}>
        {show ? 'Masquer QR' : 'QR Code'}
      </button>
      {show && (
        <div className="qr-popup">
          <canvas ref={canvasRef} />
          <p className="hint">{label}</p>
        </div>
      )}
    </div>
  );
}

export function TransmissionBuilder() {
  const { account } = useAuth();
  const navigate = useNavigate();

  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [expireAt, setExpireAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const loadData = () =>
    Promise.all([
      transmissionsApi.list(),
      configurationApi.documentTypes(),
    ]);

  useEffect(() => {
    loadData()
      .then(([txs, types]) => {
        setTransmissions(txs);
        setDocumentTypes(types);
      })
      .catch(() => setError('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  const toggleType = (id: string) => {
    setSelectedTypeIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (selectedTypeIds.length === 0) {
      setError('Sélectionnez au moins un type de document');
      return;
    }

    setCreating(true);
    setError('');
    setCreatedLink(null);
    setCreatedToken(null);

    try {
      const tx = await transmissionsApi.create({
        documentTypeIds: selectedTypeIds,
        expireAt: expireAt || undefined,
      });
      const url = `${window.location.origin}/transmission/${tx.token}`;
      setCreatedLink(url);
      setCreatedToken(tx.token);
      setSelectedTypeIds([]);
      setExpireAt('');
      loadData().then(([txs, types]) => {
        setTransmissions(txs);
        setDocumentTypes(types);
      });
    } catch {
      setError('Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await transmissionsApi.revoke(id);
      loadData().then(([txs, types]) => {
        setTransmissions(txs);
        setDocumentTypes(types);
      });
    } catch {
      setError('Erreur lors de la révocation');
    }
  };

  const handleCopyLink = async (token: string) => {
    const url = `${window.location.origin}/transmission/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(token);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedId(token);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const statutLabel = (tx: Transmission) => {
    if (tx.revoked) return 'Révoquée';
    if (tx.expireAt && new Date(tx.expireAt) < new Date()) return 'Expirée';
    return 'Active';
  };

  const statutClass = (tx: Transmission) => {
    if (tx.revoked) return 'statut-revoked';
    if (tx.expireAt && new Date(tx.expireAt) < new Date()) return 'statut-expired';
    return 'statut-active';
  };

  return (
    <div className="transmission-builder">
      <header>
        <h1>Transmissions</h1>
        <div>
          <span>{account?.email}</span>
          <button onClick={() => navigate('/dashboard')}>
            Retour au tableau de bord
          </button>
        </div>
      </header>

      <main>
        {error && <p className="error">{error}</p>}

        {createdLink && (
          <div className="success-card">
            <h3>Lien créé avec succès !</h3>
            <div className="created-link">
              <input readOnly value={createdLink} className="link-input" />
              <button
                className="btn-small"
                onClick={() => handleCopyLink(createdToken!)}
              >
                {copiedId === createdToken ? 'Copié !' : 'Copier'}
              </button>
            </div>
            {createdToken && (
              <TransmissionQR token={createdToken} label="Lien de transmission" />
            )}
          </div>
        )}

        <section className="section">
          <h2>Créer une transmission</h2>
          <p className="hint">
            Sélectionnez les types de documents à inclure dans le lien de
            transmission. Tous les documents correspondants (toutes personnes
            confondues) seront accessibles.
          </p>

          <div className="checkbox-group">
            {documentTypes.map((dt) => (
              <label key={dt.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedTypeIds.includes(dt.id)}
                  onChange={() => toggleType(dt.id)}
                />
                {dt.nom}
              </label>
            ))}
          </div>

          <div className="form-row">
            <label>
              Date d'expiration (optionnelle)
              <input
                type="date"
                value={expireAt}
                onChange={(e) => setExpireAt(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </label>
          </div>

          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating || selectedTypeIds.length === 0}
          >
            {creating ? 'Création...' : 'Créer le lien'}
          </button>
        </section>

        <section className="section">
          <h2>Transmissions existantes</h2>

          {loading ? (
            <p>Chargement...</p>
          ) : transmissions.length === 0 ? (
            <p className="empty-state">Aucune transmission créée</p>
          ) : (
            <div className="transmissions-list">
              {transmissions.map((tx) => (
                <div key={tx.id} className={`transmission-card ${statutClass(tx)}`}>
                  <div className="transmission-info">
                    <span className={`statut-badge ${statutClass(tx)}`}>
                      {statutLabel(tx)}
                    </span>
                    <span className="transmission-types">
                      {tx.transmissionDocumentTypes
                        .map((tdt) => tdt.documentType.nom)
                        .join(', ')}
                    </span>
                    <span className="transmission-date">
                      Créée le {formatDate(tx.createdAt)}
                    </span>
                    {tx.expireAt && (
                      <span className="transmission-expire">
                        Expire le {formatDate(tx.expireAt)}
                      </span>
                    )}
                  </div>
                  <div className="transmission-actions">
                    {!tx.revoked &&
                      (!tx.expireAt || new Date(tx.expireAt) >= new Date()) && (
                        <>
                          <button
                            className="btn-small"
                            onClick={() => handleCopyLink(tx.token)}
                          >
                            {copiedId === tx.token ? 'Copié !' : 'Copier le lien'}
                          </button>
                          <TransmissionQR
                            token={tx.token}
                            label={
                              tx.transmissionDocumentTypes
                                .map((tdt) => tdt.documentType.nom)
                                .join(', ')
                            }
                          />
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleRevoke(tx.id)}
                          >
                            Révoquer
                          </button>
                        </>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
