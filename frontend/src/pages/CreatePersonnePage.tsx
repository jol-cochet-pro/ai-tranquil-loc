import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { StepperForm, type PersonneFormData, type SubmitPayload } from "../components/StepperForm"
import { personnesApi, type Personne } from "../api/personnes"
import { documentsApi, type Document } from "../api/documents"
import { invitationsApi } from "../api/invitations"
import { configurationApi, type Statut, type DocumentType } from "../api/configuration"

export function CreatePersonnePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { personneId } = useParams<{ personneId?: string }>()
  const isEdit = !!personneId
  const targetRole: "co_candidat" | "garant" = location.pathname.startsWith("/candidats")
    ? "co_candidat"
    : "garant"

  const [statuts, setStatuts] = useState<Statut[]>([])
  const [requiredDocTypes, setRequiredDocTypes] = useState<DocumentType[]>([])
  const [initialData, setInitialData] = useState<PersonneFormData | null>(null)
  const [existingDocuments, setExistingDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    configurationApi
      .statuts()
      .then(setStatuts)
      .catch(() => setError("Erreur lors du chargement des statuts"))
      .finally(() => setDataLoading(false))
  }, [])

  useEffect(() => {
    if (!personneId) return

    let cancelled = false

    Promise.all([
      personnesApi.get(personneId),
      documentsApi.listForPersonne(personneId),
    ])
      .then(([personne, docs]) => {
        if (cancelled) return
        setInitialData({
          nom: personne.nom,
          prenom: personne.prenom,
          email: personne.email ?? "",
          telephone: personne.telephone ?? "",
          statutId: personne.statutId,
          typeLogement: personne.typeLogement,
          revenus: personne.revenus != null ? String(personne.revenus) : "",
        })
        setExistingDocuments(docs)
        return configurationApi
          .documentsForStatut(personne.statutId)
          .then((types) => {
            if (!cancelled) setRequiredDocTypes(types)
          })
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les données de la personne")
      })

    return () => {
      cancelled = true
    }
  }, [personneId])

  const handleStatutChange = (statutId: string) => {
    configurationApi
      .documentsForStatut(statutId)
      .then(setRequiredDocTypes)
      .catch(() => setRequiredDocTypes([]))
  }

  const handleSubmit = async (payload: SubmitPayload) => {
    setLoading(true)
    setError(null)

    const { form, pendingDocuments, deletedDocumentIds } = payload

    const createDto = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email || undefined,
      telephone: form.telephone || undefined,
      revenus: form.revenus ? Number(form.revenus) : undefined,
      role: targetRole,
      typeLogement: form.typeLogement,
      statutId: form.statutId,
    }

    try {
      let personne: Personne

      if (isEdit && personneId) {
        personne = await personnesApi.update(personneId, createDto)

        for (const docId of deletedDocumentIds) {
          await documentsApi.delete(personneId, docId).catch(() => {})
        }
      } else {
        personne = await personnesApi.create(createDto)
      }

      for (const pd of pendingDocuments) {
        await documentsApi.upload(personne.id, pd.file, pd.documentTypeId).catch(() => {})
      }

      if (!isEdit) {
        await invitationsApi.create(personne.id).catch(() => {})
      }

      navigate(targetRole === "co_candidat" ? "/candidats" : "/garants")
    } catch {
      setError("Une erreur est survenue lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(targetRole === "co_candidat" ? "/candidats" : "/garants")
  }

  if (dataLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-8">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive text-center">
            {error}
          </div>
        </div>
      )}

      <StepperForm
        role={targetRole}
        statuts={statuts}
        requiredDocumentTypes={requiredDocTypes}
        initialData={initialData}
        existingDocuments={existingDocuments}
        onStatutChange={handleStatutChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </>
  )
}
