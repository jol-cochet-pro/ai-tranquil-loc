import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { personnesApi, type Personne } from "../api/personnes"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

interface Props {
  role: "candidat" | "garant"
}

const ROLE_LABELS: Record<string, string> = {
  candidat: "Candidat",
  co_candidat: "Co-candidat",
  garant: "Garant",
}

export function PersonListPage({ role }: Props) {
  const navigate = useNavigate()
  const [personnes, setPersonnes] = useState<Personne[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    personnesApi
      .list()
      .then((data) => {
        if (role === "candidat") {
          setPersonnes(data.filter((p) => p.role === "candidat" || p.role === "co_candidat"))
        } else {
          setPersonnes(data.filter((p) => p.role === "garant"))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [role])

  const title = role === "candidat" ? "Candidats" : "Garants"
  const createLabel = role === "candidat" ? "Ajouter un co-candidat" : "Ajouter un garant"

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <Button size="sm" onClick={() => navigate(role === "candidat" ? "/candidats/creer" : "/garants/creer")}>
          {createLabel}
        </Button>
      </div>

      {personnes.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8 border border-dashed border-border rounded-lg">
          Aucune personne pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {personnes.map((personne) => (
            <Card key={personne.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {personne.prenom} {personne.nom}
                      {personne.role === "candidat" && (
                        <Badge variant="default" className="ml-2">Moi</Badge>
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="default">{personne.statut.nom}</Badge>
                      <Badge variant="secondary">{ROLE_LABELS[personne.role] || personne.role}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {personne.email && `${personne.email}`}
                      {personne.revenus != null && ` · ${personne.revenus.toLocaleString("fr-FR")} €/mois`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`${role === "candidat" ? "/candidats" : "/garants"}/${personne.id}`)}>
                      Modifier
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
