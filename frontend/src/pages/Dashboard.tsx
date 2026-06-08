import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { invitationsApi, type Invitation } from "../api/invitations"
import { personnesApi, type PersonneCompletion } from "../api/personnes"
import { transmissionsApi, type Transmission } from "../api/transmissions"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

const ROLE_LABELS: Record<string, string> = {
  candidat: "Candidat",
  co_candidat: "Co-candidat",
  garant: "Garant",
}

function completionColor(ratio: number): "success" | "warning" | "destructive" {
  if (ratio >= 1) return "success"
  if (ratio >= 0.5) return "warning"
  return "destructive"
}

function statutVariant(s: string): "warning" | "info" | "success" {
  const map: Record<string, "warning" | "info" | "success"> = {
    pending: "warning",
    viewed: "info",
    completed: "success",
  }
  return map[s] || "warning"
}

function statutLabel(s: string) {
  const labels: Record<string, string> = {
    pending: "En attente",
    viewed: "Consultée",
    completed: "Complétée",
  }
  return labels[s] || s
}

function transmissionStatus(tx: Transmission): "actif" | "expiré" | "révoqué" {
  if (tx.revoked) return "révoqué"
  if (tx.expireAt && new Date(tx.expireAt) < new Date()) return "expiré"
  return "actif"
}

function transmissionColor(status: string) {
  const map: Record<string, "success" | "destructive" | "warning"> = {
    actif: "success",
    expiré: "warning",
    révoqué: "destructive",
  }
  return map[status] || "default"
}

export function Dashboard() {
  const navigate = useNavigate()
  const [completions, setCompletions] = useState<PersonneCompletion[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [transmissions, setTransmissions] = useState<Transmission[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [completionsData, invitationsData, transmissionsData] = await Promise.all([
        personnesApi.completion(),
        invitationsApi.list(),
        transmissionsApi.list(),
      ])
      setCompletions(completionsData)
      setInvitations(invitationsData)
      setTransmissions(transmissionsData)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const copyLink = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToken(text)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch {
      const input = document.createElement("input")
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopiedToken(text)
      setTimeout(() => setCopiedToken(null), 2000)
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      await transmissionsApi.revoke(id)
      await loadData()
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Complétion des profils</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {completions.map((c) => {
            const required = c.documentsRequired > 0 ? c.documentsRequired : 1
            const ratio = c.documentsCount / required
            const color = completionColor(ratio)
            const target = c.role === "candidat" || c.role === "co_candidat" ? "/candidats" : "/garants"

            return (
              <Card
                key={c.personneId}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(target)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {c.prenom ? `${c.prenom} ${c.nom}` : c.nom}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="default">{ROLE_LABELS[c.role] || c.role}</Badge>
                        {c.invitationStatus && (
                          <Badge variant={statutVariant(c.invitationStatus)}>
                            {statutLabel(c.invitationStatus)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant={color}>
                      {c.documentsCount}/{required} documents
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
          {completions.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-full text-center py-8 border border-dashed border-border rounded-lg">
              Aucune personne dans le dossier.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Invitations</h2>
        {invitations.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8 border border-dashed border-border rounded-lg">
            Aucune invitation pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">
                    {inv.personne.prenom} {inv.personne.nom}
                  </span>
                  <Badge variant={statutVariant(inv.statut)} className="w-fit">
                    {statutLabel(inv.statut)}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyLink(`${window.location.origin}/invitation/${inv.token}`)
                  }}
                >
                  {copiedToken === `${window.location.origin}/invitation/${inv.token}`
                    ? "Copié !"
                    : "Copier le lien"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Transmissions</h2>
        {transmissions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-3">
              Aucune transmission pour le moment.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/transmissions")}>
              Créer une transmission
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {transmissions.slice(0, 5).map((tx) => {
              const status = transmissionStatus(tx)
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {tx.token.slice(0, 8)}...
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant={transmissionColor(status)} className="w-fit">
                        {status}
                      </Badge>
                      {tx.expireAt && (
                        <span className="text-xs text-muted-foreground">
                          Expire le {new Date(tx.expireAt).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {tx.transmissionDocumentTypes.length} type(s) de document
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyLink(`${window.location.origin}/transmission/${tx.token}`)
                      }}
                    >
                      {copiedToken === `${window.location.origin}/transmission/${tx.token}`
                        ? "Copié !"
                        : "Copier le lien"}
                    </Button>
                    {!tx.revoked && status !== "expiré" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRevoke(tx.id)
                        }}
                      >
                        Révoquer
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            {transmissions.length > 5 && (
              <Button
                variant="link"
                className="w-full mt-2"
                onClick={() => navigate("/transmissions")}
              >
                Voir toutes les transmissions ({transmissions.length})
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
