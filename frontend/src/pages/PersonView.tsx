import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { StepperForm, type PersonneFormData, type SubmitPayload } from "../components/StepperForm"
import { invitationsApi, type Invitation } from "../api/invitations"
import type { Document } from "../api/documents"
import type { DocumentType } from "../api/configuration"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

export function PersonView() {
  const { token } = useParams<{ token: string }>()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [existingDocuments, setExistingDocuments] = useState<Document[]>([])
  const [requiredDocTypes, setRequiredDocTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!token) return
    invitationsApi
      .getByToken(token)
      .then((inv) => {
        setInvitation(inv)
        setRequiredDocTypes(inv.documentTypes)
      })
      .catch(() => setError("Lien d'invitation invalide ou expiré"))
      .finally(() => setDataLoading(false))
  }, [token])

  useEffect(() => {
    if (!token) return
    invitationsApi
      .listDocumentsByToken(token)
      .then(setExistingDocuments)
      .catch(() => {})
  }, [token])

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Dossier Locatif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || "Impossible de charger l'invitation"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const personne = invitation.personne

  const initialData: PersonneFormData = {
    nom: personne.nom,
    prenom: personne.prenom,
    email: personne.email ?? "",
    telephone: personne.telephone ?? "",
    statutId: personne.statutId,
    typeLogement: personne.typeLogement,
    revenus: personne.revenus != null ? String(personne.revenus) : "",
  }

  const handleStatutChange = (statutId: string) => {
    const types = invitation.documentsByStatut[statutId] ?? []
    setRequiredDocTypes(types)
  }

  const handleSubmit = async (payload: SubmitPayload) => {
    if (!token) return
    setLoading(true)
    setError(null)
    setSaveSuccess(false)

    const { form, pendingDocuments, deletedDocumentIds } = payload

    try {
      await invitationsApi.updateByToken(token, {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email || undefined,
        telephone: form.telephone || undefined,
        statutId: form.statutId,
        typeLogement: form.typeLogement,
        revenus: form.revenus ? Number(form.revenus) : undefined,
      })

      for (const docId of deletedDocumentIds) {
        await invitationsApi.deleteDocumentByToken(token, docId).catch(() => {})
      }

      for (const pd of pendingDocuments) {
        await invitationsApi.uploadDocumentByToken(token, pd.file, pd.documentTypeId).catch(() => {})
      }

      setSaveSuccess(true)
      setExistingDocuments((prev) =>
        prev
          .filter((d) => !deletedDocumentIds.includes(d.id))
      )
    } catch {
      setError("Une erreur est survenue lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {}

  return (
    <>
      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-8">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive text-center">
            {error}
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="max-w-2xl mx-auto px-4 pt-8">
          <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700 text-center">
            Informations enregistrées avec succès
          </div>
        </div>
      )}

      <StepperForm
        role={personne.role}
        statuts={invitation.statuts}
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
