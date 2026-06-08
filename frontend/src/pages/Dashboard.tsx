import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { invitationsApi, type Invitation } from '../api/invitations';
import { personnesApi, type Personne } from '../api/personnes';
import QRCode from 'qrcode';

function InvitationQR({ token, label }: { token: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [show, setShow] = useState(false);
  const url = `${window.location.origin}/invitation/${token}`;

  useEffect(() => {
    if (show && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 180 });
    }
  }, [show, url]);

  return (
    <div className="invitation-qr">
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

export function Dashboard() {
  const { account, logout } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [invitationsData, personnesData] = await Promise.all([
        invitationsApi.list(),
        personnesApi.list(),
      ]);
      setInvitations(invitationsData);
      setPersonnes(personnesData);
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvitation = async (personneId: string) => {
    try {
      await invitationsApi.create(personneId);
      await loadData();
    } catch {
      // Ignore errors
    }
  };

  const handleCopyLink = async (token: string) => {
    const url = `${window.location.origin}/invitation/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(token);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statutLabel = (s: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      viewed: 'Consultée',
      completed: 'Complétée',
    };
    return labels[s] || s;
  };

  const personnesWithoutInvitation = personnes.filter(
    (p) => !invitations.some((inv) => inv.personneId === p.id),
  );

  return (
    <div className="dashboard">
      <header>
        <h1>Mon Dossier Locatif</h1>
        <div>
          <span>{account?.email}</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <main>
        <div className="quick-actions">
          <button onClick={() => navigate('/dossier')} className="card-action">
            <h3>Gestion des personnes</h3>
            <p>Ajouter, modifier ou supprimer les personnes du dossier</p>
          </button>
        </div>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Invitations</h2>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <>
              {invitations.length > 0 && (
                <div className="invitations-list">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="invitation-card">
                      <div className="invitation-info">
                        <strong>
                          {inv.personne.prenom} {inv.personne.nom}
                        </strong>
                        <span className={`statut-badge statut-${inv.statut}`}>
                          {statutLabel(inv.statut)}
                        </span>
                      </div>
                      <div className="invitation-actions">
                        <button
                          className="btn-small"
                          onClick={() => handleCopyLink(inv.token)}
                        >
                          {copiedId === inv.token ? 'Copié !' : 'Copier le lien'}
                        </button>
                        <InvitationQR token={inv.token} label={`${inv.personne.prenom} ${inv.personne.nom}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {personnesWithoutInvitation.length > 0 && (
                <div className="invite-persons-section">
                  <h3>Créer une invitation</h3>
                  <div className="personnes-list">
                    {personnesWithoutInvitation.map((p) => (
                      <div key={p.id} className="personne-card">
                        <div className="personne-info">
                          <strong>
                            {p.prenom} {p.nom}
                          </strong>
                          <span className="statut-badge">{p.statut.nom}</span>
                        </div>
                        <button
                          className="btn-primary"
                          onClick={() => handleCreateInvitation(p.id)}
                        >
                          Inviter
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {invitations.length === 0 && personnesWithoutInvitation.length === 0 && (
                <p className="empty-state">
                  Ajoutez d'abord des personnes dans la gestion des personnes
                </p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
