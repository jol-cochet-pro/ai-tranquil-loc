import { apiClient, publicClient } from "./client";
import type { Document } from "./documents";
import type { DocumentType, Statut } from "./configuration";

export type StatutInvitation = "pending" | "viewed" | "completed";

export interface InvitationPersonne {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  revenus: number | null;
  role: "candidat" | "co_candidat" | "garant";
  statutId: string;
  typeLogement: "locataire" | "proprietaire" | "heberge";
  statut: { id: string; nom: string };
}

export interface Invitation {
  id: string;
  token: string;
  statut: StatutInvitation;
  personneId: string;
  personne: InvitationPersonne;
  documentTypes: DocumentType[];
  statuts: Statut[];
  documentsByStatut: Record<string, DocumentType[]>;
  createdAt: string;
  updatedAt: string;
}

export const invitationsApi = {
  create: (personneId: string) =>
    apiClient
      .post<Invitation>(`/dossier/personnes/${personneId}/invitations`)
      .then((r) => r.data),

  list: () =>
    apiClient.get<Invitation[]>("/dossier/invitations").then((r) => r.data),

  getByToken: (token: string) =>
    publicClient.get<Invitation>(`/invitations/${token}`).then((r) => r.data),

  updateByToken: (
    token: string,
    data: {
      nom?: string;
      prenom?: string;
      email?: string;
      telephone?: string;
      statutId?: string;
      typeLogement?: string;
      revenus?: number;
    },
  ) =>
    publicClient
      .put<Invitation>(`/invitations/${token}`, data)
      .then((r) => r.data),

  listDocumentsByToken: (token: string) =>
    publicClient
      .get<Document[]>(`/invitations/${token}/documents`)
      .then((r) => r.data),

  uploadDocumentByToken: (
    token: string,
    file: File,
    typeDocumentId: string,
    typeDocumentPersonnalise?: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("typeDocumentId", typeDocumentId);
    if (typeDocumentPersonnalise) {
      formData.append("typeDocumentPersonnalise", typeDocumentPersonnalise);
    }
    return publicClient
      .post<Document>(
        `/invitations/${token}/documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      )
      .then((r) => r.data);
  },

  getDocumentDownloadUrl: (token: string, documentId: string) =>
    `/invitations/${token}/documents/${documentId}/download`,

  deleteDocumentByToken: (token: string, documentId: string) =>
    publicClient.delete(`/invitations/${token}/documents/${documentId}`).then((r) => r.data),
};
