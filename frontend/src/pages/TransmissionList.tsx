import { useState, useEffect, useCallback } from "react"
import { transmissionsApi, type Transmission } from "../api/transmissions"
import { personnesApi, type Personne } from "../api/personnes"
import { configurationApi, type DocumentType } from "../api/configuration"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"

const EXPIRATION_OPTIONS = [
  { value: 7, label: "7 jours" },
  { value: 30, label: "30 jours" },
  { value: 90, label: "3 mois" },
  { value: 365, label: "1 an" },
  { value: 0, label: "Pas d'expiration" },
]

function transmissionStatus(tx: Transmission): "actif" | "expiré" | "révoqué" {
  if (tx.revoked) return "révoqué"
  if (tx.expireAt && new Date(tx.expireAt) < new Date()) return "expiré"
  return "actif"
}

function statusColor(s: string) {
  const map: Record<string, "success" | "destructive" | "warning" | "default"> = {
    actif: "success",
    expiré: "warning",
    révoqué: "destructive",
  }
  return (map[s] as "success" | "destructive" | "warning" | "default") || "default"
}

export function TransmissionList() {
  const [transmissions, setTransmissions] = useState<Transmission[]>([])
  const [personnes, setPersonnes] = useState<Personne[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [selectedDocTypes, setSelectedDocTypes] = useState<Set<string>>(new Set())
  const [expireInDays, setExpireInDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "actif" | "expiré" | "révoqué">("all")

  const loadData = useCallback(async () => {
    try {
      const [txs, pers, docs] = await Promise.all([
        transmissionsApi.list(),
        personnesApi.list(),
        configurationApi.documentTypes(),
      ])
      setTransmissions(txs)
      setPersonnes(pers)
      setDocumentTypes(docs)
      setSelectedDocTypes(new Set(docs.map((d) => d.id)))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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

  const handleCreate = async () => {
    if (selectedDocTypes.size === 0) return
    setCreating(true)
    try {
      const tx = await transmissionsApi.create({
        documentTypeIds: Array.from(selectedDocTypes),
        expireInDays: expireInDays > 0 ? expireInDays : undefined,
      })
      copyLink(`${window.location.origin}/transmission/${tx.token}`)
      await loadData()
    } catch {
      // ignore
    } finally {
      setCreating(false)
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

  const toggleDocType = (id: string) => {
    setSelectedDocTypes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filtered = transmissions.filter((tx) => {
    if (filter === "all") return true
    return transmissionStatus(tx) === filter
  })

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">Transmissions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Créer une transmission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Durée d'expiration</label>
            <select
              className="w-full h-10 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={expireInDays}
              onChange={(e) => setExpireInDays(Number(e.target.value))}
            >
              {EXPIRATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Types de documents à inclure
            </label>
            <div className="border border-border rounded-lg divide-y divide-border">
              {documentTypes.map((dt) => (
                <label
                  key={dt.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="rounded accent-primary"
                    checked={selectedDocTypes.has(dt.id)}
                    onChange={() => toggleDocType(dt.id)}
                  />
                  <span className="text-sm text-foreground">{dt.nom}</span>
                </label>
              ))}
            </div>
          </div>

          {personnes.length > 0 && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Les documents des {personnes.length} personne(s) du dossier seront partagés.</p>
              {Array.from(selectedDocTypes).map((dtId) => {
                const dt = documentTypes.find((d) => d.id === dtId)
                if (!dt) return null
                return (
                  <p key={dtId} className="text-xs">
                    <span className="font-medium">{dt.nom}</span> : présent pour {personnes.length} personne(s)
                  </p>
                )
              })}
            </div>
          )}

          <Button onClick={handleCreate} disabled={creating || selectedDocTypes.size === 0}>
            {creating ? "Création..." : "Créer le lien"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Transmissions existantes</h2>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="actif">Actives</TabsTrigger>
            <TabsTrigger value="expiré">Expirées</TabsTrigger>
            <TabsTrigger value="révoqué">Révoquées</TabsTrigger>
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8 border border-dashed border-border rounded-lg">
            Aucune transmission.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => {
              const status = transmissionStatus(tx)
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs text-muted-foreground font-mono truncate">
                      {tx.token}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusColor(status)} className="w-fit">
                        {status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Créée le {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                      </span>
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
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(`${window.location.origin}/transmission/${tx.token}`)}
                    >
                      {copiedToken === `${window.location.origin}/transmission/${tx.token}`
                        ? "Copié !"
                        : "Copier le lien"}
                    </Button>
                    {!tx.revoked && status !== "expiré" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(tx.id)}
                      >
                        Révoquer
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
