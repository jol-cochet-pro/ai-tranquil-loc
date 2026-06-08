import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Check, FileText, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../lib/utils"
import type { Statut, DocumentType } from "../api/configuration"
import type { Document } from "../api/documents"

export type TypeLogement = "locataire" | "proprietaire" | "heberge"

export interface PersonneFormData {
  nom: string
  prenom: string
  email: string
  telephone: string
  statutId: string
  typeLogement: TypeLogement
  revenus: string
}

export interface PendingDocument {
  documentTypeId: string
  file: File
}

export interface SubmitPayload {
  form: PersonneFormData
  pendingDocuments: PendingDocument[]
  deletedDocumentIds: string[]
}

export interface StepperFormProps {
  role: "candidat" | "co_candidat" | "garant"
  statuts: Statut[]
  requiredDocumentTypes: DocumentType[]
  initialData?: PersonneFormData | null
  existingDocuments?: Document[]
  onStatutChange?: (statutId: string) => void
  onSubmit: (payload: SubmitPayload) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const TYPELOGEMENT_LABELS: Record<TypeLogement, string> = {
  locataire: "Locataire",
  proprietaire: "Propriétaire",
  heberge: "Hébergé à titre gratuit",
}

const STEPS = [
  { num: 1 as const, label: "Infos personnelles" },
  { num: 2 as const, label: "Infos professionnelles" },
  { num: 3 as const, label: "Documents" },
  { num: 4 as const, label: "Récapitulatif" },
]

type Step = 1 | 2 | 3 | 4

export function StepperForm({
  role,
  statuts,
  requiredDocumentTypes,
  initialData,
  existingDocuments = [],
  onStatutChange,
  onSubmit,
  onCancel,
  loading = false,
}: StepperFormProps) {
  const [step, setStep] = useState<Step>(1)

  const [step1, setStep1] = useState({
    nom: initialData?.nom ?? "",
    prenom: initialData?.prenom ?? "",
    email: initialData?.email ?? "",
    telephone: initialData?.telephone ?? "",
  })

  const [step2, setStep2] = useState({
    statutId: initialData?.statutId ?? "",
    typeLogement: (initialData?.typeLogement ?? "locataire") as TypeLogement,
    revenus: initialData?.revenus ?? "",
  })

  const [pendingDocuments, setPendingDocuments] = useState<Map<string, File>>(new Map())
  const [deletedDocuments, setDeletedDocuments] = useState<Set<string>>(new Set())
  const fileRefs = useRef<Map<string, HTMLInputElement | null>>(new Map())

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return step1.nom.trim() !== "" && step1.prenom.trim() !== ""
      case 2:
        return step2.statutId !== ""
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as Step)
  }

  const handlePrev = () => {
    if (step > 1) setStep((step - 1) as Step)
  }

  const handleStatutChange = (value: string) => {
    setStep2((prev) => ({ ...prev, statutId: value }))
    onStatutChange?.(value)
  }

  const handleFileSelect = (documentTypeId: string, file: File) => {
    const next = new Map(pendingDocuments)
    next.set(documentTypeId, file)
    setPendingDocuments(next)
  }

  const handleFileRemove = (documentTypeId: string) => {
    const next = new Map(pendingDocuments)
    next.delete(documentTypeId)
    setPendingDocuments(next)
    const ref = fileRefs.current.get(documentTypeId)
    if (ref) ref.value = ""
  }

  const handleDeleteExisting = (documentId: string) => {
    const next = new Set(deletedDocuments)
    next.add(documentId)
    setDeletedDocuments(next)
  }

  const handleUndoDelete = (documentId: string) => {
    const next = new Set(deletedDocuments)
    next.delete(documentId)
    setDeletedDocuments(next)
  }

  const handleSubmit = () => {
    const formData: PersonneFormData = {
      nom: step1.nom,
      prenom: step1.prenom,
      email: step1.email,
      telephone: step1.telephone,
      statutId: step2.statutId,
      typeLogement: step2.typeLogement,
      revenus: step2.revenus,
    }

    const pending: PendingDocument[] = []
    pendingDocuments.forEach((file, docTypeId) => {
      pending.push({ documentTypeId: docTypeId, file })
    })

    onSubmit({
      form: formData,
      pendingDocuments: pending,
      deletedDocumentIds: Array.from(deletedDocuments),
    })
  }

  const visibleDocs = existingDocuments.filter((d) => !deletedDocuments.has(d.id))

  const selectedStatut = statuts.find((s) => s.id === step2.statutId)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step indicators */}
      <nav className="flex items-center justify-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold border-2 transition-colors",
                step === s.num
                  ? "border-primary bg-primary text-primary-foreground"
                  : step > s.num
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-card text-muted-foreground",
              )}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={cn(
                "hidden sm:inline text-xs font-medium",
                step === s.num ? "text-primary" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-border" />}
          </div>
        ))}
      </nav>

      {/* Step 1: Infos personnelles */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Infos personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-prenom">Prénom *</Label>
                <Input
                  id="field-prenom"
                  value={step1.prenom}
                  onChange={(e) => setStep1((p) => ({ ...p, prenom: e.target.value }))}
                  placeholder="Jean"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-nom">Nom *</Label>
                <Input
                  id="field-nom"
                  value={step1.nom}
                  onChange={(e) => setStep1((p) => ({ ...p, nom: e.target.value }))}
                  placeholder="Dupont"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-email">Email</Label>
                <Input
                  id="field-email"
                  type="email"
                  value={step1.email}
                  onChange={(e) => setStep1((p) => ({ ...p, email: e.target.value }))}
                  placeholder="jean.dupont@email.fr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-telephone">Téléphone</Label>
                <Input
                  id="field-telephone"
                  value={step1.telephone}
                  onChange={(e) => setStep1((p) => ({ ...p, telephone: e.target.value }))}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Infos professionnelles */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Infos professionnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Statut *</Label>
              <Select value={step2.statutId} onValueChange={handleStatutChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type de logement</Label>
              <Select
                value={step2.typeLogement}
                onValueChange={(v) => setStep2((p) => ({ ...p, typeLogement: v as TypeLogement }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPELOGEMENT_LABELS) as TypeLogement[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPELOGEMENT_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-revenus">Revenus mensuels (€)</Label>
              <Input
                id="field-revenus"
                type="number"
                min={0}
                value={step2.revenus}
                onChange={(e) => setStep2((p) => ({ ...p, revenus: e.target.value }))}
                placeholder="2500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredDocumentTypes.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-6 border border-dashed border-border rounded-lg">
                Sélectionnez d'abord un statut à l'étape précédente pour voir les documents requis.
              </p>
            )}

            {requiredDocumentTypes.map((dt) => {
              const existingDoc = visibleDocs.find(
                (d) => d.typeDocumentId === dt.id,
              )
              const pendingFile = pendingDocuments.get(dt.id)
              const hasFile = !!existingDoc || !!pendingFile
              const deletedDoc = existingDocuments.find(
                (d) => d.typeDocumentId === dt.id && deletedDocuments.has(d.id),
              )

              return (
                <div
                  key={dt.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3",
                    hasFile ? "border-green-300 bg-green-50" : "border-border bg-card",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0",
                      hasFile ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {hasFile ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{dt.nom}</p>
                    {existingDoc && !deletedDocuments.has(existingDoc.id) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {existingDoc.nomFichier}
                      </p>
                    )}
                    {pendingFile && (
                      <p className="text-xs text-primary truncate">
                        Nouveau: {pendingFile.name}
                      </p>
                    )}
                    {deletedDoc && (
                      <p className="text-xs text-destructive">Marqué pour suppression</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {existingDoc && !deletedDocuments.has(existingDoc.id) && !pendingFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExisting(existingDoc.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                    {deletedDoc && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUndoDelete(deletedDoc.id)}
                        className="text-xs text-muted-foreground"
                      >
                        Annuler
                      </Button>
                    )}
                    {!existingDoc || pendingFile || deletedDocuments.has(existingDoc?.id ?? "") ? (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileSelect(dt.id, file)
                          }}
                          ref={(el) => {
                            fileRefs.current.set(dt.id, el)
                          }}
                        />
                        <Button variant="outline" size="sm" asChild>
                          <span>{pendingFile || deletedDoc ? "Changer" : "Ajouter"}</span>
                        </Button>
                      </label>
                    ) : null}
                    {pendingFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFileRemove(dt.id)}
                        title="Retirer"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}

            <p className="text-xs text-muted-foreground text-center">
              Les documents peuvent être ajoutés plus tard. Cette étape est facultative.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Récapitulatif */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Infos personnelles</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Prénom</dt>
                <dd className="text-foreground">{step1.prenom || "—"}</dd>
                <dt className="text-muted-foreground">Nom</dt>
                <dd className="text-foreground">{step1.nom || "—"}</dd>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="text-foreground">{step1.email || "—"}</dd>
                <dt className="text-muted-foreground">Téléphone</dt>
                <dd className="text-foreground">{step1.telephone || "—"}</dd>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Infos professionnelles</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Statut</dt>
                <dd className="text-foreground">{selectedStatut?.nom || "—"}</dd>
                <dt className="text-muted-foreground">Type de logement</dt>
                <dd className="text-foreground">
                  {TYPELOGEMENT_LABELS[step2.typeLogement]}
                </dd>
                <dt className="text-muted-foreground">Revenus</dt>
                <dd className="text-foreground">
                  {step2.revenus ? `${Number(step2.revenus).toLocaleString("fr-FR")} €/mois` : "—"}
                </dd>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Documents</h3>
              {requiredDocumentTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun statut sélectionné</p>
              ) : (
                <ul className="space-y-1">
                  {requiredDocumentTypes.map((dt) => {
                    const existingDoc = visibleDocs.find((d) => d.typeDocumentId === dt.id)
                    const pendingFile = pendingDocuments.get(dt.id)
                    const hasDoc = !!existingDoc || !!pendingFile

                    return (
                      <li key={dt.id} className="flex items-center gap-2 text-sm">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            hasDoc ? "bg-green-500" : "bg-muted-foreground/40",
                          )}
                        />
                        <span className="text-foreground">{dt.nom}</span>
                        {hasDoc && (
                          <span className="text-xs text-muted-foreground">
                            — {existingDoc ? existingDoc.nomFichier : pendingFile?.name}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
              {pendingDocuments.size > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {pendingDocuments.size} nouveau(x) document(s) à uploader
                </p>
              )}
              {deletedDocuments.size > 0 && (
                <p className="text-xs text-destructive mt-1">
                  {deletedDocuments.size} document(s) à supprimer
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Rôle: <span className="font-medium text-foreground">{role === "co_candidat" ? "Co-candidat" : role === "garant" ? "Garant" : "Candidat"}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={handlePrev} disabled={loading}>
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={handleNext} disabled={!canGoNext()}>
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading
                ? "Enregistrement..."
                : initialData
                  ? "Enregistrer les modifications"
                  : "Créer"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
