import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { invitationsApi, type Invitation } from '../api/invitations';
import { personnesApi, type Personne } from '../api/personnes';
import QRCode from 'qrcode';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

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
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setShow(!show)}>
        {show ? 'Masquer QR' : 'QR Code'}
      </Button>
      {show && (
        <div className="absolute right-0 top-full z-10 mt-2 rounded-lg border border-border bg-card p-3 shadow-lg">
          <canvas ref={canvasRef} />
          <p className="text-xs text-muted-foreground text-center mt-1">{label}</p>
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

  const statutVariant = (s: string) => {
    const map: Record<string, "warning" | "info" | "success"> = {
      pending: 'warning',
      viewed: 'info',
      completed: 'success',
    };
    return map[s] || 'default';
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">Mon Dossier Locatif</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{account?.email}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </header>

      <main>
        <div className="grid gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dossier')}>
            <CardHeader>
              <CardTitle>Gestion des personnes</CardTitle>
              <CardDescription>
                Ajouter, modifier ou supprimer les personnes du dossier
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Invitations</h2>

          {loading ? (
            <p className="text-muted-foreground text-sm">Chargement...</p>
          ) : (
            <>
              {invitations.length > 0 && (
                <div className="space-y-2 mb-6">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                          {inv.personne.prenom} {inv.personne.nom}
                        </span>
                        <Badge variant={statutVariant(inv.statut)} className="w-fit">
                          {statutLabel(inv.statut)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopyLink(inv.token)}>
                          {copiedId === inv.token ? 'Copié !' : 'Copier le lien'}
                        </Button>
                        <InvitationQR token={inv.token} label={`${inv.personne.prenom} ${inv.personne.nom}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {personnesWithoutInvitation.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Créer une invitation</h3>
                  <div className="space-y-2">
                    {personnesWithoutInvitation.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{p.prenom} {p.nom}</span>
                          <Badge variant="default" className="w-fit">{p.statut.nom}</Badge>
                        </div>
                        <Button size="sm" onClick={() => handleCreateInvitation(p.id)}>
                          Inviter
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {invitations.length === 0 && personnesWithoutInvitation.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8 border border-dashed border-border rounded-lg">
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
